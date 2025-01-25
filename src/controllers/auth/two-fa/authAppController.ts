import { Request, Response } from 'express';
import qrcode from 'qrcode';
import mainModel from '../../../models/MainModel';
import { authenticator } from 'otplib';

const authAppController = {
  async registerAuthApp(req: Request, res: Response) {
    const inMemModel = req.inMemModel;
    if (!inMemModel) {
      console.log('Failed to initialize in-memory database!');
      return res.status(500).json({
        status: 'Internal server error',
        error: 'in-memory database failed!'
      });
    }
    try {
      const { userId } = req;
      const model = await mainModel;
      if (!model) {
        console.log('Database connection failed!');
        return res.status(500).json({
          status: 'Internal server error',
          error: 'in-memory database connection failed!'
        });
      }
      const user = await model.user.findByPk(userId, { attributes: ['email'] });
      if (!user?.email) {
        return res
          .status(404)
          .json({ status: 'Not found', error: 'User not found!' });
      }
      const secret = authenticator.generateSecret();
      const uri = authenticator.keyuri(user.email, 'Blogaer', secret);
      console.log('token >>', authenticator.generate(secret));

      qrcode.toDataURL(uri, async (err, url) => {
        if (err) {
          return res.status(500).json({
            status: 'Internal server error',
            error: 'Something is wrong when generating the qrcode!'
          });
        }
        const tempSecret = await inMemModel.totpSecret.create({
          userId,
          secret
        });

        return res
          .status(200)
          .json({ status: 'Success', data: { url, secretId: tempSecret.id } });
      });
    } catch (error) {
      inMemModel.totpSecret.truncate({ cascade: true, restartIdentity: true });
      console.error('registerAuthApp error >>>', error);

      return res.status(500).json({
        status: 'Internal server error',
        error: error instanceof Error ? error.message : 'Internal server error!'
      });
    }
  },
  async verifyAuthAppToken(req: Request, res: Response) {
    const inMemModel = req.inMemModel;
    if (!inMemModel) {
      console.log('Failed to initialize in-memory database!');
      return res.status(500).json({
        status: 'Internal server error',
        error: 'in-memory database failed!'
      });
    }
    try {
      const { token, secretId } = req.body;
      const { userId } = req;
      const userSecret = await inMemModel.totpSecret.findByPk(secretId, {
        attributes: ['secret']
      });
      if (!userSecret?.secret) {
        inMemModel.totpSecret.truncate({
          cascade: true,
          restartIdentity: true
        });
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

      const model = await mainModel;
      if (!model) {
        console.log('Database connection failed!');
        return res.status(500).json({
          status: 'Internal server error',
          error: 'Database connection failed!'
        });
      }
      const savedSecret = await model.userTotpSecret.create({ userId, secret });
      if (savedSecret) {
        inMemModel.totpSecret.truncate({
          cascade: true,
          restartIdentity: true
        });
      }

      return res
        .status(201)
        .json({ status: 'Created', message: 'Token verified.' });
    } catch (error) {
      inMemModel.totpSecret.truncate({ cascade: true, restartIdentity: true });
      console.error('verifyTotp error >>>', error);

      return res.status(500).json({
        status: 'Internal server error',
        error: error instanceof Error ? error.message : 'Internal server error!'
      });
    }
  }
};

export default authAppController;
