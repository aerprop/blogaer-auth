import { router } from '../../router';
import validateRequest from '../../../middlewares/validateRequest';
import registerController from '../../../controllers/auth/registerController';
import loginController from '../../../controllers/auth/login/loginController';
import twoFAController from '../../../controllers/user/security/twoFAController';
import verifyOauthCode from '../../../middlewares/auth/verifyOauthCode';
import authValidations from '../../../middlewares/auth/authValidations';
import oauth2Controller from '../../../controllers/auth/login/oauth2Controller';

const authPublicRoute = router()
  .post(`${process.env.BASE_ROUTE}/auth/register`, [
    ...authValidations.registerValidations,
    validateRequest,
    registerController
  ])
  .post(`${process.env.BASE_ROUTE}/auth/login`, [
    ...authValidations.loginValidations,
    validateRequest,
    loginController
  ])
  .get(`${process.env.BASE_ROUTE}/auth/google`, [
    verifyOauthCode,
    oauth2Controller.google
  ])
  .get(`${process.env.BASE_ROUTE}/auth/github`, [
    verifyOauthCode,
    oauth2Controller.github
  ])
  .get(
    `${process.env.BASE_ROUTE}/auth/check-two-fa/:emailOrUsername`,
    twoFAController.getTwoFAStatus
  );

export default authPublicRoute;
