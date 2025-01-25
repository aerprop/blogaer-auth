import authAppController from '../../../../controllers/auth/two-fa/authAppController';
import { router } from '../../../router';

const authAppRoute = router()
  .get(
    `${process.env.BASE_ROUTE}/auth/two-fa/auth-app/register`,
    authAppController.registerAuthApp
  )
  .post(
    `${process.env.BASE_ROUTE}/auth/two-fa/auth-app/verify`,
    authAppController.verifyAuthAppToken
  );

export default authAppRoute;
