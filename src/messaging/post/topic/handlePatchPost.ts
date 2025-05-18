import { Channel } from 'amqplib';
import { Response } from 'express';

export default function handlePatchPost(
  res: Response,
  channel: Channel,
  message: Buffer
) {
  const isPublished = channel.publish(
    'postTopicExchange',
    'post.patch.key',
    message,
    {
      persistent: false
    }
  );
  if (isPublished) {
    res.status(200).json({ status: 'Success', message: 'Saving post.' });
  } else {
    console.log('###handlePatchPost.ts Add post failed');
    res.status(500).json({
      status: 'Internal Server Error',
      error: 'Add post failed! Message queue connection error!'
    });
  }
}
