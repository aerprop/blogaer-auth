import webAuthnController from '../../../../controllers/auth/two-fa/webAuthnController';
import initInMemDB from '../../../../middlewares/initInMemDB';
import { router } from '../../../router';

const webAuthnRoute = router()
  .use(initInMemDB)
  .get(
    `${process.env.BASE_ROUTE}/auth/two-fa/webauthn/register/generate`,
    webAuthnController.generateRegisterOptions
  )
  .post(
    `${process.env.BASE_ROUTE}/auth/two-fa/webauthn/register/verify`,
    webAuthnController.verifyRegisterOptions
  );

export default webAuthnRoute;
