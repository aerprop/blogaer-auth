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
  console.log('credentials.ts > ', `origin: ${req.headers.origin}`);
  console.log(
    'credentials.ts > ',
    `allowedOrigins: ${allowedOrigins?.includes(origin)}`
  );
  if (allowedOrigins?.includes(origin)) {
    res.header('Access-Control-Allow-Credentials', 'true');
  }
  next();
}
