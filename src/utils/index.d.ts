import { Express, Request } from 'express';
import { RabbitConn, VerifyToken } from './types';

declare global {
  namespace Express {
    interface Request extends VerifyToken, RabbitConn {}
  }
}
