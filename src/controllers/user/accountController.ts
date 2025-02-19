import { Request, Response } from 'express';
import MainModel from '../../models/MainModel';

const accountController = {
  async patchAccount(req: Request, res: Response) {
    const { username, email, name, description, picture } = req.body;
    const model = await MainModel;
    if (!model) {
      console.log('Database connection failed!');
      return res.status(500).json({
        status: 'Internal server error',
        error: 'Database connection failed!'
      });
    }
    await model.user.update(
      { username, email, name, description, picture },
      { where: { id: req.userId } }
    );

    return res.status(200).json({
      status: 'Success',
      message: 'Description successfully updated.'
    });
  },
  async resetPassword(req: Request, res: Response) {
    // to be continued...
  }
};

export default accountController;
