import { Channel } from 'amqplib';
import { Response } from 'express';

export default function handleDeleteDraft(
  res: Response,
  channel: Channel,
  message: Buffer
) {
  const isPublished = channel.publish(
    'draftTopicExchange',
    'draft.delete.key',
    message,
    {
      persistent: false
    }
  );
  if (isPublished) {
    res.status(200).json({ status: 'Success', message: 'Deleting draft' });
  } else {
    res.status(500).json({
      status: 'Internal Server Error',
      error: 'Add post failed! Message queue connection error!'
    });
  }
}