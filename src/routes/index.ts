import savedAccountsRoute from './savedAccountsRoute';
import registerRoute from './auth/registerRoute';
import loginRoute from './auth/loginRoute';
import logoutRoute from './auth/logoutRoute';
import refreshTokenRoute from './auth/refreshTokenRoute';
import postRoute from './postRoute';
import googleOauth2Route from './auth/googleOauth2Route';
import postPublicRoute from './postPublicRoute';
import draftRoute from './draftRoute';
import accountRoute from './user/accountRoute';
import socialsRoute from './user/socialsRoute';
import settingsRoute from './user/settingsRoute';
import webAuthnRoute from './auth/two-fa/webAuthnRoute';
import securityRoute from './user/securityRoute';
import twoFARoute from './user/twoFARoute';
import authAppRoute from './auth/two-fa/authAppRoute';

const routes = {
  savedAccounts: savedAccountsRoute,
  register: registerRoute,
  login: loginRoute,
  googleLogin: googleOauth2Route,
  logout: logoutRoute,
  refresh: refreshTokenRoute,
  postPublic: postPublicRoute,
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
