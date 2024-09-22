import { RequestHandler } from 'express';
import baseRoute from './baseRoute';
import registerRoute from './registerRoute';
import loginRoute from './loginRoute';
import logoutRoute from './logoutRoute';
import refreshTokenRoute from './refreshTokenRoute';
import postRoute from './postRoute';
import googleOauth2Route from './googleOauth2Route';
import postPublicRoute from './postPublicRoute';
import draftRoute from './draftRoute';

type Routes = {
  base: RequestHandler;
  register: RequestHandler;
  login: RequestHandler;
  googleLogin: RequestHandler;
  logout: RequestHandler;
  refresh: RequestHandler;
  post: RequestHandler;
  postPublic: RequestHandler;
  draft: RequestHandler;
};

const routes: Routes = {
  base: baseRoute,
  register: registerRoute,
  login: loginRoute,
  googleLogin: googleOauth2Route,
  logout: logoutRoute,
  refresh: refreshTokenRoute,
  post: postRoute,
  postPublic: postPublicRoute,
  draft: draftRoute,
};

export default routes;
