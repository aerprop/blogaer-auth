import twoFAController from '../../controllers/user-settings/security/twoFAController';
import { router } from '../router';

const twoFARoute = router()
  .patch(
    `${process.env.BASE_ROUTE}/user/security/two-fa`,
    twoFAController.patchTwoFA
  )
  .delete(
    `${process.env.BASE_ROUTE}/user/security/two-fa/passkey`,
    twoFAController.deleteUserPasskey
  );

export default twoFARoute;
