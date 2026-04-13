// Projects controller - Handle HTTP requests
import logger from '../middleware/logger.js';
import {
  getAllProjectsByUser,
  getProjectById,
  createProject as createProjectService,
  updateProject as updateProjectService,
  deleteProject as deleteProjectService,
  getProjectStats as getProjectStatsService
} from '../services/projects.service.js';
import { getPaginationParams, formatPaginatedResponse } from '../utils/pagination.js';

export const listProjects = async (req, res, next) => {
  try {
    logger.debug('Projects list request', { query: req.query, userId: req.user?.userId });
    const { page, limit, offset } = getPaginationParams(req.query);

    const result = await getAllProjectsByUser(req.user.userId, offset, limit);

    if (!result.success) {
      logger.error(result.error, 'Error fetching projects');
      return res.status(500).json({ error: 'Internal server error', message: 'An unexpected error occurred while fetching projects' });
    }

    const response = formatPaginatedResponse(result.data, page, limit, result.total);

    res.status(200).json(response);
  } catch (err) {
    logger.error(err, 'Error listing projects');
    next(err);
  }
};

export const getProject = async (req, res, next) => {
  try {
    const { id } = req.params;

    const result = await getProjectById(id, req.user.userId);

    if (!result.success) {
      if (result.error === 'not_found') {
        return res.status(404).json({ error: 'not found' });
      }
      if (result.error === 'forbidden') {
        return res.status(403).json({ error: 'forbidden' });
      }
      return res.status(500).json({ error: 'internal server error' });
    }

    res.status(200).json(result.data);
  } catch (err) {
    logger.error(err, 'Error getting project');
    next(err);
  }
};

export const createProject = async (req, res, next) => {
  try {
    logger.debug('Create project request', { body: req.body, userId: req.user?.userId });
    const { name, description } = req.body;

    if (!name) {
      return res.status(400).json({
        error: 'validation failed',
        fields: { name: 'is required' }
      });
    }

    if (name.length < 3 || name.length > 255) {
      return res.status(400).json({
        error: 'validation failed',
        fields: { name: 'must be between 3 and 255 characters' }
      });
    }

    const result = await createProjectService(name, description || null, req.user.userId);

    if (!result.success) {
      logger.error(result.error, 'Error creating project');
      return res.status(500).json({ error: 'Internal server error', message: 'An unexpected error occurred while creating the project' });
    }

    logger.info({ projectId: result.projectId, userId: req.user.userId }, 'Project created');

    res.status(201).json({
      message: 'Project created successfully',
      projectId: result.projectId,
      name: result.name,
      description: result.description,
      ownerId: result.ownerId
    });
  } catch (err) {
    logger.error(err, 'Error creating project');
    next(err);
  }
};

export const updateProject = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { name, description } = req.body;

    if (!name && !description) {
      return res.status(400).json({
        error: 'validation failed',
        fields: { body: 'at least one field (name, description) is required' }
      });
    }

    if (name && (name.length < 3 || name.length > 255)) {
      return res.status(400).json({
        error: 'validation failed',
        fields: { name: 'must be between 3 and 255 characters' }
      });
    }

    const result = await updateProjectService(id, { name, description }, req.user.userId);

    if (!result.success) {
      if (result.error === 'not_found') {
        return res.status(404).json({ error: 'not found' });
      }
      if (result.error === 'forbidden') {
        return res.status(403).json({ error: 'forbidden' });
      }
      return res.status(500).json({ error: 'internal server error' });
    }

    logger.info({ projectId: id, userId: req.user.userId }, 'Project updated');

    res.status(200).json({
      message: 'Project updated successfully',
      projectId: result.projectId,
      name: result.name,
      description: result.description
    });
  } catch (err) {
    logger.error(err, 'Error updating project');
    next(err);
  }
};

export const deleteProject = async (req, res, next) => {
  try {
    const { id } = req.params;

    const result = await deleteProjectService(id, req.user.userId);

    if (!result.success) {
      if (result.error === 'not_found') {
        return res.status(404).json({ error: 'Project not found', message: 'The specified project does not exist or you do not have access to it' });
      }
      if (result.error === 'forbidden') {
        return res.status(403).json({ error: 'Access denied', message: 'You do not have permission to delete this project' });
      }
      return res.status(500).json({ error: 'Internal server error', message: 'An unexpected error occurred while deleting the project' });
    }

    logger.info({ projectId: id, userId: req.user.userId }, 'Project deleted');

    res.status(200).json({ message: 'Project deleted successfully' });
  } catch (err) {
    logger.error(err, 'Error deleting project');
    next(err);
  }
};

export const getProjectStats = async (req, res, next) => {
  try {
    const { id } = req.params;

    const result = await getProjectStatsService(id, req.user.userId);

    if (!result.success) {
      if (result.error === 'not_found') {
        return res.status(404).json({ error: 'Project not found', message: 'The specified project does not exist or you do not have access to it' });
      }
      if (result.error === 'forbidden') {
        return res.status(403).json({ error: 'Access denied', message: 'You do not have permission to access this project' });
      }
      return res.status(500).json({ error: 'Internal server error', message: 'An unexpected error occurred while fetching project statistics' });
    }

    res.status(200).json(result.data);
  } catch (err) {
    logger.error(err, 'Error getting project stats');
    next(err);
  }
};

export default {
  listProjects,
  getProject,
  createProject,
  updateProject,
  deleteProject,
  getProjectStats
};
