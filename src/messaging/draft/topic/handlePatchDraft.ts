import { Channel } from 'amqplib';
import { Response } from 'express';
import { ExchangeName } from '../../../utils/enums';

export default function handlePatchDraft(
  res: Response,
  channel: Channel,
  message: Buffer
) {
  console.log('MESSAGE >>', message.toString())
  const isPublished = channel.publish(
    ExchangeName.Topic,
    'draft.patch.key',
    message,
    {
      persistent: false
    }
  );
  if (isPublished) {
    res.status(200).json({ status: 'Success', message: 'Saving to draft' });
  } else {
    console.warn('At handlePatchDraft.ts >> ', 'Patch draft failed!');
    res.status(500).json({
      status: 'Internal Server Error',
      error: 'Add post failed! Message queue connection error!'
    });
  }
}
