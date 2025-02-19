import { Request, Response } from 'express';
import mainModel from '../../models/MainModel';

const settingsController = {
  async patchSettings(req: Request, res: Response) {
    const { twoFaEnabled, twoFaMethod, preference } = req.body;

    const model = await mainModel;
    if (!model) {
      console.log('Database connection failed!');
      return res.status(500).json({
        status: 'Internal server error',
        error: 'Database connection failed!'
      });
    }
    await model.userSetting.update(
      { twoFaEnabled, twoFaMethod, preference },
      { where: { userId: req.userId } }
    );

    return res.status(200).json({
      status: 'Success',
      message: 'Settings successfully updated.'
    });
  }
};

export default settingsController;
