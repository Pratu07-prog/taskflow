// JWT authentication middleware
// Will be implemented in Step 6

import { verifyToken } from '../utils/jwt.js';
import logger from './logger.js';

export const authenticate = (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ error: 'unauthorized' });
    }

    const token = authHeader.slice(7); // Remove "Bearer " prefix
    const decoded = verifyToken(token);

    if (!decoded) {
      return res.status(401).json({ error: 'unauthorized' });
    }

    req.user = decoded;
    next();
  } catch (err) {
    logger.error(err, 'Auth middleware error');
    res.status(500).json({ error: 'internal server error' });
  }
};

export default authenticate;
