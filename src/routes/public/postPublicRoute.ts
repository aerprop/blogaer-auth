import postController from '../../controllers/postController';
import initPubConChan from '../../middlewares/messaging/initPubConChan';
import { routerInit } from '../router';

const postPublicRoute = routerInit
  .use(initPubConChan)
  .get(`${process.env.BASE_ROUTE}/post/public`, postController.getPostsByPage)
  .get(
    `${process.env.BASE_ROUTE}/post/public/:id`,
    postController.getPostById
  );

export default postPublicRoute;
