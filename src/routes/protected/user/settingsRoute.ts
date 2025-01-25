import settingsController from '../../../controllers/user-settings/settingsController';
import { router } from '../../router';

const settingsRoute = router().patch(
  `${process.env.BASE_ROUTE}/user/settings`,
  settingsController.patchSettings
);

export default settingsRoute;
