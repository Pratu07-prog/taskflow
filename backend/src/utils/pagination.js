// Pagination helper for list endpoints
// Will be implemented in Step 8

export const getPaginationParams = (query) => {
  const page = Math.max(1, parseInt(query.page) || 1);
  const limit = Math.min(100, Math.max(1, parseInt(query.limit) || 20));
  const offset = (page - 1) * limit;

  return { page, limit, offset };
};

export const getPaginationMetadata = (page, limit, total) => {
  return {
    page,
    limit,
    total,
    totalPages: Math.ceil(total / limit),
    hasNextPage: page < Math.ceil(total / limit),
    hasPreviousPage: page > 1
  };
};

export const formatPaginatedResponse = (data, page, limit, total) => {
  return {
    data,
    pagination: getPaginationMetadata(page, limit, total)
  };
};

export default {
  getPaginationParams,
  getPaginationMetadata,
  formatPaginatedResponse
};
