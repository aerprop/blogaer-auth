import { Request, Response } from 'express';
import { PostPayload } from '../types/dto/PostPayload';
import handleAddDraft from '../messaging/draft/topic/handleAddDraft';
import handlePatchDraft from '../messaging/draft/topic/handlePatchDraft';
import handleGetDraftById from '../messaging/draft/rpc/handleGetDraftById';
import handleGetDraftsByUserId from '../messaging/draft/rpc/handleGetDraftByUserId';
import handleDeleteDraft from '../messaging/draft/topic/handleDeleteDraft';

const draftController = {
  addDraft(req: Request, res: Response) {
    const { publisherChan } = req;
    const { id, title, content }: PostPayload = req.body;
    const { userId } = req;
    const message = Buffer.from(
      JSON.stringify({ id, userId, title: title.trim(), content })
    );
    handleAddDraft(res, publisherChan, message);
  },
  patchDraft(req: Request, res: Response) {
    const { publisherChan } = req;
    const { id } = req.params;
    const { title, content, tags }: PostPayload = req.body;
    const message = Buffer.from(
      JSON.stringify({ id, title: title.trim(), content, tags })
    );
    handlePatchDraft(res, publisherChan, message);
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
    const { publisherChan } = req;
    const { id } = req.params;
    const message = Buffer.from(JSON.stringify({ id, content, tags }));
  },
  async getDraftById(req: Request, res: Response) {
    const { publisherChan, consumerChan } = req;
    const { id } = req.params;
    const message = Buffer.from(JSON.stringify({ id }));

    await handleGetDraftById(res, publisherChan, consumerChan, message);
  },
  async getDraftsByUserId(req: Request, res: Response) {
    const { publisherChan, consumerChan } = req;
    const { userId } = req;
    const { pageNum, pageSize = 5 } = req.query;
    const message = Buffer.from(JSON.stringify({ userId, pageNum, pageSize }));

    await handleGetDraftsByUserId(res, publisherChan, consumerChan, message);
  },
  async searchDrafts(req: Request, res: Response) {
    const { publisherChan } = req;
    const { query, filter, sort, page } = req.query;
    const limit = 20;
    const message = Buffer.from(
      JSON.stringify({ query, filter, sort, page, limit })
    );
  },
  deleteDraft(req: Request, res: Response) {
    const { publisherChan } = req;
    const { id } = req.params;
    const message = Buffer.from(JSON.stringify({ id }));

    handleDeleteDraft(res, publisherChan, message);
  }
};

export default draftController;
