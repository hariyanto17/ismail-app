import { Request, Response, NextFunction } from 'express';
import { AppError } from '../common/errors';

export const errorMiddleware = (
  err: Error,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  if (err instanceof AppError) {
    return res.status(err.statusCode).json({
      success: false,
      message: err.message,
    });
  }

  // Handle Prisma errors or other system errors
  console.error('Unhandled Error:', err);

  return res.status(500).json({
    success: false,
    message: 'Internal Server Error',
  });
};
