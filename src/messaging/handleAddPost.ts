import { Channel } from 'amqplib';
import { Response } from 'express';

export default function handleAddPost(
  res: Response,
  channel: Channel,
  message: Buffer
) {
  const isPublished = channel.publish(
    'postTopicExchange',
    'post.add.key',
    message,
    {
      persistent: false
    }
  );
  if (isPublished) {
    res.sendStatus(204);
  } else {
    res.status(500).json({
      status: 'Internal Server Error',
      error: 'Add post failed! Message queue connection error!'
    });
  }
}
