import rootRoute from './rootRoute.js';
import registerRoute from './registerRoute.js';
import loginRoute from './loginRoute.js';
import logoutRoute from './logoutRoute.js';
import refreshTokenRoute from './refreshTokenRoute.js';

const routes = {};

routes.root = rootRoute;
routes.register = registerRoute;
routes.login = loginRoute;
routes.logout = logoutRoute;
routes.refresh = refreshTokenRoute;

export default routes;
