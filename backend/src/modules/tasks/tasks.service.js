// Tasks service - Database operations
// Will be implemented in Step 8

export const getTasksByProject = async (projectId, filters, offset, limit) => {
  // To be implemented
};

export const getTaskById = async (taskId) => {
  // To be implemented
};

export const createTask = async (projectId, title, description, status, priority, assigneeId, dueDate) => {
  // To be implemented
};

export const updateTask = async (taskId, updates) => {
  // To be implemented
};

export const deleteTask = async (taskId) => {
  // To be implemented
};

export default {
  getTasksByProject,
  getTaskById,
  createTask,
  updateTask,
  deleteTask
};
