import { Request, Response } from 'express';
import initMainModel from '../../models/initMainModel';
import RefreshToken from '../../models/RefreshToken';

const checkUserController = {
  async checkUsername(req: Request, res: Response) {
    const refreshToken = req.cookies[`${process.env.REFRESH_TOKEN}`];
    if (!refreshToken) {
      return res.status(401).json({
        status: 'Unauthorized',
        message: 'No login cookie provided.'
      });
    }
    const model = await initMainModel;
    if (!model) {
      console.log('Database connection failed!');
      return res.status(500).json({
        status: 'Internal server error',
        error: 'Database connection failed!'
      });
    }

    const foundToken = (await model.refreshToken.findByPk(refreshToken, {
      attributes: ['token'],
      include: {
        model: model.user,
        attributes: ['username']
      }
    })) as RefreshToken & { User: { username: string } };

    if (!foundToken) {
      return res.status(404).json({
        status: 'Not found',
        error: 'Refresh token not found!'
      });
    }

    return res.status(200).json({
      status: 'Success',
      data: { username: foundToken.User.username }
    });
  }
};

export default checkUserController;
