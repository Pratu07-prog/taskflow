-- Rollback: Drop users table
-- This file will be executed with: npm run migrate:down

DROP TABLE IF EXISTS users CASCADE;
