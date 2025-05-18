import { Request, Response } from 'express';
import handleGetPostsByPage from '../messaging/post/rpc/handleGetPostsByPage';
import handleAddPost from '../messaging/post/topic/handleAddPost';
import handleGetPostById from '../messaging/post/rpc/handleGetPostById';
import handleGetPostsByUserId from '../messaging/post/rpc/handleGetPostsByUserId';
import handlePatchPost from '../messaging/post/topic/handlePatchPost';
import { PostPayload } from '../types/dto/PostPayload';
import handleDeletePost from '../messaging/post/topic/handleDeletePost';

const blogController = {
  addPost(req: Request, res: Response) {
    const { publisherChan } = req;
    const { id, title, content, tags }: PostPayload = req.body;
    const { userId } = req;
    const message = Buffer.from(
      JSON.stringify({ id, userId, title: title.trim(), content, tags })
    );
    handleAddPost(res, publisherChan, message);
  },
  patchPost(req: Request, res: Response) {
    const { publisherChan } = req;
    const slugs = req.params.slug.split('-');
    const id = slugs[slugs.length - 1];
    const { title, content, tags }: PostPayload = req.body;
    const message = Buffer.from(
      JSON.stringify({ id, title: title.trim(), content, tags })
    );
    handlePatchPost(res, publisherChan, message);
  },
  updatePost(req: Request, res: Response) {
    const { content, tags } = req.body;
    if (!content || !tags) {
      res.status(400).json({
        status: 'Bad request.',
        message: `${
          !content && !tags
            ? 'Content and tags are empty!'
            : !content
            ? 'Content is empty!'
            : 'Tags is empty!'
        }`
      });
    }
    const { publisherChan } = req;
    const { id } = req.params;
    const message = Buffer.from(JSON.stringify({ id, content, tags }));
  },
  async getPostsByPage(req: Request, res: Response) {
    const { publisherChan, consumerChan } = req;
    const { categories, pageNum, pageSize = 5 } = req.query;
    const message = Buffer.from(JSON.stringify({ pageNum, pageSize }));

    await handleGetPostsByPage(res, publisherChan, consumerChan, message);
  },
  async getPostById(req: Request, res: Response) {
    const { publisherChan, consumerChan } = req;
    const slugs = req.params.slug.split('-');
    const id = slugs[slugs.length - 1];
    const message = Buffer.from(JSON.stringify({ id }));

    await handleGetPostById(res, publisherChan, consumerChan, message);
  },
  async getPostsByUserId(req: Request, res: Response) {
    const { publisherChan, consumerChan } = req;
    const { userId } = req;
    const { pageNum, pageSize = 5 } = req.query;
    const message = Buffer.from(JSON.stringify({ userId, pageNum, pageSize }));

    await handleGetPostsByUserId(res, publisherChan, consumerChan, message);
  },
  async explorePosts(req: Request, res: Response) {
    const { publisherChan } = req;
    const { query, filter, sort, page } = req.query;
    const limit = 20;
    const message = Buffer.from(
      JSON.stringify({ query, filter, sort, page, limit })
    );
  },
  deletePost(req: Request, res: Response) {
    const { publisherChan } = req;
    const slugs = req.params.slug.split('-');
    const id = slugs[slugs.length - 1];
    const message = Buffer.from(JSON.stringify({ id }));
    console.log('### Delete post >>>', id);

    handleDeletePost(res, publisherChan, message);
  }
};

export default blogController;
