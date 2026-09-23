import { Request, Response, NextFunction } from 'express';
import { Logger } from '../utils/logger';

export interface ApiErrorResponse {
  success: false;
  error: string;
  details?: unknown;
  timestamp: string;
}

export function errorHandler(
  err: Error | any,
  req: Request,
  res: Response,
  _next: NextFunction
): void {
  const status = err.status || err.statusCode || 500;
  const message = err.message || 'An unexpected internal server error occurred.';

  Logger.error(`API Error on [${req.method} ${req.path}]`, err);

  const response: ApiErrorResponse = {
    success: false,
    error: message,
    details: process.env.NODE_ENV === 'development' ? err.stack : undefined,
    timestamp: new Date().toISOString()
  };

  res.status(status).json(response);
}
