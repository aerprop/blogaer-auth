import { Channel, ChannelModel, Connection } from 'amqplib';
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

export type RefreshTokenInfo = {
  UserInfo: { id: string; username: string };
};

export type UserSocial = {
  github: string;
  instagram: string;
  x: string;
  youtube: string;
  facebook: string;
  gitlab: string;
};

export type UserAgent = {
  browser: string;
  cpu: string;
  platform: string;
  vendor: string;
  engine: string;
  os: string;
};

export type VerifyToken = { userId: string; username: string; role: string };

export type VerifyOauthCode = { oauthCode: string };

export type RabbitConn = { publisherChan: Channel, consumerChan: Channel };

export type AnyObj = { [key?: string]: any };
