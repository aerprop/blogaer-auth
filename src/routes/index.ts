import baseRoute from './baseRoute.js';
import registerRoute from './registerRoute.js';
import loginRoute from './loginRoute.js';
import logoutRoute from './logoutRoute.js';
import refreshTokenRoute from './refreshTokenRoute.js';
import blogRoute from './blogRoute.js';
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
