import { Channel } from 'amqplib';
import { Response } from 'express';

export default function handleAddDraft(
  res: Response,
  channel: Channel,
  message: Buffer
) {
  const isPublished = channel.publish(
    'draftTopicExchange',
    'draft.add.key',
    message,
    {
      persistent: false
    }
  );
  if (isPublished) {
    res.status(200).json({ status: 'Success', message: 'Saving to draft' });
  } else {
    res.status(500).json({
      status: 'Internal Server Error',
      error: 'Add post failed! Message queue connection error!'
    });
  }
}