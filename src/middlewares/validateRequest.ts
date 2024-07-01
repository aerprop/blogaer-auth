import { NextFunction, Request, Response } from 'express';
import { validationResult } from 'express-validator';

export default async function validateRequest(
  req: Request,
  res: Response,
  next: NextFunction
) {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      status: 'Bad request',
      message: 'Form validation error.',
      errors: errors.array()
    });
  }
  next();
}
