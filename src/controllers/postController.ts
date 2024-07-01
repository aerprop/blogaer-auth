import { Request, Response } from 'express';
import handleMessage from '../utils/handleMessage';

const blogController = {
  async addPost(req: Request, res: Response) {
    const { rabbitConn, rabbitChan } = req;
    const { content, tags } = req.body;
    const userId = req.userId;
    const data = Buffer.from(JSON.stringify({ userId, content, tags }));

    await handleMessage(
      res,
      rabbitConn,
      rabbitChan,
      'postExchange',
      'postQueue',
      'add_post_request',
      'add_post_response',
      data
    );
  },
  async getPostById(req: Request, res: Response) {
    const { rabbitConn, rabbitChan } = req;
    const { postId } = req.params;
    const data = Buffer.from(postId);

    await handleMessage(
      res,
      rabbitConn,
      rabbitChan,
      'postExchange',
      'postQueue',
      'get_post_by_id_request',
      'get_post_by_id_response',
      data
    );
  },
  async getPostsByQuery(req: Request, res: Response) {
    const { rabbitConn, rabbitChan } = req;
    const { query, sort, categories, tags, pageNum } = req.body;
    const pageSize = 5;
    const data = Buffer.from(
      JSON.stringify({
        explore: { query, sort, categories, tags },
        page: { pageNum, pageSize }
      })
    );

    await handleMessage(
      res,
      rabbitConn,
      rabbitChan,
      'postExchange',
      'postQueue',
      'get_posts_by_page_request',
      'get_posts_by_page_response',
      data
    );
  },
  async explorePosts(req: Request, res: Response) {
    const { rabbitConn, rabbitChan } = req;
    const { query, filter, sort, page } = req.query;
    const limit = 20;
    const data = Buffer.from(
      JSON.stringify({ query, filter, sort, page, limit })
    );

    await handleMessage(
      res,
      rabbitConn,
      rabbitChan,
      'postExchange',
      'postQueue',
      'explore_post_request',
      'explore_post_response',
      data
    );
  },
  async updatePost(req: Request, res: Response) {
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
    const { rabbitConn, rabbitChan } = req;
    const { postId } = req.params;
    const data = Buffer.from(JSON.stringify({ postId, content, tags }));

    await handleMessage(
      res,
      rabbitConn,
      rabbitChan,
      'postExchange',
      'postQueue',
      'update_post_request',
      'update_post_response',
      data
    );
  },
  async patchPost(req: Request, res: Response) {
    const { rabbitConn, rabbitChan } = req;
    const { postId } = req.params;
    const { content, tags } = req.body;
    const data = Buffer.from(JSON.stringify({ postId, content, tags }));

    await handleMessage(
      res,
      rabbitConn,
      rabbitChan,
      'postExchange',
      'postQueue',
      'patch_post_request',
      'patch_post_response',
      data
    );
  },
  async deletePost(req: Request, res: Response) {
    const { rabbitConn, rabbitChan } = req;
    const { postId } = req.params;
    const data = Buffer.from(postId);

    await handleMessage(
      res,
      rabbitConn,
      rabbitChan,
      'postExchange',
      'postQueue',
      'delete_post_request',
      'delete_post_response',
      data
    );
  }
};

export default blogController;
