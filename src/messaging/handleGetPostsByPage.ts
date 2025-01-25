import { Channel } from 'amqplib';
import { Response } from 'express';
import { getAllUserImgsAndUsernames } from '../utils/helper';
import { PagedPost } from '../types/dto/PagedPost';

export default async function handleGetPostsByPage(
  res: Response,
  channel: Channel,
  message: Buffer
) {
  try {
    const userList = await getAllUserImgsAndUsernames();
    if (!userList) throw new Error('Database connection failed!');

    const { queue } = await channel.assertQueue('', {
      exclusive: true,
      durable: false
    });

    channel.publish('postRpcExchange', 'post.get.by.page.key', message, {
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
            const foundUser = userList.find((user) => user.id === post.userId);
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
          res.status(200).json({
            status: 'Success',
            data
          });
          clearTimeout(timeout);
          channel.close();
        } else {
          console.log('###handleGetPostsByPage.ts message is empty!');
          res.sendStatus(204);
          clearTimeout(timeout);
          channel.close();
        }
      },
      { noAck: true }
    );
  } catch (error) {
    console.error(
      'handleGetPostsByPage.ts ERROR >>>',
      error instanceof Error ? error.message : 'Unexpected error occurred!'
    );
    res.status(500).json({
      status: 'Internal server error',
      error:
        error instanceof Error ? error.message : 'Unexpected error occurred!'
    });
  }
}
