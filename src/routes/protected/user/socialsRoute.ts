import socialsController from '../../../controllers/user/socialsController';
import { router } from '../../router';

const socialsRoute = router()
  .patch(
    `${process.env.BASE_ROUTE}/user/account/social`,
    socialsController.patchSocials
  )
  .get(
    `${process.env.BASE_ROUTE}/user/account/social`,
    socialsController.getSocials
  );

export default socialsRoute;
