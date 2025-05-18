import { Request, Response } from 'express';
import userService from '../../../services/user/userService';
import User from '../../../models/User';
import initMainModel from '../../../models/initMainModel';
import { CommonStatus, EmailSubject } from '../../../utils/enums';
import userRequestService from '../../../services/user/userRequestService';
import bcryptjs from 'bcryptjs';
import { generateClientId } from '../../../utils/helper';

type UserJoins =
  | (User & {
      password: string;
      UserPasskeys?: { publicKey: Buffer }[];
      UserSetting?: { twoFaEnabled: boolean; twoFaMethod: string };
      UserTotpSecret?: { userId: string };
    })
  | undefined;

const securityController = {
  async getSecurity(req: Request, res: Response) {
    const { userId } = req;
    const model = await initMainModel;
    if (!model) {
      console.log('securityController.ts >>> Database connection failed!');
      return res.status(500).json({
        status: 'Internal server error',
        error: 'Database connection failed!'
      });
    }

    const refreshToken = req.cookies[`${process.env.REFRESH_TOKEN}`];
    const token = await model.refreshToken.findByPk(refreshToken, {
      attributes: ['clientId']
    });

    const userJoins = (await model.user.findByPk(userId, {
      attributes: ['password'],
      include: [
        {
          model: model.userPasskey,
          attributes: ['publicKey']
        },
        {
          model: model.userSetting,
          attributes: ['twoFaEnabled', 'twoFaMethod']
        },
        {
          model: model.userTotpSecret,
          attributes: ['userId']
        }
      ]
    })) as UserJoins;

    const userPasswordExist = userJoins?.password ? true : null;
    const userPasskeys = userJoins?.UserPasskeys;
    const isUserPasskeys = userPasskeys ? userPasskeys.length > 0 : false;
    const isTwoFAEnabled = userJoins?.UserSetting?.twoFaEnabled;
    const twoFAMethod = userJoins?.UserSetting?.twoFaMethod;
    const userSecret = userJoins?.UserTotpSecret;
    const userOauth = await userService.getOauthAssociations(userId);

    const emailSubject = userPasswordExist
      ? EmailSubject.ResetPassword
      : EmailSubject.AddPassword;
    const foundUserRequest = await userRequestService.getUserRequest(
      model,
      userId,
      emailSubject,
      token?.clientId
    );
    const userRequest =
      foundUserRequest !== null
        ? {
            request: foundUserRequest?.request,
            limit: foundUserRequest?.limit.getTime(),
            status: foundUserRequest?.status
          }
        : null;

    return res.status(200).json({
      status: 'Success',
      data: {
        userPassword: userPasswordExist,
        userTwoFA: {
          twoFAMethod: twoFAMethod != null ? twoFAMethod : null,
          isTwoFAEnabled: isTwoFAEnabled != null ? isTwoFAEnabled : null,
          isPasskey: isUserPasskeys ? true : null,
          isAuthApp: userSecret ? true : null
        },
        userOauth,
        userRequest
      }
    });
  },
  async addOrResetPassword(req: Request, res: Response) {
    const { password, subject, limit } = req.body;
    const { userId } = req;
    const model = await initMainModel;
    if (!model) {
      console.log('Database connection failed!');
      return res.status(500).json({
        status: 'Internal server error',
        error: 'Database connection failed!'
      });
    }
    const hashPassword = await bcryptjs.hash(password, 10);
    const [updatedData] = await model.user.update(
      { password: hashPassword },
      {
        where: { id: userId }
      }
    );

    const { clientId } = generateClientId(req.headers['user-agent']);
    if (!clientId) {
      return res
        .status(400)
        .json({ status: 'Bad request', error: 'User agent is invalid!' });
    }
    if (updatedData === 1) {
      await model.userRequest.update(
        { status: CommonStatus.Success },
        { where: { clientId, request: subject, limit } }
      );
      const status = subject === EmailSubject.AddPassword ? 201 : 200;

      return res.sendStatus(status);
    } else {
      return res.sendStatus(204);
    }
  }
};

export default securityController;
