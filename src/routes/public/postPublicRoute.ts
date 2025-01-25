import postController from '../../controllers/postController';
import postRpcChan from '../../middlewares/postRpcChan';
import { routerInit } from '../router';

const postPublicRoute = routerInit
  .use(postRpcChan)
  .get(`${process.env.BASE_ROUTE}/post/public`, postController.getPostsByPage)
  .get(
    `${process.env.BASE_ROUTE}/post/public/:slug`,
    postController.getPostById
  )
  .get(
    `${process.env.BASE_ROUTE}/post/public/explore`,
    postController.explorePosts
  );

export default postPublicRoute;
