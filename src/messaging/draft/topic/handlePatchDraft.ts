import { Channel } from 'amqplib';
import { Response } from 'express';

export default function handlePatchDraft(
  res: Response,
  channel: Channel,
  message: Buffer
) {
  const isPublished = channel.publish(
    'draftTopicExchange',
    'draft.patch.key',
    message,
    {
      persistent: false
    }
  );
  if (isPublished) {
    res.status(200).json({ status: 'Success', message: 'Saving to draft' });
  } else {
    console.log('###handlePatchPost.ts Add post failed');
    res.status(500).json({
      status: 'Internal Server Error',
      error: 'Add post failed! Message queue connection error!'
    });
  }
}
