import { Request, Response, NextFunction } from 'express';

export default async function verifyAuthor(
  req: Request,
  res: Response,
  next: NextFunction
) {
  const role = req.role;
  if (role.toLowerCase() !== 'author') {
    res
      .status(403)
      .json({ status: 'Forbidden', message: 'User is not an author!' });
  }

  next();
}
