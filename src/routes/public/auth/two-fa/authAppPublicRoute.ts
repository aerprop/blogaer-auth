import authAppLoginController from '../../../../controllers/auth/login/authAppLoginController';
import { router } from '../../../router';

const authAppPublicRoute = router()
  .post(
    `${process.env.BASE_ROUTE}/auth/two-fa/authapp/login`,
    authAppLoginController
  );

export default authAppPublicRoute;
