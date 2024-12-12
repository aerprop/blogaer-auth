import refreshTokenController from '../../controllers/auth/refreshTokenController';
import { routerInit } from '../router';

const refreshTokenRoute = routerInit.get(
  `${process.env.BASE_ROUTE}/auth/refresh`,
  refreshTokenController
);

export default refreshTokenRoute;
