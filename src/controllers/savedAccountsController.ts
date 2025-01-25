import { Request, Response } from 'express';
import mainModel from '../models/MainModel';
import SavedAccount from '../models/SavedAccount';
import User from '../models/User';
import { col, fn, where } from 'sequelize';

const savedAccountsController = {
  async getSavedAccounts(req: Request, res: Response) {
    const clientId = req.params.clientId;

    const model = await mainModel;
    if (!model) {
      console.log('Database connection failed!');
      return res.status(500).json({
        status: 'Internal server error',
        error: 'Database connection failed!'
      });
    }
    const savedAccounts = (await model.savedAccount.findByPk(clientId, {
      include: {
        model: model.user,
        attributes: ['id', 'username', 'email', ['picture', 'img']]
      },
      attributes: ['clientId']
    })) as SavedAccount & { Users: User[] };

    if (savedAccounts) {
      return res
        .status(200)
        .json({ status: 'Success', data: savedAccounts.Users });
    } else {
      return res.sendStatus(204);
    }
  },
  async deleteSavedAccount(req: Request, res: Response) {
    const username = req.params.username;
    const clientId = req.params.clientId;

    const model = await mainModel;
    if (!model) {
      console.log('Database connection failed!');
      return res.status(500).json({
        status: 'Internal server error',
        error: 'Database connection failed!'
      });
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

    const deleted = savedAccount.removeUser(user);
    console.log('deleted', deleted);

    return res.sendStatus(204);
  }
};

export default savedAccountsController;
