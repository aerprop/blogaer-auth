import checkUserController from '../../controllers/auth/checkUserController';
import logoutController from '../../controllers/auth/logoutController';
import refreshTokenController from '../../controllers/auth/refreshTokenController';
import { routerInit } from '../router';

const semiProtectedRoute = routerInit
  .get(`${process.env.BASE_ROUTE}/auth/refresh`, refreshTokenController)
  .get(`${process.env.BASE_ROUTE}/auth/logout`, logoutController)
  .get(
    `${process.env.BASE_ROUTE}/auth/check-username`,
    checkUserController.checkUsername
  );

export default semiProtectedRoute;
