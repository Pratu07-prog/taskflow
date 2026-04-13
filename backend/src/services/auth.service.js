// Auth service - Database operations
import { query } from '../config/db.js';
import { hashPassword, comparePassword } from '../utils/bcrypt.js';
import { generateToken } from '../utils/jwt.js';
import { v4 as uuidv4 } from 'uuid';
import logger from '../middleware/logger.js';

export const createUser = async (name, email, hashedPassword) => {
  try {
    // Check if user already exists
    const existing = await query(
      'SELECT id FROM users WHERE email = $1',
      [email]
    );

    if (existing.rows.length > 0) {
      return {
        success: false,
        error: 'Email already in use'
      };
    }

    // Hash password with bcrypt
    const passwordHash = await hashPassword(hashedPassword);

    // Create user
    const userId = uuidv4();
    const result = await query(
      `INSERT INTO users (id, name, email, password, created_at) 
       VALUES ($1, $2, $3, $4, CURRENT_TIMESTAMP)
       RETURNING id, email, name`,
      [userId, name, email, passwordHash]
    );

    if (result.rows.length === 0) {
      return { success: false, error: 'Failed to create user' };
    }

    return {
      success: true,
      userId: result.rows[0].id,
      email: result.rows[0].email,
      name: result.rows[0].name
    };
  } catch (err) {
    logger.error(err, 'Error creating user');
    return { success: false, error: 'Database error' };
  }
};

export const getUserByEmail = async (email, password) => {
  try {
    const result = await query(
      'SELECT id, email, password, name FROM users WHERE email = $1',
      [email]
    );

    if (result.rows.length === 0) {
      return { success: false, error: 'User not found' };
    }

    const user = result.rows[0];

    // Compare password
    const passwordMatch = await comparePassword(password, user.password);

    if (!passwordMatch) {
      return { success: false, error: 'Invalid password' };
    }

    // Generate JWT token
    const token = generateToken({
      userId: user.id,
      email: user.email,
      name: user.name
    });

    return {
      success: true,
      userId: user.id,
      email: user.email,
      name: user.name,
      token
    };
  } catch (err) {
    logger.error(err, 'Error getting user by email');
    return { success: false, error: 'Database error' };
  }
};

export const getUserById = async (userId) => {
  try {
    const result = await query(
      'SELECT id, email, name, created_at FROM users WHERE id = $1',
      [userId]
    );

    if (result.rows.length === 0) {
      return { success: false, error: 'User not found' };
    }

    return {
      success: true,
      data: result.rows[0]
    };
  } catch (err) {
    logger.error(err, 'Error getting user by ID');
    return { success: false, error: 'Database error' };
  }
};

export default {
  createUser,
  getUserByEmail,
  getUserById
};
