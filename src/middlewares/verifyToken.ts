import { NextFunction, Request, Response } from 'express';
import jwt from 'jsonwebtoken';
import { Decoded } from '../types/common';

export default function verifyToken(
  req: Request,
  res: Response,
  next: NextFunction
) {
  const header = req.headers.authorization;
  if (!header?.startsWith('Bearer')) {
    return res.status(401).json({
      status: 'Unauthorized',
      error: "Token Doesn't start with Bearer!"
    });
  }

  const token = header.split(' ')[1];
  if (token === 'undefined') return res.sendStatus(498);

  const secret = `${process.env.ACCESS_TOKEN_SECRET}`;
  const decoded = jwt.verify(token, secret) as Decoded;
  if (!decoded) {
    return res.status(403).json({
      status: 'Forbidden',
      error: 'Invalid token.'
    });
  }

  req.userId = decoded.UserInfo.id;
  req.username = decoded.UserInfo.username;
  req.role = decoded.UserInfo.role;
  next();
}
