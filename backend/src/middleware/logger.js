import winston from 'winston';
import env from '../config/env.js';

const logger = winston.createLogger({
  level: env.LOG_LEVEL || 'debug',
  defaultMeta: { service: 'taskflow-api' },
  format: winston.format.combine(
    winston.format.errors({ stack: true }),
    winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
    winston.format.splat(),
    winston.format.printf(({ timestamp, level, message, stack, ...meta }) => {
      const metaInfo = Object.keys(meta).length ? ` ${JSON.stringify(meta)}` : '';
      const errorStack = stack ? `\n${stack}` : '';
      return `${timestamp} [${level}] ${message}${metaInfo}${errorStack}`;
    })
  ),
  transports: [
    new winston.transports.Console({
      format: winston.format.combine(
        winston.format.colorize({ all: env.NODE_ENV !== 'production' })
      )
    })
  ]
});

export default logger;
