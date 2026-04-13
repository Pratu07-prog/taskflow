// Main Express application entry point
// Will be fully implemented in Step 4

import express from 'express';
import swaggerUi from 'swagger-ui-express';
import swaggerDocument from './swagger.js';
import env from './config/env.js';
import db from './config/db.js';
import logger from './middleware/logger.js';
import requestLogger from './middleware/loggerMiddleware.js';
import errorHandler from './middleware/errorHandler.js';
import routes from './routes/index.js';

const app = express();

// Middleware setup
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(requestLogger);

// API docs
app.use('/docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument, {
  explorer: true,
  swaggerOptions: {
    defaultModelsExpandDepth: -1
  }
}));

// Health check endpoint
app.get('/health', async (req, res) => {
  try {
    // Test database connection
    await db.query('SELECT 1');
    res.status(200).json({ 
      status: 'ok', 
      database: 'connected',
      timestamp: new Date().toISOString() 
    });
  } catch (error) {
    logger.error('Health check failed - Database connection issue', error);
    res.status(503).json({ 
      status: 'error', 
      database: 'disconnected',
      message: 'Database connection failed',
      timestamp: new Date().toISOString() 
    });
  }
});

app.get('/', (req, res) => {
  res.status(200).json({ message: 'Taskflow API is running', docs: '/docs' });
});

// Mount all routes
app.use(routes);

// 404 handler
app.use((req, res) => {
  res.status(404).json({ error: 'not found' });
});

// Global error handler
app.use(errorHandler);

let server;

const gracefulShutdown = async (signal) => {
  logger.info(`${signal} signal received: closing HTTP server`);
  if (server) {
    server.close(() => logger.info('HTTP server closed'));
  }
  await db.closePool();
  process.exit(0);
};

process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
process.on('SIGINT', () => gracefulShutdown('SIGINT'));

const startServer = async () => {
  try {
    await db.initializePool();
    server = app.listen(env.PORT, () => {
      logger.info(`Server running on port ${env.PORT} in ${env.NODE_ENV} mode`);
    });
  } catch (error) {
    logger.error('Failed to initialize database connection', error);
    process.exit(1);
  }
};

startServer();

export default app;
