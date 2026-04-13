-- Seed data for TaskFlow
-- This will be loaded by npm run seed

-- Insert a test user (password: TestPass123 - will be hashed in service layer)
INSERT INTO users (id, name, email, password, created_at) VALUES
  ('550e8400-e29b-41d4-a716-446655440001', 'John Doe', 'john@example.com', 'hashed_password_placeholder', CURRENT_TIMESTAMP);

-- Insert a test project
INSERT INTO projects (id, name, description, owner_id, created_at) VALUES
  ('650e8400-e29b-41d4-a716-446655440001', 'My First Project', 'A test project to manage tasks', '550e8400-e29b-41d4-a716-446655440001', CURRENT_TIMESTAMP);

-- Insert test tasks with different statuses
INSERT INTO tasks (id, title, description, status, priority, project_id, assignee_id, due_date, created_at) VALUES
  ('750e8400-e29b-41d4-a716-446655440001', 'Design API Schema', 'Create database schema for TaskFlow', 'done', 'high', '650e8400-e29b-41d4-a716-446655440001', '550e8400-e29b-41d4-a716-446655440001', '2024-04-15', CURRENT_TIMESTAMP),
  ('750e8400-e29b-41d4-a716-446655440002', 'Implement Auth', 'Build JWT authentication module', 'in_progress', 'high', '650e8400-e29b-41d4-a716-446655440001', '550e8400-e29b-41d4-a716-446655440001', '2024-04-20', CURRENT_TIMESTAMP),
  ('750e8400-e29b-41d4-a716-446655440003', 'Write Tests', 'Add integration tests for all endpoints', 'todo', 'medium', '650e8400-e29b-41d4-a716-446655440001', NULL, '2024-05-01', CURRENT_TIMESTAMP);
