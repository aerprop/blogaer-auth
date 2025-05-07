import oauth2Controller from '../../../../controllers/auth/login/oauth2Controller';
import oauth2RpcChan from '../../../../middlewares/messaging/oauth2RpcChan';
import verifyOauthCode from '../../../../middlewares/auth/verifyOauthCode';
import { router } from '../../../router';

const oauth2Route = router()
  .use(oauth2RpcChan, verifyOauthCode)
  .get('/auth/google', oauth2Controller.google)
  .get('/auth/github', oauth2Controller.github);

export default oauth2Route;
