import accountController from '../../../controllers/user-settings/accountController';
import { router } from '../../router';

const accountRoute = router().patch(
  `${process.env.BASE_ROUTE}/user/account`,
  accountController.patchAccount
);

export default accountRoute;
