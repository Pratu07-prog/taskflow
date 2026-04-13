// Projects service - Database operations
import { query } from '../config/db.js';
import { v4 as uuidv4 } from 'uuid';
import logger from '../middleware/logger.js';

export const getAllProjectsByUser = async (userId, offset, limit) => {
  try {
    // Try to get from cache
    const cacheKey = `projects:${userId}`;

    // For now, skip cache for pagination (will implement pagination cache later)
    // Get total count
    const countResult = await query(
      'SELECT COUNT(*) FROM projects WHERE owner_id = $1',
      [userId]
    );

    const total = parseInt(countResult.rows[0].count, 10);

    // Get paginated results
    const result = await query(
      `SELECT id, name, description, owner_id, created_at, updated_at 
       FROM projects 
       WHERE owner_id = $1 
       ORDER BY created_at DESC 
       LIMIT $2 OFFSET $3`,
      [userId, limit, offset]
    );

    return {
      success: true,
      data: result.rows,
      total
    };
  } catch (err) {
    logger.error(err, 'Error fetching projects');
    return { success: false, error: 'Database error' };
  }
};

export const getProjectById = async (projectId, userId) => {
  try {
    const result = await query(
      `SELECT id, name, description, owner_id, created_at, updated_at 
       FROM projects 
       WHERE id = $1`,
      [projectId]
    );

    if (result.rows.length === 0) {
      return { success: false, error: 'not_found' };
    }

    const project = result.rows[0];

    // Check authorization
    if (project.owner_id !== userId) {
      return { success: false, error: 'forbidden' };
    }

    // Get tasks for this project
    const tasksResult = await query(
      `SELECT id, title, description, status, priority, project_id, 
              assignee_id, due_date, created_at, updated_at 
       FROM tasks 
       WHERE project_id = $1 
       ORDER BY created_at DESC`,
      [projectId]
    );

    const projectData = {
      ...project,
      tasks: tasksResult.rows
    };

    return { success: true, data: projectData };
  } catch (err) {
    logger.error(err, 'Error fetching project');
    return { success: false, error: 'Database error' };
  }
};

export const createProject = async (name, description, ownerId) => {
  try {
    const projectId = uuidv4();

    const result = await query(
      `INSERT INTO projects (id, name, description, owner_id, created_at, updated_at)
       VALUES ($1, $2, $3, $4, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
       RETURNING id, name, description, owner_id`,
      [projectId, name, description, ownerId]
    );

    if (result.rows.length === 0) {
      return { success: false, error: 'Failed to create project' };
    }

    return {
      success: true,
      projectId: result.rows[0].id,
      name: result.rows[0].name,
      description: result.rows[0].description,
      ownerId: result.rows[0].owner_id
    };
  } catch (err) {
    logger.error(err, 'Error creating project');
    return { success: false, error: 'Database error' };
  }
};

export const updateProject = async (projectId, updates, userId) => {
  try {
    // Verify ownership
    const projectResult = await query(
      'SELECT owner_id FROM projects WHERE id = $1',
      [projectId]
    );

    if (projectResult.rows.length === 0) {
      return { success: false, error: 'not_found' };
    }

    const project = projectResult.rows[0];

    if (project.owner_id !== userId) {
      return { success: false, error: 'forbidden' };
    }

    // Build dynamic update query
    const updateFields = [];
    const values = [];
    let paramIndex = 1;

    if (updates.name !== undefined) {
      updateFields.push(`name = $${paramIndex}`);
      values.push(updates.name);
      paramIndex++;
    }

    if (updates.description !== undefined) {
      updateFields.push(`description = $${paramIndex}`);
      values.push(updates.description);
      paramIndex++;
    }

    updateFields.push(`updated_at = CURRENT_TIMESTAMP`);
    values.push(projectId);

    const query_str = `UPDATE projects SET ${updateFields.join(', ')} WHERE id = $${paramIndex} RETURNING id, name, description`;

    const result = await query(query_str, values);

    if (result.rows.length === 0) {
      return { success: false, error: 'not_found' };
    }

    // Invalidate cache
    await cacheDel(`project:${projectId}`);
    await cacheInvalidate(`projects:${userId}`);

    return {
      success: true,
      projectId: result.rows[0].id,
      name: result.rows[0].name,
      description: result.rows[0].description
    };
  } catch (err) {
    logger.error(err, 'Error updating project');
    return { success: false, error: 'Database error' };
  }
};

export const deleteProject = async (projectId, userId) => {
  try {
    // Verify ownership
    const projectResult = await query(
      'SELECT owner_id FROM projects WHERE id = $1',
      [projectId]
    );

    if (projectResult.rows.length === 0) {
      return { success: false, error: 'not_found' };
    }

    const project = projectResult.rows[0];

    if (project.owner_id !== userId) {
      return { success: false, error: 'forbidden' };
    }

    // Delete project (tasks will cascade delete)
    await query('DELETE FROM projects WHERE id = $1', [projectId]);

    // Invalidate cache
    await cacheDel(`project:${projectId}`);
    await cacheInvalidate(`projects:${userId}`);

    return { success: true };
  } catch (err) {
    logger.error(err, 'Error deleting project');
    return { success: false, error: 'Database error' };
  }
};

export const getProjectStats = async (projectId, userId) => {
  try {
    // Verify user has access to project
    const projectResult = await query(
      'SELECT owner_id FROM projects WHERE id = $1',
      [projectId]
    );

    if (projectResult.rows.length === 0) {
      return { success: false, error: 'not_found' };
    }

    const project = projectResult.rows[0];

    if (project.owner_id !== userId) {
      return { success: false, error: 'forbidden' };
    }

    // Get task statistics
    const statsResult = await query(
      `SELECT 
         status, 
         COUNT(*) as count,
         assignee_id
       FROM tasks 
       WHERE project_id = $1 
       GROUP BY status, assignee_id
       ORDER BY status`,
      [projectId]
    );

    // Format stats by status
    const statsByStatus = {
      todo: 0,
      in_progress: 0,
      done: 0
    };

    const statsByAssignee = {};
    let totalTasks = 0;

    statsResult.rows.forEach(row => {
      statsByStatus[row.status] += parseInt(row.count, 10);
      totalTasks += parseInt(row.count, 10);

      if (!statsByAssignee[row.assignee_id]) {
        statsByAssignee[row.assignee_id] = 0;
      }
      statsByAssignee[row.assignee_id] += parseInt(row.count, 10);
    });

    return {
      success: true,
      data: {
        projectId,
        totalTasks,
        byStatus: statsByStatus,
        byAssignee: statsByAssignee
      }
    };
  } catch (err) {
    logger.error(err, 'Error getting project stats');
    return { success: false, error: 'Database error' };
  }
};

export default {
  getAllProjectsByUser,
  getProjectById,
  createProject,
  updateProject,
  deleteProject,
  getProjectStats
};
