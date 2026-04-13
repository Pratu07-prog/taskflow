// Auth controller - Handle HTTP requests
import logger from '../middleware/logger.js';
import {
  createUser,
  getUserByEmail
} from '../services/auth.service.js';

export const register = async (req, res, next) => {
  try {
    const { name, email, password } = req.body;
    logger.debug('Auth register request', { name, email });

    // Validation
    if (!name || !email || !password) {
      return res.status(400).json({
        error: 'validation failed',
        fields: {
          ...((!name) && { name: 'is required' }),
          ...((!email) && { email: 'is required' }),
          ...((!password) && { password: 'is required' })
        }
      });
    }

    // Email format validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      logger.warn('Register validation failed: invalid email', { email });
      return res.status(400).json({
        error: 'validation failed',
        fields: { email: 'is invalid' }
      });
    }

    // Password strength validation (minimum 8 chars)
    if (password.length < 8) {
      logger.warn('Register validation failed: weak password', { email });
      return res.status(400).json({
        error: 'validation failed',
        fields: { password: 'must be at least 8 characters' }
      });
    }

    logger.info('Register attempt started', { email });
    const result = await createUser(name, email, password);

    if (!result.success) {
      logger.warn('Register failed', { email, error: result.error });
      return res.status(400).json({
        error: result.error || 'registration failed'
      });
    }

    logger.info({ userId: result.userId }, 'User registered successfully');

    res.status(201).json({
      message: 'User registered successfully',
      userId: result.userId,
      email: result.email
    });
  } catch (err) {
    logger.error(err, 'Registration error');
    next(err);
  }
};

export const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;
    logger.debug('Auth login request', { email });

    // Validation
    if (!email || !password) {
      return res.status(400).json({
        error: 'validation failed',
        fields: {
          ...((!email) && { email: 'is required' }),
          ...((!password) && { password: 'is required' })
        }
      });
    }

    const result = await getUserByEmail(email, password);

    if (!result.success) {
      logger.warn({ email }, 'Failed login attempt');
      return res.status(401).json({ error: 'unauthorized' });
    }

    logger.info({ userId: result.userId }, 'User logged in successfully');

    res.status(200).json({
      message: 'Login successful',
      token: result.token,
      userId: result.userId,
      email: result.email
    });
  } catch (err) {
    logger.error(err, 'Login error');
    next(err);
  }
};

export default {
  register,
  login
};
