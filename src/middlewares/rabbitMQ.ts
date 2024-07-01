import { NextFunction, Request, Response } from 'express';
import amqp from 'amqplib';

export default async function rabbitMQConnection(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const connection = await amqp.connect('amqp://anekra:1234@localhost:5672');
    const channel = await connection.createChannel();
    req.rabbitConn = connection;
    req.rabbitChan = channel;
    console.log('Connected to rabbitmq ✔✔✔');

    next();
  } catch (error) {
    console.error('Rabbitmq connection failed ✘✘✘');
    res.status(500).json;
  }
}
