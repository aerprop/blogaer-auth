import { Request, Response } from 'express';
import initMainModel from '../../../models/initMainModel';
import { Op } from 'sequelize';
import { TwoFAMethod } from '../../../utils/enums';
import User from '../../../models/User';
import UserSetting from '../../../models/UserSetting';
import UserPasskey from '../../../models/UserPasskey';
import UserTotpSecret from '../../../models/UserTotpSecret';
import { authenticator } from 'otplib';

const twoFAController = {
  async getAuthAppToken(req: Request, res: Response) {
    const model = await initMainModel;
    if (!model) {
      console.log('Database connection failed!');
      return res.status(500).json({
        status: 'Internal server error',
        error: 'in-memory database connection failed!'
      });
    }

    const { username } = req.params;
    const payload = (username as string).trim();
    const user = (await model.user.findOne({
      where: {
        [Op.or]: {
          email: payload,
          username: {
            [Op.like]: `%${payload.toLowerCase()}%`
          }
        }
      },
      attributes: ['id'],
      include: {
        model: model.userTotpSecret,
        attributes: ['secret']
      }
    })) as User & { UserTotpSecret: UserTotpSecret };

    const secret = user.UserTotpSecret.secret;
    const token = authenticator.generate(secret);
    const isValid = authenticator.verify({ token, secret });

    return res
      .status(200)
      .json({ status: 'success', data: { token, isValid, secret } });
  },
  async getTwoFAStatus(req: Request, res: Response) {
    try {
      const { emailOrUsername } = req.params;
      const model = await initMainModel;
      if (!model) {
        console.log('Database connection failed!');
        return res.status(500).json({
          status: 'Internal server error',
          error: 'Database connection failed!'
        });
      }

      const payload = (emailOrUsername as string).trim();
      const user = (await model.user.findOne({
        where: {
          [Op.or]: {
            email: payload,
            username: {
              [Op.like]: `%${payload.toLowerCase()}%`
            }
          }
        },
        attributes: ['id'],
        include: [
          {
            model: model.userSetting,
            attributes: ['twoFaEnabled', 'twoFaMethod']
          },
          {
            model: model.userPasskey,
            attributes: ['publicKey']
          },
          {
            model: model.userTotpSecret,
            attributes: ['secret']
          }
        ]
      })) as User & {
        UserSetting: UserSetting;
        UserPasskeys: UserPasskey[];
        UserTotpSecret: UserTotpSecret;
      };
      if (
        !user.UserSetting.twoFaMethod ||
        (!user.UserPasskeys && !user.UserTotpSecret)
      ) {
        throw new Error('Missing two factor authentication!');
      }

      return res.status(200).send({
        status: 'Success',
        data: { method: user.UserSetting.twoFaMethod }
      });
    } catch (error) {
      return res
        .status(404)
        .send({ status: 'Not found', error: 'Two FA method not found.' });
    }
  },
  async deleteUserPasskey(req: Request, res: Response) {
    const { userId } = req;
    const model = await initMainModel;
    if (!model) {
      console.log('Database connection failed!');
      return res.status(500).json({
        status: 'Internal server error',
        error: 'Database connection failed!'
      });
    }

    const refreshToken = req.cookies[`${process.env.REFRESH_TOKEN}`];
    const token = await model.refreshToken.findByPk(refreshToken, {
      attributes: ['clientId']
    });

    const clientId = token?.clientId;
    await model.userPasskey.destroy({ where: { userId, clientId } });

    const userSecret = await model.userTotpSecret.findOne({
      where: { userId }
    });
    if (userSecret) {
      await model.userSetting.update(
        { twoFaMethod: TwoFAMethod.App },
        { where: { userId } }
      );
    } else {
      await model.userSetting.update(
        { twoFaEnabled: false, twoFaMethod: null },
        { where: { userId } }
      );
    }

    return res.sendStatus(204);
  },
  async deleteUserSecret(req: Request, res: Response) {
    const { userId } = req;
    const model = await initMainModel;
    if (!model) {
      console.log('Database connection failed!');
      return res.status(500).json({
        status: 'Internal server error',
        error: 'Database connection failed!'
      });
    }
    const refreshToken = req.cookies[`${process.env.REFRESH_TOKEN}`];
    const token = await model.refreshToken.findByPk(refreshToken, {
      attributes: ['clientId']
    });
    const clientId = token?.clientId;
    await model.userTotpSecret.destroy({ where: { userId } });

    const userPasskey = await model.userPasskey.findOne({
      where: { userId, clientId }
    });
    if (userPasskey) {
      await model.userSetting.update(
        { twoFaMethod: TwoFAMethod.Passkey },
        { where: { userId } }
      );
    } else {
      await model.userSetting.update(
        { twoFaEnabled: false, twoFaMethod: null },
        { where: { userId } }
      );
    }

    return res.sendStatus(200);
  }
};

export default twoFAController;
