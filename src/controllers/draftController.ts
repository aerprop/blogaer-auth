import { Request, Response } from 'express';
import { PostPayload } from '../types/dto/PostPayload';
import handleAddDraft from '../messaging/draft/handleAddDraft';
import handlePatchDraft from '../messaging/draft/handlePatchDraft';
import handleGetDraftById from '../messaging/draft/handleGetDraftById';
import handleGetDraftsByUserId from '../messaging/draft/handleGetDraftByUserId';
import handleDeleteDraft from '../messaging/draft/handleDeleteDraft';

const draftController = {
  addDraft(req: Request, res: Response) {
    const { rabbitChan } = req;
    const { id, title, content }: PostPayload = req.body;
    const userId = req.userId;
    const message = Buffer.from(
      JSON.stringify({ id, userId, title: title.trim(), content })
    );
    handleAddDraft(res, rabbitChan, message);
  },
  patchDraft(req: Request, res: Response) {
    const { rabbitChan } = req;
    const { id } = req.params;
    const { title, content, tags }: PostPayload = req.body;
    const message = Buffer.from(
      JSON.stringify({ id, title: title.trim(), content, tags })
    );
    handlePatchDraft(res, rabbitChan, message);
  },
  updateDraft(req: Request, res: Response) {
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
    const { id } = req.params;
    const message = Buffer.from(JSON.stringify({ id, content, tags }));
  },
  async getDraftById(req: Request, res: Response) {
    const { rabbitChan } = req;
    const { id } = req.params;
    const message = Buffer.from(JSON.stringify({ id }));

    await handleGetDraftById(res, rabbitChan, message);
  },
  async getDraftsByUserId(req: Request, res: Response) {
    const { rabbitChan } = req;
    const { userId } = req;
    const { pageNum, pageSize = 5 } = req.query;
    const message = Buffer.from(JSON.stringify({ userId, pageNum, pageSize }));

    await handleGetDraftsByUserId(res, rabbitChan, message);
  },
  async searchDrafts(req: Request, res: Response) {
    const { rabbitChan } = req;
    const { query, filter, sort, page } = req.query;
    const limit = 20;
    const message = Buffer.from(
      JSON.stringify({ query, filter, sort, page, limit })
    );
  },
  deleteDraft(req: Request, res: Response) {
    const { rabbitChan } = req;
    const { id } = req.params;
    const message = Buffer.from(JSON.stringify({ id }));

    handleDeleteDraft(res, rabbitChan, message);
  }
};

export default draftController;
