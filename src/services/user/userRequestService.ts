import { Op } from 'sequelize';
import { MainModel } from '../../models/initMainModel';
import { CommonStatus, EmailSubject } from '../../utils/enums';

const userRequestService = {
  async getUserRequest(
    model: MainModel,
    userId: string,
    request: EmailSubject,
    clientId?: string
  ) {
    const now = Date.now();
    const twentyFourHoursAgo = new Date(now - 24 * 60 * 60 * 1000);
    const userRequest = await model.userRequest.findOne({
      where: {
        userId,
        clientId,
        request,
        createdAt: { [Op.gte]: twentyFourHoursAgo }
      },
      order: [['createdAt', 'DESC']]
    });

    if (userRequest) {
      const limit = new Date(userRequest.limit).getTime();
      if (userRequest.status === CommonStatus.Pending && now > limit) {
        await userRequest.update({ status: CommonStatus.Expired });
      }
    }

    return userRequest;
  },
  async getEmailAndUsernameRequests(
    model: MainModel,
    userId: string,
    clientId?: string
  ) {
    const now = Date.now();
    const twentyFourHoursAgo = new Date(now - 24 * 60 * 60 * 1000);
    const emailRequest = await model.userRequest.findOne({
      where: {
        userId,
        clientId,
        request: EmailSubject.UpdateEmail,
        createdAt: { [Op.gte]: twentyFourHoursAgo }
      },
      order: [['createdAt', 'DESC']]
    });
    const usernameRequest = await model.userRequest.findOne({
      where: {
        userId,
        clientId,
        request: EmailSubject.UpdateUsername,
        createdAt: { [Op.gte]: twentyFourHoursAgo }
      },
      order: [['createdAt', 'DESC']]
    });
    if (emailRequest) {
      const limit = new Date(emailRequest.limit).getTime();
      if (emailRequest.status === CommonStatus.Pending && now > limit) {
        await emailRequest.update({ status: CommonStatus.Expired });
      }
    }
    if (usernameRequest) {
      const limit = new Date(usernameRequest.limit).getTime();
      if (usernameRequest.status === CommonStatus.Pending && now > limit) {
        await usernameRequest.update({ status: CommonStatus.Expired });
      }
    }

    return { emailRequest, usernameRequest };
  }
};

export default userRequestService;
