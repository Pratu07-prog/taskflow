// Tasks routes - CRUD operations
import express from 'express';
import {
  listTasks,
  createTask,
  updateTask,
  deleteTask
} from '../controllers/tasks.controller.js';
import authenticate from '../middleware/auth.js';

const router = express.Router();

// All task routes require authentication
router.use(authenticate);

// Tasks under projects
router.get('/projects/:projectId/tasks', listTasks);
router.post('/projects/:projectId/tasks', createTask);

// Individual task operations
router.patch('/:id', updateTask);
router.delete('/:id', deleteTask);

export default router;
