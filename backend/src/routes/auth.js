// Auth routes - Register & Login
import express from 'express';
import { register, login } from '../controllers/auth.controller.js';
import { authLimiter } from '../middleware/rateLimiter.js';

const router = express.Router();

// Rate limit auth endpoints
router.post('/register', authLimiter, register);
router.post('/login', authLimiter, login);

export default router;
