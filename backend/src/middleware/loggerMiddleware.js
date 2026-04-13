import logger from './logger.js';

const requestLogger = (req, res, next) => {
  const startTime = Date.now();
  const { password, ...bodyWithoutPassword } = req.body || {};

  logger.http('Incoming request', {
    method: req.method,
    url: req.originalUrl,
    params: req.params,
    query: req.query,
    body: bodyWithoutPassword
  });

  res.on('finish', () => {
    const duration = Date.now() - startTime;
    logger.info('Request completed', {
      method: req.method,
      url: req.originalUrl,
      statusCode: res.statusCode,
      durationMs: duration
    });
  });

  next();
};

export default requestLogger;
