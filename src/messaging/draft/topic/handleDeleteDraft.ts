import { Channel } from 'amqplib';
import { Response } from 'express';
import { ExchangeName } from '../../../utils/enums';

export default function handleDeleteDraft(
  res: Response,
  channel: Channel,
  message: Buffer
) {
  const isPublished = channel.publish(
    ExchangeName.Topic,
    'draft.delete.key',
    message,
    {
      persistent: false
    }
  );
  if (isPublished) {
    res.status(200).json({ status: 'Success', message: 'Deleting draft' });
  } else {
    console.warn('At handleDeleteDraft.ts >> ', 'Delete draft failed!');
    res.status(500).json({
      status: 'Internal Server Error',
      error: 'Add post failed! Message queue connection error!'
    });
  }
}