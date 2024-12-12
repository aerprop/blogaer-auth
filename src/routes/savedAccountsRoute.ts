import savedAccountsController from '../controllers/savedAccountsController';
import { routerInit } from './router';

const savedAccountsRoute = routerInit.get(
  `${process.env.BASE_ROUTE}/saved-accounts/:clientId`,
  savedAccountsController
);

export default savedAccountsRoute;
