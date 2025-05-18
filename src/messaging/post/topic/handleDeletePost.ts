import { Channel } from 'amqplib';
import { Response } from 'express';

export default function handleDeletePost(
  res: Response,
  channel: Channel,
  message: Buffer
) {
  const isPublished = channel.publish(
    'postTopicExchange',
    'post.delete.key',
    message,
    {
      persistent: false
    }
  );
  if (isPublished) {
    res.status(200).json({ status: 'Success', message: 'Deleting post' });
  } else {
    res.status(500).json({
      status: 'Internal Server Error',
      error: 'Add post failed! Message queue connection error!'
    });
  }
}