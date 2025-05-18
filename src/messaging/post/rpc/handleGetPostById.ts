import { Channel } from 'amqplib';
import { Response } from 'express';
import { Post } from '../../../types/dto/Post';
import { closeChannel, getUserById } from '../../../utils/helper';
import { ExchangeName } from '../../../utils/enums';
// import { nanoid } from 'nanoid';

export default async function handleGetPostById(
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
    // const correlationId = nanoid(9);
    publisherChan.publish(ExchangeName.Rpc, 'post.get.by.id.key', message, {
      persistent: false,
      replyTo: queue
      // correlationId
    });
    const timeout = setTimeout(() => res.sendStatus(408), 5000);

    await consumerChan.consume(
      queue,
      async (msg) => {
        if (msg) {
          // if (msg.properties.correlationId !== correlationId) return;

          const post: Post = JSON.parse(msg.content.toString());
          if (!post.userId) return;

          const user = await getUserById(post.userId);
          delete post.userId;
          const data = {
            ...post,
            username: user?.username,
            userImg: user?.picture
          };

          res.status(200).json({
            status: 'Success',
            data
          });
          consumerChan.ack(msg);
          await closeChannel(timeout, consumerChan);
        } else {
          console.log('At handleGetPostById.ts >>', 'Message is empty!');

          res.sendStatus(204);
          await closeChannel(timeout, consumerChan);
        }
      },
      { noAck: true }
    );
  } catch (error) {
    console.error(
      'At handleGetPostById.ts >>',
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
