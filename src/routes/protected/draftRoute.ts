import verifyAuthor from '../../middlewares/verifyAuthor';
import draftRpcChan from '../../middlewares/messaging/draftRpcChan';
import draftTopicChan from '../../middlewares/messaging/draftTopicChan';
import draftController from '../../controllers/draftController';
import { router } from '../router';

const draftRoute = router()
  .use(verifyAuthor)
  .get(`${process.env.BASE_ROUTE}/draft/user`, [
    draftRpcChan,
    draftController.getDraftsByUserId
  ])
  .get(`${process.env.BASE_ROUTE}/draft/:id`, [
    draftRpcChan,
    draftController.getDraftById
  ])
  .post(`${process.env.BASE_ROUTE}/draft`, [
    draftTopicChan,
    draftController.addDraft
  ])
  .patch(`${process.env.BASE_ROUTE}/draft/:id`, [
    draftTopicChan,
    draftController.patchDraft
  ])
  .put(`${process.env.BASE_ROUTE}/draft/:id`, [
    draftTopicChan,
    draftController.updateDraft
  ])
  .delete(`${process.env.BASE_ROUTE}/draft/:id`, [
    draftTopicChan,
    draftController.deleteDraft
  ]);

export default draftRoute;
