import savedAccountsRoute from './public/savedAccountsRoute';
import postRoute from './protected/postRoute';
import postPublicRoute from './public/postPublicRoute';
import draftRoute from './protected/draftRoute';
import accountRoute from './protected/user/accountRoute';
import socialsRoute from './protected/user/socialsRoute';
import settingsRoute from './protected/user/settingsRoute';
import webAuthnRoute from './protected/auth/two-fa/webAuthnRoute';
import securityRoute from './protected/user/securityRoute';
import twoFARoute from './protected/user/twoFARoute';
import authAppRoute from './protected/auth/two-fa/authAppRoute';
import webAuthnPublicRoute from './public/auth/two-fa/webAuthnPublicRoute';
import authPublicRoute from './public/auth/authPublicRoute';
import authAppPublicRoute from './public/auth/two-fa/authAppPublicRoute';
import emailRoute from './protected/emailRoute';
import semiProtectedRoute from './semi/semiProtectedRoute';

const routes = {
  public: [
    savedAccountsRoute,
    authPublicRoute,
    authAppPublicRoute,
    webAuthnPublicRoute,
    postPublicRoute
  ],
  semi: [semiProtectedRoute],
  protected: [
    webAuthnRoute,
    authAppRoute,
    accountRoute,
    securityRoute,
    twoFARoute,
    socialsRoute,
    settingsRoute,
    emailRoute,
    postRoute,
    draftRoute
  ]
};

export default routes;
