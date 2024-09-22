import { Channel } from 'amqplib';
import { Response } from 'express';
import { PagedPost } from '../types/dto/PagedPost';

export default async function handleGetPostsByUserId(
  res: Response,
  channel: Channel,
  message: Buffer
) {
  try {
    const { queue } = await channel.assertQueue('', {
      exclusive: true,
      durable: false
    });

    channel.publish('postRpcExchange', 'post.get.by.user.id.key', message, {
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
          const data: PagedPost = JSON.parse(msg.content.toString());
          const posts = data.posts.map((post) => {
            delete post?.userId;
            return post;
          });
          data.posts = posts;
          res.status(200).json({
            status: 'Success',
            data
          });
          clearTimeout(timeout);
          channel.close();
        } else {
          console.log('###handleGetPostsByUserId.ts message is empty!');
          res.sendStatus(204);
          clearTimeout(timeout);
          channel.close();
        }
      },
      { noAck: true }
    );
  } catch (error) {
    console.error(
      '###handleGetPostsByUserId.ts asserting message >>>',
      error instanceof Error ? error.message : 'Unexpected error occurred!'
    );
    res.status(500).json({
      status: 'Internal Server Error',
      error:
        error instanceof Error ? error.message : 'Unexpected error occurred!'
    });
  }
}
