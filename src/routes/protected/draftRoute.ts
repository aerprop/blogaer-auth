import verifyAuthor from '../../middlewares/verifyAuthor';
import draftController from '../../controllers/draftController';
import { router } from '../router';
import initPubConChan from '../../middlewares/messaging/initPubConChan';
import initPubTopicChan from '../../middlewares/messaging/initPubTopicChan';

const draftRoute = router()
  .use(verifyAuthor)
  .get(`${process.env.BASE_ROUTE}/draft/user`, [
    initPubConChan,
    draftController.getDraftsByUserId
  ])
  .get(`${process.env.BASE_ROUTE}/draft/:id`, [
    initPubConChan,
    draftController.getDraftById
  ])
  .post(`${process.env.BASE_ROUTE}/draft`, [
    initPubConChan,
    draftController.addDraft
  ])
  .patch(`${process.env.BASE_ROUTE}/draft`, [
    initPubTopicChan,
    draftController.patchDraft
  ])
  .delete(`${process.env.BASE_ROUTE}/draft/:id`, [
    initPubTopicChan,
    draftController.deleteDraft
  ]);

export default draftRoute;
