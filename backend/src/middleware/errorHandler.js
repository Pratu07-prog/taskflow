// Global error handler middleware
// Will be implemented in Step 4

import logger from './logger.js';

export const errorHandler = (err, req, res, next) => {
  logger.error(err);

  if (res.headersSent) {
    return next(err);
  }

  const statusCode = err.statusCode || 500;
  const message = err.message || 'Internal Server Error';

  res.status(statusCode).json({
    error: message,
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
  });
};

export default errorHandler;
