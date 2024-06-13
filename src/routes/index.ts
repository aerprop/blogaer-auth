import { RequestHandler } from 'express';
import baseRoute from './baseRoute';
import registerRoute from './registerRoute';
import loginRoute from './loginRoute';
import logoutRoute from './logoutRoute';
import refreshTokenRoute from './refreshTokenRoute';
import blogRoute from './blogRoute';
import googleOauth2Route from './googleOauth2Route';
import testRoute from './testRoute';

type Routes = {
  base: RequestHandler;
  register: RequestHandler;
  login: RequestHandler;
  googleLogin: RequestHandler;
  logout: RequestHandler;
  refresh: RequestHandler;
  blogPost: RequestHandler;
  test: RequestHandler;
};

const routes: Routes = {
  base: baseRoute,
  register: registerRoute,
  login: loginRoute,
  googleLogin: googleOauth2Route,
  logout: logoutRoute,
  refresh: refreshTokenRoute,
  blogPost: blogRoute,
  test: testRoute
};

export default routes;
