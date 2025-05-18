import verifyAuthor from '../../middlewares/verifyAuthor';
import draftController from '../../controllers/draftController';
import { router } from '../router';
import initPubConChan from '../../middlewares/messaging/initPubConChan';
import initPublisherChan from '../../middlewares/messaging/initPublisherChan';

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
    initPublisherChan,
    draftController.addDraft
  ])
  .patch(`${process.env.BASE_ROUTE}/draft/:id`, [
    initPublisherChan,
    draftController.patchDraft
  ])
  .put(`${process.env.BASE_ROUTE}/draft/:id`, [
    initPublisherChan,
    draftController.updateDraft
  ])
  .delete(`${process.env.BASE_ROUTE}/draft/:id`, [
    initPublisherChan,
    draftController.deleteDraft
  ]);

export default draftRoute;
