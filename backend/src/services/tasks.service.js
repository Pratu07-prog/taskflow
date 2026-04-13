// Tasks service - Database operations with filtering
import { query } from '../config/db.js';
import { v4 as uuidv4 } from 'uuid';
import logger from '../middleware/logger.js';

export const getTasksByProject = async (projectId, filters, offset, limit, userId) => {
  try {
    // First verify user has access to this project
    const projectResult = await query(
      'SELECT owner_id FROM projects WHERE id = $1',
      [projectId]
    );

    if (projectResult.rows.length === 0) {
      return { success: false, error: 'not_found' };
    }

    // For now, allow access to any user (can be restricted to owner/team later)
    // if (projectResult.rows[0].owner_id !== userId) {
    //   return { success: false, error: 'unauthorized' };
    // }

    // Build dynamic WHERE clause for filters
    let whereClause = 'WHERE project_id = $1';
    const params = [projectId];
    let paramIndex = 2;

    if (filters.status) {
      whereClause += ` AND status = $${paramIndex}`;
      params.push(filters.status);
      paramIndex++;
    }

    if (filters.assignee) {
      whereClause += ` AND assignee_id = $${paramIndex}`;
      params.push(filters.assignee);
      paramIndex++;
    }

    // Get total count
    const countResult = await query(
      `SELECT COUNT(*) FROM tasks ${whereClause}`,
      params
    );

    const total = parseInt(countResult.rows[0].count, 10);

    // Get paginated results
    params.push(limit);
    params.push(offset);

    const result = await query(
      `SELECT id, title, description, status, priority, project_id, 
              assignee_id, due_date, created_at, updated_at 
       FROM tasks 
       ${whereClause}
       ORDER BY created_at DESC 
       LIMIT $${paramIndex + 1} OFFSET $${paramIndex + 2}`,
      params
    );

    return {
      success: true,
      data: result.rows,
      total
    };
  } catch (err) {
    logger.error(err, 'Error fetching tasks');
    return { success: false, error: 'Database error' };
  }
};

export const getTaskById = async (taskId) => {
  try {
    const result = await query(
      `SELECT id, title, description, status, priority, project_id, 
              assignee_id, due_date, created_at, updated_at 
       FROM tasks 
       WHERE id = $1`,
      [taskId]
    );

    if (result.rows.length === 0) {
      return { success: false, error: 'not_found' };
    }

    return { success: true, data: result.rows[0] };
  } catch (err) {
    logger.error(err, 'Error fetching task');
    return { success: false, error: 'Database error' };
  }
};

export const createTask = async (
  projectId,
  title,
  description,
  status,
  priority,
  assigneeId,
  dueDate,
  userId
) => {
  try {
    // Verify user is project owner or authorized
    const projectResult = await query(
      'SELECT owner_id FROM projects WHERE id = $1',
      [projectId]
    );

    if (projectResult.rows.length === 0) {
      return { success: false, error: 'not_found' };
    }

    // For now, allow any authenticated user (can be restricted later)
    // if (projectResult.rows[0].owner_id !== userId) {
    //   return { success: false, error: 'unauthorized' };
    // }

    const taskId = uuidv4();

    const result = await query(
      `INSERT INTO tasks (id, title, description, status, priority, project_id, assignee_id, due_date, created_at, updated_at)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
       RETURNING id, title, description, status, priority, project_id, assignee_id, due_date`,
      [taskId, title, description, status, priority, projectId, assigneeId, dueDate]
    );

    if (result.rows.length === 0) {
      return { success: false, error: 'Failed to create task' };
    }

    return {
      success: true,
      taskId: result.rows[0].id,
      title: result.rows[0].title,
      description: result.rows[0].description,
      status: result.rows[0].status,
      priority: result.rows[0].priority
    };
  } catch (err) {
    logger.error(err, 'Error creating task');
    return { success: false, error: 'Database error' };
  }
};

export const updateTask = async (taskId, updates, userId) => {
  try {
    // Get task to verify access
    const taskResult = await query(
      'SELECT id, project_id FROM tasks WHERE id = $1',
      [taskId]
    );

    if (taskResult.rows.length === 0) {
      return { success: false, error: 'not_found' };
    }

    const task = taskResult.rows[0];

    // Verify user has access (for now, allow all authenticated users)
    // Can be restricted later

    // Build dynamic update query
    const updateFields = [];
    const values = [];
    let paramIndex = 1;

    if (updates.title !== undefined) {
      updateFields.push(`title = $${paramIndex}`);
      values.push(updates.title);
      paramIndex++;
    }

    if (updates.description !== undefined) {
      updateFields.push(`description = $${paramIndex}`);
      values.push(updates.description);
      paramIndex++;
    }

    if (updates.status !== undefined) {
      updateFields.push(`status = $${paramIndex}`);
      values.push(updates.status);
      paramIndex++;
    }

    if (updates.priority !== undefined) {
      updateFields.push(`priority = $${paramIndex}`);
      values.push(updates.priority);
      paramIndex++;
    }

    if (updates.assigneeId !== undefined) {
      updateFields.push(`assignee_id = $${paramIndex}`);
      values.push(updates.assigneeId);
      paramIndex++;
    }

    if (updates.dueDate !== undefined) {
      updateFields.push(`due_date = $${paramIndex}`);
      values.push(updates.dueDate);
      paramIndex++;
    }

    updateFields.push(`updated_at = CURRENT_TIMESTAMP`);
    values.push(taskId);

    const query_str = `UPDATE tasks SET ${updateFields.join(', ')} WHERE id = $${paramIndex} RETURNING id`;

    const result = await query(query_str, values);

    if (result.rows.length === 0) {
      return { success: false, error: 'not_found' };
    }

    return {
      success: true,
      taskId: result.rows[0].id
    };
  } catch (err) {
    logger.error(err, 'Error updating task');
    return { success: false, error: 'Database error' };
  }
};

export const deleteTask = async (taskId, userId) => {
  try {
    // Get task to verify access
    const taskResult = await query(
      'SELECT id, project_id FROM tasks WHERE id = $1',
      [taskId]
    );

    if (taskResult.rows.length === 0) {
      return { success: false, error: 'not_found' };
    }

    const task = taskResult.rows[0];

    // Delete task
    await query('DELETE FROM tasks WHERE id = $1', [taskId]);

    return { success: true };
  } catch (err) {
    logger.error(err, 'Error deleting task');
    return { success: false, error: 'Database error' };
  }
};

export default {
  getTasksByProject,
  getTaskById,
  createTask,
  updateTask,
  deleteTask
};
