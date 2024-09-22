import { Express, Request } from 'express';
import { RabbitConn, VerifyToken } from '../types/common';

declare global {
  namespace Express {
    interface Request extends VerifyToken, RabbitConn {}
  }
}
