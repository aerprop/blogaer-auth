import { config } from 'dotenv';
import { NextFunction, Request, Response } from 'express';

config();
const allowedOrigins = process.env.ALLOWED_ORIGINS?.split(',');

export default async function credentials(
  req: Request,
  res: Response,
  next: NextFunction
) {
  const origin = req.headers.origin as string;
  console.log(
    `incoming request from >>> ${req.headers.origin}`,
    `to ${req.url}`
  );

  if (allowedOrigins?.includes(origin))
    res.header('Access-Control-Allow-Credentials', 'true');

  next();
}
