import { NextFunction, Request, Response } from 'express';

export default async function verifyCookie(
  req: Request,
  res: Response,
  next: NextFunction
) {
  const accessToken = req.cookies[`${process.env.ACCESS_TOKEN}`];
  req.headers.authorization = `Bearer ${accessToken}`;
  next();
}
