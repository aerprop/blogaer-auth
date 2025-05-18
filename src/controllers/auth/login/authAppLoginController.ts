import { Request, Response } from 'express';
import initMainModel from '../../../models/initMainModel';
import { col, fn, Op, where } from 'sequelize';
import User from '../../../models/User';
import UserTotpSecret from '../../../models/UserTotpSecret';
import { authenticator } from 'otplib';
import jwtService from '../../../services/auth/jwtService';
import { generateClientId } from '../../../utils/helper';

export default async function authAppLoginController(
  req: Request,
  res: Response
) {
  try {
    const { emailOrUsername, token } = req.body;
    const model = await initMainModel;
    if (!model) {
      console.log('Database connection failed!');
      return res.status(500).json({
        status: 'Internal server error',
        error: 'in-memory database connection failed!'
      });
    }

    const payload = (emailOrUsername as string).trim();
    const user = (await model.user.findOne({
      where: {
        [Op.or]: [
          { email: payload },
          where(fn('lower', col('username')), payload.toLowerCase())
        ]
      },
      include: {
        model: model.userTotpSecret,
        attributes: ['secret']
      }
    })) as User & { UserTotpSecret: UserTotpSecret };

    if (!user.id) {
      return res
        .status(404)
        .json({ status: 'Not found', message: 'User do not exist!' });
    }

    const isValid = authenticator.check(token, user.UserTotpSecret.secret);

    if (!isValid) {
      return res
        .status(400)
        .json({ status: 'Bad request', message: 'Token does not match.' });
    }
    const [accessToken, newRefreshToken] = await jwtService.generateJwt(
      user.username,
      user.roleId,
      user.id
    );

    const { clientId } = generateClientId(req.headers['user-agent']);
    if (!clientId) {
      return res
        .status(400)
        .json({ status: 'Bad request', error: 'User agent is invalid!' });
    }
    await model.refreshToken.create({
      token: newRefreshToken,
      userId: user.id,
      clientId
    });
    return res.status(200).json({
      status: 'Success',
      data: {
        username: user.username,
        name: user.name,
        email: user.email,
        desc: user.description,
        role: user.roleId === 1 ? 'Admin' : 'Author',
        img: user.picture,
        access: accessToken,
        refresh: newRefreshToken
      }
    });
  } catch (error) {
    console.error('totpLoginController ERROR >>>', error);

    return res.status(500).json({
      status: 'Internal server error',
      error: `${error instanceof Error ? error.message : error}`
    });
  }
}
