import { Request, Response } from 'express';
import Models from '../models';
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

  const foundToken = (await Models.RefreshToken.findOne({
    where: { token: refreshToken },
    include: [
      {
        model: Models.User,
        attributes: ['username']
      }
    ]
  })) as RefreshTokenJoinUser;

  console.log('logout.ts 32: ', foundToken);

  if (!foundToken) {
    res.clearCookie('jwt', {
      httpOnly: true,
      secure: true,
      sameSite: 'none'
    });

    return res.sendStatus(204);
  }

  try {
    await Models.RefreshToken.destroy({
      where: { token: refreshToken }
    });

    res.clearCookie('jwt', {
      httpOnly: true,
      secure: true,
      sameSite: 'none'
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
