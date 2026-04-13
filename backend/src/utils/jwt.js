// JWT token generation and verification
// Will be implemented in Step 6

import jwt from 'jsonwebtoken';
import env from '../config/env.js';

export const generateToken = (payload) => {
  return jwt.sign(payload, env.JWT_SECRET, {
    expiresIn: env.JWT_EXPIRY
  });
};

export const verifyToken = (token) => {
  try {
    return jwt.verify(token, env.JWT_SECRET);
  } catch (err) {
    return null;
  }
};

export const decodeToken = (token) => {
  try {
    return jwt.decode(token, { complete: true });
  } catch (err) {
    return null;
  }
};

export default {
  generateToken,
  verifyToken,
  decodeToken
};
