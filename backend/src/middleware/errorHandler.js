import { ApiError } from '../utils/ApiError.js';
import { logger } from '../utils/logger.js';

export function notFoundHandler(req, res, next) {
  next(ApiError.notFound(`Route ${req.originalUrl} not found`));
}

export function errorHandler(err, req, res, _next) {
  if (err instanceof ApiError) {
    return res.status(err.statusCode).json({
      success: false,
      message: err.message,
      details: err.details,
    });
  }

  logger.error('Unhandled error:', { message: err.message, stack: err.stack });

  return res.status(500).json({
    success: false,
    message: 'Internal server error',
  });
}
