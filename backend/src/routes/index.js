// Central routes configuration
import express from 'express';
import authRoutes from './auth.js';
import projectsRoutes from './projects.js';
import tasksRoutes from './tasks.js';

const router = express.Router();

// Mount all routes
router.use('/auth', authRoutes);
router.use('/projects', projectsRoutes);
router.use('/tasks', tasksRoutes);

export default router;
