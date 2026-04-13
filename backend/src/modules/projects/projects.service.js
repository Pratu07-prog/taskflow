// Projects service - Database operations & caching
// Will be implemented in Step 7

export const getAllProjectsByUser = async (userId, offset, limit) => {
  // To be implemented
};

export const getProjectById = async (projectId) => {
  // To be implemented
};

export const createProject = async (name, description, ownerId) => {
  // To be implemented
};

export const updateProject = async (projectId, name, description) => {
  // To be implemented
};

export const deleteProject = async (projectId) => {
  // To be implemented
};

export const getProjectStats = async (projectId) => {
  // To be implemented
};

export default {
  getAllProjectsByUser,
  getProjectById,
  createProject,
  updateProject,
  deleteProject,
  getProjectStats
};
