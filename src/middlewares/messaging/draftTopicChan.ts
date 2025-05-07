import { NextFunction, Request, Response } from 'express';
import rabbitConn from '../../messaging/connection/rabbitMQConn';

export default async function draftTopicChan(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const connection = await rabbitConn;
    const channel = await connection.createChannel();
    await channel.assertExchange('draftTopicExchange', 'topic', {
      durable: false,
      autoDelete: false
    });
    req.rabbitConn = connection;
    req.rabbitChan = channel;
    next();
  } catch (error) {
    console.error('Rabbitmq connection failed ✘✘✘', error);
    res.status(500).json;
  }
}
