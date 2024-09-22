import { Request, Response } from 'express';
import handleGetPostsByPage from '../messaging/handleGetPostsByPage';
import handleAddPost from '../messaging/handleAddPost';
import handleGetPostById from '../messaging/handleGetPostById';
import handleGetPostsByUserId from '../messaging/handleGetPostsByUserId';
import handlePatchPost from '../messaging/handlePatchPost';
import { PostPayload } from '../types/dto/PostPayload';
import handleDeletePost from '../messaging/handleDeletePost';

const blogController = {
  addPost(req: Request, res: Response) {
    const { rabbitChan } = req;
    const { id, title, content, tags }: PostPayload = req.body;
    const userId = req.userId;
    const message = Buffer.from(
      JSON.stringify({ id, userId, title: title.trim(), content, tags })
    );
    handleAddPost(res, rabbitChan, message);
  },
  patchPost(req: Request, res: Response) {
    const { rabbitChan } = req;
    const slugs = req.params.slug.split('-');
    const id = slugs[slugs.length - 1];
    const { title, content, tags }: PostPayload = req.body;
    const message = Buffer.from(
      JSON.stringify({ id, title: title.trim(), content, tags })
    );
    handlePatchPost(res, rabbitChan, message);
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
    const { rabbitChan } = req;
    const { postId } = req.params;
    const message = Buffer.from(JSON.stringify({ postId, content, tags }));
  },
  async getPostsByPage(req: Request, res: Response) {
    const { rabbitChan } = req;
    const { categories, pageNum, pageSize = 5 } = req.query;
    const message = Buffer.from(JSON.stringify({ pageNum, pageSize }));

    await handleGetPostsByPage(res, rabbitChan, message);
  },
  async getPostById(req: Request, res: Response) {
    const { rabbitChan } = req;
    const slugs = req.params.slug.split('-');
    const postId = slugs[slugs.length - 1];
    const message = Buffer.from(JSON.stringify({ postId }));

    await handleGetPostById(res, rabbitChan, message);
  },
  async getPostsByUserId(req: Request, res: Response) {
    const { rabbitChan } = req;
    const { userId } = req;
    const { pageNum, pageSize = 5 } = req.query;
    const message = Buffer.from(JSON.stringify({ userId, pageNum, pageSize }));

    await handleGetPostsByUserId(res, rabbitChan, message);
  },
  async explorePosts(req: Request, res: Response) {
    const { rabbitChan } = req;
    const { query, filter, sort, page } = req.query;
    const limit = 20;
    const message = Buffer.from(
      JSON.stringify({ query, filter, sort, page, limit })
    );
  },
  deletePost(req: Request, res: Response) {
    const { rabbitChan } = req;
    const slugs = req.params.slug.split('-');
    const postId = slugs[slugs.length - 1];
    const message = Buffer.from(JSON.stringify({ postId }));
    console.log('### Delete post >>>', postId);

    handleDeletePost(res, rabbitChan, message);
  }
};

export default blogController;
