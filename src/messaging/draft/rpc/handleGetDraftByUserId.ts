import { Channel } from 'amqplib';
import { Response } from 'express';
import { PagedPost } from '../../../types/dto/PagedPost';
import { ExchangeName } from '../../../utils/enums';
import { nanoid } from 'nanoid';
import { closeChannel } from '../../../utils/helper';
import { PagedDraft } from '../../../types/dto/PagedDraft';

export default async function handleGetDraftsByUserId(
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
    publisherChan.publish(
      ExchangeName.Rpc,
      'draft.get.by.user.id.key',
      message,
      {
        persistent: false,
        replyTo: queue,
        correlationId
      }
    );
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

          const data: PagedDraft = JSON.parse(msg.content.toString());
          if (!data) return res.sendStatus(204);

          const drafts = data.drafts.map((draft) => {
            delete draft?.userId;
            return draft;
          });
          data.drafts = drafts;

          res.status(200).json({
            status: 'Success',
            data
          });
          await closeChannel(timeout, consumerChan);
        } else {
          console.log('At handleGetDraftsByUserId.ts >>', 'Message is empty!');

          res.sendStatus(204);
          await closeChannel(timeout, consumerChan);
        }
      },
      { noAck: true }
    );
  } catch (error) {
    console.error(
      'At handleGetDraftsByUserId.ts >>',
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
