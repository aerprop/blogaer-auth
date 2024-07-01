import { Channel, Connection } from 'amqplib';
import publishMessage from '../messaging/publishMessage';
import receiveMessage from '../messaging/receiveMessage';
import { Response } from 'express';

export default async function handleMessage(
  res: Response,
  connection: Connection,
  channel: Channel,
  exchangeName: string,
  queueName: string,
  requestRouting: string,
  responseRouting: string,
  data: Buffer
) {
  try {
    await publishMessage(channel, exchangeName, requestRouting, data);
    try {
      const message = await receiveMessage(
        connection,
        exchangeName,
        queueName,
        responseRouting
      );
      if (message) {
        res.status(201).json({ status: 'Created', data: message });
      } else {
        console.log('blogController.ts | message is empty!');
        res.sendStatus(204);
      }
    } catch (error) {
      console.error('blogController.ts | Error receiving message >>>', error);
      res.status(500).json({ status: 'Internal Server Error', error });
    }
  } catch (error) {
    console.error('blogController.ts | Error publishing message >>>', error);
    res.status(500).json({ status: 'Internal Server Error', error });
  }
}
