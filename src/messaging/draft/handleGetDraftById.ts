import { Channel } from 'amqplib';
import { Response } from 'express';
import { Post } from '../../types/dto/Post';
import { getUserById } from '../../utils/helper';

export default async function handleGetDraftById(
  res: Response,
  channel: Channel,
  message: Buffer
) {
  try {
    const { queue } = await channel.assertQueue('', {
      exclusive: true,
      durable: false
    });
    channel.publish('draftRpcExchange', 'draft.get.by.id.key', message, {
      persistent: false,
      replyTo: queue
    });
    const timeout = setTimeout(() => {
      res.sendStatus(408);
      channel.close();
    }, 5000);
    await channel.consume(
      queue,
      async (msg) => {
        if (msg) {
          const draft: Post = JSON.parse(msg.content.toString());
          if (!draft.userId) return;
          const user = await getUserById(draft.userId);
          delete draft.userId;
          const data = {
            ...draft,
            username: user?.username,
            userImg: user?.picture
          };
          res.status(200).json({
            status: 'Success',
            data
          });
          clearTimeout(timeout);
          channel.close();
        } else {
          res.sendStatus(204);
          clearTimeout(timeout);
          channel.close();
        }
      },
      { noAck: true }
    );
  } catch (error) {
    console.error(
      '###handleGetDraftById.ts Error handling message >>>',
      error instanceof Error ? error.message : 'Unexpected error occurred!'
    );
    res.status(500).json({
      status: 'Internal Server Error',
      error:
        error instanceof Error ? error.message : 'Unexpected error occurred!'
    });
  }
}