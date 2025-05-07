import { NextFunction, Request, Response } from 'express';
import rabbitMQService from '../../services/messaging/rabbitMQService';

export default async function oauth2RpcChan(
  req: Request,
  res: Response,
  next: NextFunction
) {
  const rabbitMQ = await rabbitMQService('oauthRpcExchange', 'direct', {
    durable: false,
    autoDelete: false
  });
  if (typeof rabbitMQ !== 'string') {
    req.rabbitConn = rabbitMQ.connection;
    req.rabbitChan = rabbitMQ.channel;
    next();
  } else {
    res.status(500).json({ status: 'Internal server error', error: rabbitMQ });
  }
}
