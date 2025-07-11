import { Channel } from 'amqplib';
import { Response } from 'express';
import {
  closeChannel,
  getAllUserImgsAndUsernames
} from '../../../utils/helper';
import { PagedPost } from '../../../types/dto/PagedPost';
import { ExchangeName } from '../../../utils/enums';
import { nanoid } from 'nanoid';

export default async function handleGetPostsByPage(
  res: Response,
  publisherChan: Channel,
  consumerChan: Channel,
  message: Buffer
) {
  try {
    const userList = await getAllUserImgsAndUsernames();
    if (!userList) throw new Error('Database connection failed!');

    const { queue } = await consumerChan.assertQueue('', {
      exclusive: true,
      durable: false,
      autoDelete: true
    });

    const correlationId = nanoid(9);
    const published = publisherChan.publish(
      ExchangeName.Rpc,
      'post.get.by.page.key',
      message,
      {
        persistent: false,
        replyTo: queue,
        correlationId
      }
    );
    console.log('Message published >>', published, correlationId);

    const timeout = setTimeout(() => {
      return res.status(408).json({
        status: 'Request timeout',
        error: 'Server took too long to respond!'
      });
    }, 10000);
    await consumerChan.consume(
      queue,
      async (msg) => {
        if (msg) {
          if (msg.properties.correlationId !== correlationId) return null;

          const data: PagedPost = JSON.parse(msg.content.toString());
          if (data.posts.length > 0) {
            const posts = data.posts.map((post) => {
              const foundUser = userList.find(
                (user) => user.id === post.userId
              );
              delete post?.userId;
              if (foundUser) {
                return {
                  ...post,
                  username: foundUser.username,
                  userImg: foundUser.picture
                };
              }

              return post;
            });
            data.posts = posts;
          }

          res.status(200).json({
            status: 'Success',
            data
          });
          closeChannel(timeout, consumerChan);
        } else {
          console.log('At handleGetPostsByPage.ts >>', 'Message is empty!');

          res.sendStatus(204);
          closeChannel(timeout, consumerChan);
        }
      },
      { noAck: true }
    );
  } catch (error) {
    console.error(
      'At handleGetPostsByPage.ts >>',
      error instanceof Error ? error.message : 'Unexpected error occurred!'
    );

    res.status(500).json({
      status: 'Internal server error',
      error:
        error instanceof Error ? error.message : 'Unexpected error occurred!'
    });
  }
}
