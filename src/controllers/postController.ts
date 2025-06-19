import { Request, Response } from 'express';
import handleGetPostsByPage from '../messaging/post/rpc/handleGetPostsByPage';
import handleAddPost from '../messaging/post/rpc/handleAddPost';
import handleGetPostById from '../messaging/post/rpc/handleGetPostById';
import handleGetPostsByUserId from '../messaging/post/rpc/handleGetPostsByUserId';
import handlePatchPost from '../messaging/post/topic/handlePatchPost';
import handleDeletePost from '../messaging/post/topic/handleDeletePost';

const blogController = {
  async getPostsByPage(req: Request, res: Response) {
    const { publisherChan, consumerChan } = req;
    const { categories, number = 1, size = 5 } = req.query;
    const message = Buffer.from(JSON.stringify({ number, size }));
    await handleGetPostsByPage(res, publisherChan, consumerChan, message);
  },
  async getPostById(req: Request, res: Response) {
    const { publisherChan, consumerChan } = req;
    const { id } = req.params;
    const message = Buffer.from(JSON.stringify(id));
    await handleGetPostById(res, publisherChan, consumerChan, message);
  },
  async getPostsByUserId(req: Request, res: Response) {
    const { publisherChan, consumerChan, userId } = req;
    const { number = 1, size = 5 } = req.query;
    const message = Buffer.from(JSON.stringify({ userId, number, size }));
    await handleGetPostsByUserId(res, publisherChan, consumerChan, message);
  },
  async addPost(req: Request, res: Response) {
    const { publisherChan, consumerChan, userId } = req;
    const { title, text, content, tags } = req.body;
    const message = Buffer.from(
      JSON.stringify({ userId, text, title: title.trim(), content, tags })
    );
    await handleAddPost(res, publisherChan, consumerChan, message);
  },
  patchPost(req: Request, res: Response) {
    const { publisherChan } = req;
    const { id, title, text, content, tags } = req.body;
    const message = Buffer.from(
      JSON.stringify({ id, title: title.trim(), text, content, tags })
    );
    handlePatchPost(res, publisherChan, message);
  },
  deletePost(req: Request, res: Response) {
    const { publisherChan } = req;
    const { id } = req.params;
    const message = Buffer.from(JSON.stringify(id));
    handleDeletePost(res, publisherChan, message);
  }
};

export default blogController;
