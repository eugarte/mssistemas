import { Request, Response, NextFunction } from 'express';
import { logger } from '@infrastructure/logging/Logger';

export const errorMiddleware = (
  err: Error,
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  logger.error('Unhandled error', {
    error: err.message,
    stack: err.stack,
    path: req.path,
    method: req.method,
    ip: req.ip,
  });

  const isDevelopment = process.env.NODE_ENV === 'development';

  res.status(500).json({
    error: 'Internal server error',
    message: isDevelopment ? err.message : undefined,
    stack: isDevelopment ? err.stack : undefined,
  });
};

export const notFoundMiddleware = (req: Request, res: Response): void => {
  res.status(404).json({
    error: 'Not found',
    path: req.path,
    method: req.method,
  });
};
