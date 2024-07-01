import { NextFunction, Request, Response } from 'express';
import jwt from 'jsonwebtoken';
import { Decoded, VerifyToken } from '../utils/types';

export default async function verifyToken(
  req: Request,
  res: Response,
  next: NextFunction
) {
  const header = req.headers.authorization;
  console.log('verifyToken.ts header >>>', header);
  if (!header?.startsWith('Bearer')) {
    return res.status(401).json({
      status: 'Unauthorized',
      message: "Token Doesn't start with Bearer."
    });
  }

  const token = header.split(' ')[1];
  const secret = process.env.ACCESS_TOKEN_SECRET || '';
  const decoded = jwt.verify(token, secret);

  if (!decoded) {
    return res.status(403).json({
      status: 'Forbidden',
      message: 'Invalid token.'
    });
  }

  const decode = decoded as Decoded;

  req.userId = decode.UserInfo.id;
  req.username = decode.UserInfo.username;
  req.role = decode.UserInfo.role;

  next();
}
