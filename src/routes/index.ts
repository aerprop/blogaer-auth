import baseRoute from './baseRoute';
import registerRoute from './registerRoute';
import loginRoute from './loginRoute';
import logoutRoute from './logoutRoute';
import refreshTokenRoute from './refreshTokenRoute';
import blogRoute from './blogRoute';
import { RequestHandler } from 'express';

type Routes = {
  base: RequestHandler;
  register: RequestHandler;
  login: RequestHandler;
  logout: RequestHandler;
  refresh: RequestHandler;
  blogPost: RequestHandler;
}

const routes: Routes = { 
  base : baseRoute,
  register : registerRoute,
  login : loginRoute,
  logout : logoutRoute,
  refresh : refreshTokenRoute,
  blogPost : blogRoute
};
  
export default routes;
