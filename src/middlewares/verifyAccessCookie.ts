import { NextFunction, Request, Response } from 'express';

export default function verifyAccessCookie(
  req: Request,
  res: Response,
  next: NextFunction
) {
  const accessToken = req.cookies[`${process.env.ACCESS_TOKEN}`];
  if (accessToken == null) return res.sendStatus(498);
  req.headers.authorization = `Bearer ${accessToken}`;

  next();
}
