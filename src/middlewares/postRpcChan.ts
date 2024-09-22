import { NextFunction, Request, Response } from 'express';
import rabbitConn from '../utils/rabbitMQConn';

export default async function postRpcChan(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const connection = await rabbitConn;
    const channel = await connection.createChannel();
    await channel.assertExchange('postRpcExchange', 'direct', {
      durable: false,
      autoDelete: false
    });
    req.rabbitConn = connection;
    req.rabbitChan = channel;
    next();
  } catch (error) {
    console.error('Creating channel failed ✘✘✘', error);
    res.status(500).json;
  }
}
