import savedAccountsController from '../../controllers/savedAccountsController';
import { routerInit } from '../router';

const savedAccountsPublicRoute = routerInit
  .get(
    `${process.env.BASE_ROUTE}/saved-accounts/:clientId`,
    savedAccountsController.getSavedAccounts
  )
  .delete(
    `${process.env.BASE_ROUTE}/saved-accounts/:username/:clientId`,
    savedAccountsController.deleteSavedAccount
  );

export default savedAccountsPublicRoute;
