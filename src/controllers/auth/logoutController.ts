import { Request, Response } from 'express';
import mainModel from '../../models/MainModel';

const logoutController = async (req: Request, res: Response) => {
  const refreshToken = req.cookies[`${process.env.REFRESH_TOKEN}`];
  if (!refreshToken) return res.sendStatus(204);

  const model = await mainModel;
  if (!model) {
    console.log('Database connection failed!');
    return res.status(500).json({
      status: 'Internal server error',
      error: 'Database connection failed!'
    });
  }

  try {
    await model.refreshToken.destroy({
      where: { token: refreshToken },
    });

    return res.sendStatus(204);
  } catch (error) {
    console.error('logoutController >>> Logout error');

    return res.status(500).json({
      status: 'Internal server error',
      message: `Logout error: ${
        error instanceof Error ? error.message : 'Unknown error occurred!'
      }.`
    });
  }
};

export default logoutController;
