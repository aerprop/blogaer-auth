import webAuthnController from '../../../controllers/auth/two-fa/webAuthnController';
import { router } from '../../router';

const webAuthnRoute = router()
  .get(
    `${process.env.BASE_ROUTE}/auth/two-fa/webauthn/register`,
    webAuthnController.generateRegisterOptions
  )
  .post(
    `${process.env.BASE_ROUTE}/auth/two-fa/webauthn/register`,
    webAuthnController.verifyRegisterOptions
  )
  .get(
    `${process.env.BASE_ROUTE}/auth/two-fa/webauthn/login`,
    webAuthnController.generateLoginOptions
  )
  .post(
    `${process.env.BASE_ROUTE}/auth/two-fa/webauthn/login`,
    webAuthnController.verifyLoginOptions
  );

export default webAuthnRoute;
