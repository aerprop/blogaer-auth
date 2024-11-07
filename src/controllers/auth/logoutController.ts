import { Request, Response } from 'express';
import models from '../../models';
import RefreshToken from '../../models/refreshToken';

type RefreshTokenJoinUser = RefreshToken & {
  User: {
    username: string;
  };
};

const logoutController = async (req: Request, res: Response) => {
  const refreshToken = req.cookies[`${process.env.REFRESH_TOKEN}`];
  if (!refreshToken) return res.sendStatus(204);

  const model = await models;
  const foundToken = (await model.refreshToken.findOne({
    where: { token: refreshToken },
    include: [
      {
        model: model.user,
        attributes: ['username']
      }
    ]
  })) as RefreshTokenJoinUser;

  try {
    await model.refreshToken.destroy({
      where: { token: refreshToken }
    });

    console.log(`${foundToken.User.username} has logged out.`);
    return res.status(200).json({
      status: 'OK',
      message: `${foundToken.User.username} has successfully logged out.`
    });
  } catch (error) {
    console.error('Logout', error);

    return res.status(500).json({
      status: 'Internal server error',
      message: `Logout error: ${
        error instanceof Error ? error.message : 'Unknown error occurred!'
      }.`
    });
  }
};

export default logoutController;
