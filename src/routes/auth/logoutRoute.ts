import logoutController from '../../controllers/auth/logoutController';
import { routerInit } from '../router';

const logoutRoute = routerInit.get(
  `${process.env.BASE_ROUTE}/logout`,
  logoutController
);

export default logoutRoute;
