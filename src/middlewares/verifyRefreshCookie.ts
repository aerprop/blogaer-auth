import { NextFunction, Request, Response } from 'express';

export default function verifyRefreshCookie(
  req: Request,
  res: Response,
  next: NextFunction
) {
  const refreshToken = req.cookies[`${process.env.REFRESH_TOKEN}`];
  if (refreshToken == null) return res.sendStatus(498);

  next();
}
