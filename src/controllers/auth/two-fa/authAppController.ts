import { Request, Response } from 'express';
import qrcode from 'qrcode';
import MainModel from '../../../models/MainModel';
import inMemoryModel from '../../../models/in-memory/InMemoryModel';
import { authenticator } from 'otplib';

const inMemModel = inMemoryModel();
authenticator.options = { window: 5 };
const authAppController = {
  async registerAuthApp(req: Request, res: Response) {
    const { userId } = req;
    const model = await MainModel;
    const user = await model.user.findByPk(userId, { attributes: ['email'] });
    if (!user?.email) {
      return res
        .status(404)
        .json({ status: 'Not found', error: 'User not found!' });
    }
    const secret = authenticator.generateSecret();
    const uri = authenticator.keyuri(user.email, 'Blogaer', secret);

    qrcode.toDataURL(uri, async (err, url) => {
      if (err) {
        return res.status(500).json({
          status: 'Internal server error',
          error: 'Something is wrong when generating the qrcode!'
        });
      }

      const tempSecret = await inMemModel.totpSecret.create({ userId, secret });

      return res
        .status(200)
        .json({ status: 'Success', data: { url, secretId: tempSecret.id } });
    });
  },
  async verifyTotp(req: Request, res: Response) {
    const { token, secretId } = req.body;

    const { userId } = req;
    const userSecret = await inMemModel.totpSecret.findByPk(secretId, {
      attributes: ['secret']
    });
    if (!userSecret?.secret) {
      inMemModel.sequelize.close();
      return res.status(404).json({
        status: 'Not found',
        error: 'User authenticator secret not found!'
      });
    }
    const secret = userSecret?.secret;

    const isValid = authenticator.verify({ token, secret });
    if (!isValid) {
      return res
        .status(400)
        .json({ status: 'Bad request', message: 'Token does not match.' });
    }

    const model = await MainModel;
    const savedSecret = await model.userTotpSecret.create({ userId, secret });
    if (savedSecret) inMemModel.sequelize.close();

    return res
      .status(201)
      .json({ status: 'Created', message: 'Token verified.' });
  }
};

export default authAppController;
