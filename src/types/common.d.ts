import { Channel, Connection } from 'amqplib';
import { InMemoryModel } from '../models/in-memory/InMemoryModel';

export type LoginReqBody = {
  username: string;
  email: string;
  deviceId: string;
  password?: string;
  picture?: string;
  verified?: boolean;
  code?: string;
};

export type Decoded = {
  UserInfo: {
    id: string;
    username: string;
    role: string;
  };
};

export type VerifyToken = { userId: string; username: string; role: string };

export type VerifyOauthCode = { oauthCode: string };

export type RabbitConn = { rabbitConn: Connection; rabbitChan: Channel };

export type AnyObj = { [key?: string]: any };
