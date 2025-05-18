import oauth2Controller from '../../../../controllers/auth/login/oauth2Controller';
import verifyOauthCode from '../../../../middlewares/auth/verifyOauthCode';
import { router } from '../../../router';
import initPubConChan from '../../../../middlewares/messaging/initPubConChan';

const oauth2Route = router()
  .use(initPubConChan, verifyOauthCode)
  .get('/auth/google', oauth2Controller.google)
  .get('/auth/github', oauth2Controller.github);

export default oauth2Route;
