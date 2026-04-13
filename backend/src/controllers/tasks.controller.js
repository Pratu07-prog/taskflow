// Tasks controller - Handle HTTP requests
import logger from '../middleware/logger.js';
import {
  getTasksByProject,
  getTaskById,
  createTask as createTaskService,
  updateTask as updateTaskService,
  deleteTask as deleteTaskService
} from '../services/tasks.service.js';
import { getPaginationParams, formatPaginatedResponse } from '../utils/pagination.js';

export const listTasks = async (req, res, next) => {
  try {
    logger.debug('Tasks list request', { params: req.params, query: req.query, userId: req.user?.userId });
    const { projectId } = req.params;
    const { page, limit, offset } = getPaginationParams(req.query);
    const { status, assignee } = req.query;

    const filters = {};
    if (status) filters.status = status;
    if (assignee) filters.assignee = assignee;

    const result = await getTasksByProject(projectId, filters, offset, limit, req.user.userId);

    if (!result.success) {
      if (result.error === 'unauthorized') {
        return res.status(403).json({ error: 'Access denied', message: 'You do not have permission to access this project' });
      }
      if (result.error === 'not_found') {
        return res.status(404).json({ error: 'Project not found', message: 'The specified project does not exist or you do not have access to it' });
      }
      return res.status(500).json({ error: 'Internal server error', message: 'An unexpected error occurred while fetching tasks' });
    }

    const response = formatPaginatedResponse(result.data, page, limit, result.total);
    res.status(200).json(response);
  } catch (err) {
    logger.error(err, 'Error listing tasks');
    next(err);
  }
};

export const createTask = async (req, res, next) => {
  try {
    logger.debug('Create task request', { params: req.params, body: req.body, userId: req.user?.userId });
    const { projectId } = req.params;
    const { title, description, status, priority, assigneeId, dueDate } = req.body;

    if (!title) {
      return res.status(400).json({
        error: 'validation failed',
        fields: { title: 'is required' }
      });
    }

    if (title.length < 3 || title.length > 255) {
      return res.status(400).json({
        error: 'validation failed',
        fields: { title: 'must be between 3 and 255 characters' }
      });
    }

    if (status && !['todo', 'in_progress', 'done'].includes(status)) {
      return res.status(400).json({
        error: 'validation failed',
        fields: { status: 'must be one of: todo, in_progress, done' }
      });
    }

    if (priority && !['low', 'medium', 'high'].includes(priority)) {
      return res.status(400).json({
        error: 'validation failed',
        fields: { priority: 'must be one of: low, medium, high' }
      });
    }

    const result = await createTaskService(
      projectId,
      title,
      description || null,
      status || 'todo',
      priority || 'medium',
      assigneeId || null,
      dueDate || null,
      req.user.userId
    );

    if (!result.success) {
      if (result.error === 'unauthorized') {
        return res.status(403).json({ error: 'Access denied', message: 'You do not have permission to create tasks in this project' });
      }
      if (result.error === 'not_found') {
        return res.status(404).json({ error: 'Project not found', message: 'The specified project does not exist or you do not have access to it' });
      }
      return res.status(500).json({ error: 'Internal server error', message: 'An unexpected error occurred while creating the task' });
    }

    logger.info({ taskId: result.taskId, projectId }, 'Task created');

    res.status(201).json({
      message: 'Task created successfully',
      taskId: result.taskId,
      title: result.title,
      status: result.status,
      priority: result.priority
    });
  } catch (err) {
    logger.error(err, 'Error creating task');
    next(err);
  }
};

export const updateTask = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { title, description, status, priority, assigneeId, dueDate } = req.body;

    const updates = {};
    if (title !== undefined) updates.title = title;
    if (description !== undefined) updates.description = description;
    if (status !== undefined) updates.status = status;
    if (priority !== undefined) updates.priority = priority;
    if (assigneeId !== undefined) updates.assigneeId = assigneeId;
    if (dueDate !== undefined) updates.dueDate = dueDate;

    if (Object.keys(updates).length === 0) {
      return res.status(400).json({
        error: 'validation failed',
        fields: { body: 'at least one field is required' }
      });
    }

    if (updates.title && (updates.title.length < 3 || updates.title.length > 255)) {
      return res.status(400).json({
        error: 'validation failed',
        fields: { title: 'must be between 3 and 255 characters' }
      });
    }

    if (updates.status && !['todo', 'in_progress', 'done'].includes(updates.status)) {
      return res.status(400).json({
        error: 'validation failed',
        fields: { status: 'must be one of: todo, in_progress, done' }
      });
    }

    if (updates.priority && !['low', 'medium', 'high'].includes(updates.priority)) {
      return res.status(400).json({
        error: 'validation failed',
        fields: { priority: 'must be one of: low, medium, high' }
      });
    }

    const result = await updateTaskService(id, updates, req.user.userId);

    if (!result.success) {
      if (result.error === 'not_found') {
        return res.status(404).json({ error: 'not found' });
      }
      if (result.error === 'unauthorized') {
        return res.status(403).json({ error: 'forbidden' });
      }
      return res.status(500).json({ error: 'internal server error' });
    }

    logger.info({ taskId: id, userId: req.user.userId }, 'Task updated');

    res.status(200).json({
      message: 'Task updated successfully',
      taskId: result.taskId
    });
  } catch (err) {
    logger.error(err, 'Error updating task');
    next(err);
  }
};

export const deleteTask = async (req, res, next) => {
  try {
    const { id } = req.params;

    const result = await deleteTaskService(id, req.user.userId);

    if (!result.success) {
      if (result.error === 'not_found') {
        return res.status(404).json({ error: 'not found' });
      }
      if (result.error === 'unauthorized') {
        return res.status(403).json({ error: 'forbidden' });
      }
      return res.status(500).json({ error: 'internal server error' });
    }

    logger.info({ taskId: id, userId: req.user.userId }, 'Task deleted');

    res.status(200).json({ message: 'Task deleted successfully' });
  } catch (err) {
    logger.error(err, 'Error deleting task');
    next(err);
  }
};

export default {
  listTasks,
  createTask,
  updateTask,
  deleteTask
};
