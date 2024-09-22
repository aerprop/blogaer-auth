import { Router } from 'express';
import verifyAuthor from '../middlewares/verifyAuthor';
import draftRpcChan from '../middlewares/draftRpcChan';
import draftTopicChan from '../middlewares/draftTopicChan';
import draftController from '../controllers/draftController';

export default Router()
  .use(verifyAuthor)
  .get(`${process.env.BASE_ROUTE}/draft/user`, [
    draftRpcChan,
    draftController.getDraftsByUserId
  ])
  .get(`${process.env.BASE_ROUTE}/draft/:slug`, [
    draftRpcChan,
    draftController.getDraftById
  ])
  .post(`${process.env.BASE_ROUTE}/draft`, [
    draftTopicChan,
    draftController.addDraft
  ])
  .patch(`${process.env.BASE_ROUTE}/draft/:slug`, [
    draftTopicChan,
    draftController.patchDraft
  ])
  .put(`${process.env.BASE_ROUTE}/draft/:slug`, [
    draftTopicChan,
    draftController.updateDraft
  ])
  .delete(`${process.env.BASE_ROUTE}/draft/:slug`, [
    draftTopicChan,
    draftController.deleteDraft
  ]);
