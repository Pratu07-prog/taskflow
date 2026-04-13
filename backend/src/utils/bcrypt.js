// Password hashing with bcrypt
// Will be implemented in Step 5

import bcrypt from 'bcrypt';
import env from '../config/env.js';

export const hashPassword = async (password) => {
  const salt = await bcrypt.genSalt(env.BCRYPT_COST);
  return bcrypt.hash(password, salt);
};

export const comparePassword = async (password, hashedPassword) => {
  return bcrypt.compare(password, hashedPassword);
};

export default {
  hashPassword,
  comparePassword
};
