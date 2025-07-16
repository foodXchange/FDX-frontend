import { Request, Response, NextFunction } from 'express';

export const errorHandler = (
  err: any,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  console.error('Error:', err);

  // Default error
  let error = {
    success: false,
    error: 'Internal server error',
    status: 500,
  };

  // Validation error
  if (err.name === 'ValidationError') {
    error = {
      success: false,
      error: 'Validation failed',
      status: 400,
    };
  }

  // JWT error
  if (err.name === 'JsonWebTokenError') {
    error = {
      success: false,
      error: 'Invalid token',
      status: 401,
    };
  }

  // Database error
  if (err.code === 'SQLITE_CONSTRAINT') {
    error = {
      success: false,
      error: 'Database constraint violation',
      status: 400,
    };
  }

  res.status(error.status).json({
    success: error.success,
    error: error.error,
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack }),
  });
};