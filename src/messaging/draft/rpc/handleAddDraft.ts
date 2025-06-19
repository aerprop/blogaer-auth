import { Channel } from 'amqplib';
import { Response } from 'express';
import { ExchangeName } from '../../../utils/enums';
import { nanoid } from 'nanoid';
import { closeChannel } from '../../../utils/helper';

export default async function handleAddDraft(
  res: Response,
  publisherChan: Channel,
  consumerChan: Channel,
  message: Buffer
) {
  try {
    const { queue } = await consumerChan.assertQueue('', {
      exclusive: true,
      durable: false
    });

    const correlationId = nanoid(9);
    publisherChan.publish(ExchangeName.Rpc, 'draft.add.key', message, {
      persistent: false,
      replyTo: queue,
      correlationId
    });
    const timeout = setTimeout(() => {
      return res.status(408).json({
        status: 'Request timeout',
        error: 'Server took too long to respond!'
      });
    }, 5000);

    await consumerChan.consume(
      queue,
      async (msg) => {
        if (msg) {
          if (msg.properties.correlationId !== correlationId) return;

          const id: string = JSON.parse(msg.content.toString());
          if (!id) {
            return res.status(404).json({
              status: 'Not Found',
              error: 'Draft not found!'
            });
          }

          res.status(200).json({
            status: 'Success',
            data: { id }
          });
          await closeChannel(timeout, consumerChan);
        } else {
          console.log('At handleAddDraft.ts >>', 'Message is empty!');

          res.sendStatus(204);
          await closeChannel(timeout, consumerChan);
        }
      },
      { noAck: true }
    );
  } catch (error) {
    console.error(
      'At handleAddDraft.ts >>',
      error instanceof Error ? error.message : 'Unexpected error occurred!'
    );

    res.status(500).json({
      status: 'Internal Server Error',
      error:
        error instanceof Error ? error.message : 'Unexpected error occurred!'
    });
    await consumerChan.close();
  }
}
