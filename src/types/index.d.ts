import { Express, Request } from 'express';
import { RabbitConn, VerifyOauthCode, VerifyToken } from './common';

declare global {
  namespace Express {
    interface Request extends VerifyToken, VerifyOauthCode, RabbitConn {}
  }
}
