import socialsController from '../../controllers/user-settings/socialsController';
import { router } from '../router';

const socialsRoute = router()
  .patch(
    `${process.env.BASE_ROUTE}/user/account/socials`,
    socialsController.patchSocials
  )
  .get(
    `${process.env.BASE_ROUTE}/user/account/socials`,
    socialsController.getSocials
  );

export default socialsRoute;
