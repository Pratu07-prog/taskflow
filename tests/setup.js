// Jest test setup
// Will be implemented in Step 10

// Set test environment variables
process.env.NODE_ENV = 'test';
process.env.DATABASE_URL = 'postgresql://test:test@localhost:5432/taskflow_test';
process.env.JWT_SECRET = 'test_secret_key_for_testing';
process.env.REDIS_HOST = 'localhost';
process.env.REDIS_PORT = '6379';
