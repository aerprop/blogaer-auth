import { Request, Response } from 'express';
import MainModel from '../../models/MainModel';

const settingsController = {
  async patchSettings(req: Request, res: Response) {
    const { twoFaEnabled, twoFaMethod, preference } = req.body;
    const model = await MainModel;
    await model.userSetting.update(
      { twoFaEnabled, twoFaMethod, preference },
      { where: { id: req.userId } }
    );

    return res.status(200).json({
      status: 'Success',
      message: 'Settings successfully updated.'
    });
  }
};

export default settingsController;
