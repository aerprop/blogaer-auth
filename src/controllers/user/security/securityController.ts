import { Request, Response } from 'express';
import mainModel from '../../../models/MainModel';
import userService from '../../../services/user/userService';
import User from '../../../models/User';
import MainModel from '../../../models/MainModel';
import { Op } from 'sequelize';

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
    const model = await mainModel;
    if (!model) {
      console.log('Database connection failed!');
      return res.status(500).json({
        status: 'Internal server error',
        error: 'Database connection failed!'
      });
    }
    const userOauth = await userService.getOauthAssociations(userId);
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

    const userPasskeys = userJoins?.UserPasskeys;
    const isUserPasskeys = userPasskeys ? userPasskeys.length > 0 : false;
    const isTwoFAEnabled = userJoins?.UserSetting?.twoFaEnabled;
    const twoFAMethod = userJoins?.UserSetting?.twoFaMethod;
    const userSecret = userJoins?.UserTotpSecret;

    return res.status(200).json({
      status: 'Success',
      data: {
        userPassword: userJoins?.password ? true : null,
        userTwoFA: {
          twoFAMethod: twoFAMethod != null ? twoFAMethod : null,
          isTwoFAEnabled: isTwoFAEnabled != null ? isTwoFAEnabled : null,
          isPasskey: isUserPasskeys ? true : null,
          isAuthApp: userSecret ? true : null
        },
        userOauth
      }
    });
  }
};

export default securityController;
