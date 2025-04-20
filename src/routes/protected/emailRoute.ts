import emailController from '../../controllers/email/emailController';
import { router } from '../router';

const emailRoute = router()
  .get(
    `${process.env.BASE_ROUTE}/email/user/add-password`,
    emailController.sendAddPasswordLink
  )
  .get(
    `${process.env.BASE_ROUTE}/email/user/reset-password`,
    emailController.sendResetPasswordLink
  )
  .get(
    `${process.env.BASE_ROUTE}/email/user/update-email`,
    emailController.sendUpdateEmailLink
  )
  .get(
    `${process.env.BASE_ROUTE}/email/user/update-email/otp-time`,
    emailController.getUpdateEmailOtpTime
  )
  .get(
    `${process.env.BASE_ROUTE}/email/user/update-username`,
    emailController.sendUpdateUsernameLink
  )
  .post(
    `${process.env.BASE_ROUTE}/email/user/update-email-otp`,
    emailController.sendUpdateEmailOtp
  );

export default emailRoute;
