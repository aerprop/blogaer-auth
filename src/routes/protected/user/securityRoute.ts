import securityController from '../../../controllers/user/security/securityController';
import { router } from '../../router';

const securityRoute = router()
  .get(
    `${process.env.BASE_ROUTE}/user/security`,
    securityController.getSecurity
  )
  .post(
    `${process.env.BASE_ROUTE}/user/security/add-or-reset-password`,
    securityController.addOrResetPassword
  );

export default securityRoute;
