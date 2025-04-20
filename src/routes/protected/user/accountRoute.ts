import accountController from '../../../controllers/user/accountController';
import verifyRequestForm from '../../../middlewares/verifyRequestForm';
import verifyRequestFormOtp from '../../../middlewares/verifyRequestFormOtp';
import { router } from '../../router';

const accountRoute = router()
  .get(`${process.env.BASE_ROUTE}/user/account`, accountController.getAccount)
  .patch(
    `${process.env.BASE_ROUTE}/user/account`,
    accountController.patchAccount
  )
  .patch(`${process.env.BASE_ROUTE}/user/account/update-email`, [
    verifyRequestFormOtp,
    accountController.patchAccount
  ])
  .patch(`${process.env.BASE_ROUTE}/user/account/update-username`, [
    verifyRequestForm,
    accountController.patchAccount
  ]);

export default accountRoute;
