import savedAccountsRoute from './public/savedAccountsRoute';
import logoutRoute from './protected/auth/logoutRoute';
import refreshTokenRoute from './protected/auth/refreshTokenRoute';
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

const routes = {
  savedAccounts: savedAccountsRoute,
  authPublic: authPublicRoute,
  authAppPublic: authAppPublicRoute,
  webAuthnPublic: webAuthnPublicRoute,
  postPublic: postPublicRoute,
  logout: logoutRoute,
  refresh: refreshTokenRoute,
  account: accountRoute,
  security: securityRoute,
  twoFA: twoFARoute,
  socials: socialsRoute,
  settings: settingsRoute,
  webAuthn: webAuthnRoute,
  authApp: authAppRoute,
  post: postRoute,
  draft: draftRoute
};

export default routes;
