import { Request, Response } from 'express';
import MainModel from '../../../models/MainModel';
import userService from '../../../services/user/userService';
import User from '../../../models/User';

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
    const model = await MainModel;
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
    console.log(userJoins);

    const userPasskeys = userJoins?.UserPasskeys;
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
          isPasskey: userPasskeys ? true : null,
          isAuthApp: userSecret ? true : null
        },
        userOauth
      }
    });
  }
};

export default securityController;
