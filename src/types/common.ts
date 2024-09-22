import { Channel, Connection } from 'amqplib';

export type LoginReqBody = {
  username: string;
  email: string;
  deviceId: string;
  password?: string;
  picture?: string;
  verified?: boolean;
};

export type Decoded = {
  UserInfo: {
    id: string;
    username: string;
    role: string;
  };
};

export type VerifyToken = { userId: string; username: string; role: string };

export type RabbitConn = { rabbitConn: Connection; rabbitChan: Channel };
