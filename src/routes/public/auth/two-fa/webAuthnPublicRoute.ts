import passkeyLoginController from '../../../../controllers/auth/passkeyLoginController';
import webAuthnController from '../../../../controllers/auth/two-fa/webAuthnController';
import initializeInMemDB from '../../../../middlewares/initializeInMemDB';
import { router } from '../../../router';

const webAuthnPublicRoute = router()
  .use(initializeInMemDB)
  .post(
    `${process.env.BASE_ROUTE}/auth/two-fa/webauthn/login/generate`,
    webAuthnController.generateLoginOptions
  )
  .post(
    `${process.env.BASE_ROUTE}/auth/two-fa/webauthn/login/verify`,
    webAuthnController.verifyLoginOptions
  )
  .post(
    `${process.env.BASE_ROUTE}/auth/two-fa/webauthn/login`,
    passkeyLoginController
  );

export default webAuthnPublicRoute;
