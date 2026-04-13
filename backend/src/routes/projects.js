// Projects routes - CRUD operations
import express from 'express';
import {
  listProjects,
  getProject,
  createProject,
  updateProject,
  deleteProject,
  getProjectStats
} from '../controllers/projects.controller.js';
import authenticate from '../middleware/auth.js';

const router = express.Router();

// All project routes require authentication
router.use(authenticate);

router.get('/', listProjects);
router.post('/', createProject);
router.get('/:id', getProject);
router.patch('/:id', updateProject);
router.delete('/:id', deleteProject);
router.get('/:id/stats', getProjectStats);

export default router;
