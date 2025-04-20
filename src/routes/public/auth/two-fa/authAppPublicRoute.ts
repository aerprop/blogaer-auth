import authAppLoginController from '../../../../controllers/auth/login/authAppLoginController';
import initializeInMemDB from '../../../../middlewares/initializeInMemDB';
import { router } from '../../../router';

const authAppPublicRoute = router()
  .use(initializeInMemDB)
  .post(
    `${process.env.BASE_ROUTE}/auth/two-fa/auth-app/login`,
    authAppLoginController
  );

export default authAppPublicRoute;
