import settingsController from '../../../controllers/user/settingsController';
import { router } from '../../router';

const settingsRoute = router().patch(
  `${process.env.BASE_ROUTE}/user/setting`,
  settingsController.patchSettings
);

export default settingsRoute;
