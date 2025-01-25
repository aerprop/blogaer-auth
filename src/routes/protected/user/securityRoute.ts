import securityController from '../../../controllers/user-settings/security/securityController';
import { router } from '../../router';

const securityRoute = router().get(
  `${process.env.BASE_ROUTE}/user/security`,
  securityController.getSecurity
);

export default securityRoute;
