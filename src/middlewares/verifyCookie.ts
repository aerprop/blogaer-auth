import { NextFunction, Request, Response } from 'express';

export default function verifyCookie(
  req: Request,
  res: Response,
  next: NextFunction
) {
  const accessToken = req.cookies[`${process.env.ACCESS_TOKEN}`];
  const refreshToken = req.cookies[`${process.env.REFRESH_TOKEN}`];
  if (accessToken == null || refreshToken == null) return res.sendStatus(498);
  req.headers.authorization = `Bearer ${accessToken}`;

  next();
}
