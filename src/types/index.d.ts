import { Express, Request } from 'express';
import { RabbitConn, VerifyOauthCode, VerifyToken } from './common';
import { InMemoryModel } from '../models/in-memory/InMemoryModel';
import UserRequest from '../models/UserRequest';

declare global {
  namespace Express {
    interface Request extends VerifyToken, VerifyOauthCode, RabbitConn {
      inMemModel: InMemoryModel | null;
      userRequest: UserRequest | null;
    }
  }
}
