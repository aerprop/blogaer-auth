import { Request, Response } from 'express';
import handleAddDraft from '../messaging/draft/rpc/handleAddDraft';
import handlePatchDraft from '../messaging/draft/topic/handlePatchDraft';
import handleGetDraftById from '../messaging/draft/rpc/handleGetDraftById';
import handleGetDraftsByUserId from '../messaging/draft/rpc/handleGetDraftByUserId';
import handleDeleteDraft from '../messaging/draft/topic/handleDeleteDraft';

const draftController = {
  async getDraftsByUserId(req: Request, res: Response) {
    const { publisherChan, consumerChan, userId } = req;
    const { number = 1, size = 5 } = req.query;
    const message = Buffer.from(JSON.stringify({ number, size, userId }));
    await handleGetDraftsByUserId(res, publisherChan, consumerChan, message);
  },
  async getDraftById(req: Request, res: Response) {
    const { publisherChan, consumerChan } = req;
    const { id } = req.params;
    const message = Buffer.from(JSON.stringify(id));
    await handleGetDraftById(res, publisherChan, consumerChan, message);
  },
  async addDraft(req: Request, res: Response) {
    const { publisherChan, consumerChan, userId } = req;
    const { title, text, content } = req.body;
    const message = Buffer.from(
      JSON.stringify({ userId, title: title.trim(), text, content })
    );
    await handleAddDraft(res, publisherChan, consumerChan, message);
  },
  patchDraft(req: Request, res: Response) {
    const { publisherChan, userId } = req;
    const { id, title, text, content, tags } = req.body;
    const message = Buffer.from(
      JSON.stringify({ id, userId, text, title: title.trim(), content, tags })
    );
    handlePatchDraft(res, publisherChan, message);
  },
  deleteDraft(req: Request, res: Response) {
    const { publisherChan } = req;
    const { id } = req.params;
    const message = Buffer.from(JSON.stringify(id));
    handleDeleteDraft(res, publisherChan, message);
  }
};

export default draftController;
