import { Request, Response } from 'express';
import initMainModel from '../models/initMainModel';
import SavedAccount from '../models/SavedAccount';
import User from '../models/User';
import { col, fn, where } from 'sequelize';
import { Op } from 'sequelize';
import { generateClientId } from '../utils/helper';

const savedAccountsController = {
  async getSavedAccounts(req: Request, res: Response) {
    const model = await initMainModel;
    if (!model) {
      console.log('Database connection failed!');
      return res.status(500).json({
        status: 'Internal server error',
        error: 'Database connection failed!'
      });
    }

    const aWeekAgo = new Date();
    aWeekAgo.setDate(aWeekAgo.getDate() - 7);
    await model.savedAccount.destroy({
      where: {
        updatedAt: {
          [Op.lt]: aWeekAgo
        }
      }
    });

    console.log('USER AGENT >>', req.headers['user-agent'])

    const { clientId } = generateClientId(req.headers['user-agent']);
    if (!clientId) {
      return res
        .status(400)
        .json({ status: 'Bad request', error: 'User agent is invalid!' });
    }
    const savedAccount = (await model.savedAccount.findByPk(clientId, {
      include: {
        model: model.user,
        attributes: ['id', 'username', 'email', ['picture', 'img']]
      },
      attributes: ['clientId']
    })) as SavedAccount & { Users: User[] };

    if (savedAccount) {
      return res
        .status(200)
        .json({ status: 'Success', data: savedAccount.Users });
    } else {
      return res.sendStatus(204);
    }
  },
  async deleteSavedAccount(req: Request, res: Response) {
    const { username } = req.params;

    const model = await initMainModel;
    if (!model) {
      console.log('Database connection failed!');
      return res.status(500).json({
        status: 'Internal server error',
        error: 'Database connection failed!'
      });
    }

    const { clientId } = generateClientId(req.headers['user-agent']);
    if (!clientId) {
      return res
        .status(400)
        .json({ status: 'Bad request', error: 'User agent is invalid!' });
    }
    const savedAccount = await model.savedAccount.findByPk(clientId);
    const user = await model.user.findOne({
      where: where(fn('lower', col('username')), username.trim().toLowerCase())
    });

    if (!savedAccount || !user) {
      return res.status(404).json({
        status: 'Not found',
        error: !savedAccount ? 'saved account not found!' : 'user not found!'
      });
    }
    await savedAccount.destroy();
    await savedAccount.removeUser(user);

    return res.sendStatus(204);
  }
};

export default savedAccountsController;
