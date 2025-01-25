import twoFAController from '../../../controllers/user-settings/security/twoFAController';
import { router } from '../../router';

const twoFARoute = router()
  .get(
    `${process.env.BASE_ROUTE}/user/security/two-fa/auth-app/:username`,
    twoFAController.getAuthAppToken
  )
  .delete(
    `${process.env.BASE_ROUTE}/user/security/two-fa/passkey`,
    twoFAController.deleteUserPasskey
  )
  .delete(
    `${process.env.BASE_ROUTE}/user/security/two-fa/auth-app`,
    twoFAController.deleteUserSecret
  );

export default twoFARoute;
