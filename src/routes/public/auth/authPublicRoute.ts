import { routerInit } from '../../router';
import validateRequest from '../../../middlewares/validateRequest';
import registerController from '../../../controllers/auth/registerController';
import loginController from '../../../controllers/auth/login/loginController';
import twoFAController from '../../../controllers/user/security/twoFAController';
import verifyOauthCode from '../../../middlewares/auth/verifyOauthCode';
import googleOauth2Controller from '../../../controllers/auth/login/googleOauth2Controller';
import authValidations from '../../../middlewares/auth/authValidations';
import githubOauth2Controller from '../../../controllers/auth/login/githubOauth2Controller';

const authPublicRoute = routerInit
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
    googleOauth2Controller
  ])
  .get(`${process.env.BASE_ROUTE}/auth/github`, [
    verifyOauthCode,
    githubOauth2Controller
  ])
  .get(
    `${process.env.BASE_ROUTE}/auth/check-two-fa/:emailOrUsername`,
    twoFAController.getTwoFAStatus
  );

export default authPublicRoute;
