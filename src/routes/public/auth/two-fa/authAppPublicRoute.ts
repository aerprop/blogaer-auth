import authAppLoginController from '../../../../controllers/auth/login/authAppLoginController';
import initInMemDB from '../../../../middlewares/initInMemDB';
import { router } from '../../../router';

const authAppPublicRoute = router()
  .use(initInMemDB)
  .post(
    `${process.env.BASE_ROUTE}/auth/two-fa/auth-app/login`,
    authAppLoginController
  );

export default authAppPublicRoute;
