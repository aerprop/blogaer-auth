import { Request, Response } from 'express';
import MainModel from '../../../models/MainModel';
import { Op } from 'sequelize';

const twoFAController = {
  async getTwoFAStatus(req: Request, res: Response) {
    const { emailOrUsername } = req.body;
    const model = await MainModel;
    const user = await model.user.findOne({
      where: {
        [Op.or]: {
          email: emailOrUsername,
          username: {
            [Op.like]: emailOrUsername
          }
        }
      },
      include: [
        {
          model: model.userSetting
        },
        {
          model: model.userPasskey
        },
        {
          model: model.userTotpSecret
        }
      ]
    });
  },
  async patchTwoFA(req: Request, res: Response) {
    return res.status(200).json();
  },
  async deleteUserPasskey(req: Request, res: Response) {
    const { userId } = req;
    const model = await MainModel;
    const refreshToken = req.cookies[`${process.env.REFRESH_TOKEN}`];
    const token = await model.refreshToken.findByPk(refreshToken, {
      attributes: ['clientId']
    });
    const clientId = token?.clientId;
    await model.userPasskey.destroy({ where: { userId, clientId } });
    return res.sendStatus(204);
  }
};

export default twoFAController;
