import twoFAController from '../../../controllers/user/security/twoFAController';
import { router } from '../../router';

const twoFARoute = router()
  .get(
    `${process.env.BASE_ROUTE}/user/security/two-fa/authapp/:username`,
    twoFAController.getAuthAppToken
  )
  .delete(
    `${process.env.BASE_ROUTE}/user/security/two-fa/webauthn/passkey`,
    twoFAController.deleteUserPasskey
  )
  .delete(
    `${process.env.BASE_ROUTE}/user/security/two-fa/authapp`,
    twoFAController.deleteUserSecret
  );

export default twoFARoute;
