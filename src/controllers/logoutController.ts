import { Request, Response } from 'express';
import models from '../models';
import RefreshToken from '../models/refreshToken';

type Cookies = {
  jwt: string;
};

type RefreshTokenJoinUser = RefreshToken & {
  User: {
    username: string;
  };
};

const logoutController = async (req: Request, res: Response) => {
  const cookies: Cookies = req.cookies;
  if (!cookies.jwt) return res.sendStatus(204);

  const refreshToken = cookies.jwt;
  const foundToken = (await models.RefreshToken.findOne({
    where: { token: refreshToken },
    include: [
      {
        model: models.User,
        attributes: ['username']
      }
    ]
  })) as RefreshTokenJoinUser;

  if (!foundToken) {
    res.clearCookie('jwt', {
      httpOnly: true,
      secure: true,
      sameSite: 'none'
    });

    return res.sendStatus(204);
  }

  try {
    await models.RefreshToken.destroy({
      where: { token: refreshToken }
    });

    return res.status(200).json({
      status: 'OK',
      message: `${foundToken.User.username} has successfully logged out.`
    });
  } catch (error) {
    console.error('Logout', error);

    return res.status(500).json({
      status: 'Internal server error',
      message: `Logout error: ${error}.`,
      data: {
        user: foundToken.User.username
      }
    });
  }
};

export default logoutController;
