import googleOauth2Controller from '../../controllers/auth/googleOauth2Controller';
import verifyOauthCode from '../../middlewares/verifyOauthCode';
import { routerInit } from '../router';

const googleOauth2Route = routerInit.get(`${process.env.BASE_ROUTE}/auth/google`, [
  verifyOauthCode,
  googleOauth2Controller
]);

export default googleOauth2Route;
