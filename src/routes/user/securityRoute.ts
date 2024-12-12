import oauthAssocController from '../../controllers/user-settings/security/oauthAssocController';
import securityController from '../../controllers/user-settings/security/securityController';
import { router } from '../router';

const securityRoute = router().get(
  `${process.env.BASE_ROUTE}/user/security`,
  securityController.getSecurity
).get(
  `${process.env.BASE_ROUTE}/user/security/oauth-associations`,
  oauthAssocController.getAssociations
);

export default securityRoute;
