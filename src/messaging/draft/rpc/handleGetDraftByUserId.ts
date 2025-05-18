import { Channel } from 'amqplib';
import { Response } from 'express';
import { PagedPost } from '../../../types/dto/PagedPost';
import { ExchangeName } from '../../../utils/enums';
import { nanoid } from 'nanoid';
import { closeChannel } from '../../../utils/helper';

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
    const timeout = setTimeout(() => res.sendStatus(408), 5000);

    await consumerChan.consume(
      queue,
      async (msg) => {
        if (msg) {
          const data: PagedPost = JSON.parse(msg.content.toString());
          const drafts = data.posts.map((draft) => {
            delete draft?.userId;
            return draft;
          });
          data.posts = drafts;

          res.status(200).json({
            status: 'Success',
            data
          });
          // consumerChan.ack(msg);
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
