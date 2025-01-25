import webAuthnController from '../../../../controllers/auth/two-fa/webAuthnController';
import initializeInMemDB from '../../../../middlewares/initializeInMemDB';
import { router } from '../../../router';

const webAuthnRoute = router()
  .use(initializeInMemDB)
  .get(
    `${process.env.BASE_ROUTE}/auth/two-fa/webauthn/register`,
    webAuthnController.generateRegisterOptions
  )
  .post(
    `${process.env.BASE_ROUTE}/auth/two-fa/webauthn/register`,
    webAuthnController.verifyRegisterOptions
  );

export default webAuthnRoute;
