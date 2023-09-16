import baseRoute from './baseRoute.js';
import registerRoute from './registerRoute.js';
import loginRoute from './loginRoute.js';
import logoutRoute from './logoutRoute.js';
import refreshTokenRoute from './refreshTokenRoute.js';
import blogPostProxyRoute from './blogPostProxyRoute.js';

const routes = {};

routes.base = baseRoute;
routes.register = registerRoute;
routes.login = loginRoute;
routes.logout = logoutRoute;
routes.refresh = refreshTokenRoute;
routes.blogPost = blogPostProxyRoute;

export default routes;
