import { config } from 'dotenv';
import { NextFunction, Request, Response } from 'express';

config();
const allowedOrigins = process.env.ALLOWED_ORIGINS?.split(',');

const credentials = (req: Request, res: Response, next: NextFunction) => {
  const origin = req.headers.origin as string;
  console.log('origin: ', req.headers.origin);
  console.log('allowedOrigins: ', allowedOrigins?.includes(origin));
  if (allowedOrigins?.includes(origin)) {
    res.header('Access-Control-Allow-Credentials', 'true');
  }
  next();
};

export default credentials;
