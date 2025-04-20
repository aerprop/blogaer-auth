import savedAccountsController from '../../controllers/savedAccountsController';
import { routerInit } from '../router';

const savedAccountsPublicRoute = routerInit
  .get(
    `${process.env.BASE_ROUTE}/saved-accounts`,
    savedAccountsController.getSavedAccounts
  )
  .delete(
    `${process.env.BASE_ROUTE}/saved-accounts/:username`,
    savedAccountsController.deleteSavedAccount
  );

export default savedAccountsPublicRoute;
