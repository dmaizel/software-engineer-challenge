import { Request, Response, NextFunction } from 'express';
import { ApiError } from '../types';

export class CustomError extends Error {
  public statusCode: number;
  public isOperational: boolean;

  constructor(message: string, statusCode: number = 500, isOperational: boolean = true) {
    super(message);
    this.statusCode = statusCode;
    this.isOperational = isOperational;

    Error.captureStackTrace(this, this.constructor);
  }
}

export const errorHandler = (
  err: Error | CustomError,
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  let error = { ...err };
  error.message = err.message;

  // Log error
  console.error(err);

  // Mongoose bad ObjectId
  if (err.name === 'CastError') {
    const message = 'Resource not found';
    error = new CustomError(message, 404);
  }

  // Mongoose duplicate key
  if ((err as any).code === 11000) {
    const message = 'Duplicate field value entered';
    error = new CustomError(message, 400);
  }

  // Mongoose validation error
  if (err.name === 'ValidationError') {
    const message = Object.values((err as any).errors).map((val: any) => val.message).join(', ');
    error = new CustomError(message, 400);
  }

  const statusCode = (error as CustomError).statusCode || 500;
  const message = error.message || 'Server Error';

  const apiError: ApiError = {
    error: 'API Error',
    message: process.env.NODE_ENV === 'development' ? message : 'Internal server error',
    statusCode,
    path: req.originalUrl
  };

  res.status(statusCode).json(apiError);
};

export const notFound = (req: Request, res: Response, next: NextFunction): void => {
  const error = new CustomError(`Not found - ${req.originalUrl}`, 404);
  next(error);
}; 