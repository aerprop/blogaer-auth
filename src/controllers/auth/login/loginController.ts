import initMainModel from '../../../models/initMainModel';
import bcryptjs from 'bcryptjs';
import { Request, Response } from 'express';
import { col, fn, Op, where } from 'sequelize';
import jwtService from '../../../services/auth/jwtService';
import { generateClientId } from '../../../utils/helper';

export default async function loginController(req: Request, res: Response) {
  const { emailOrUsername, password } = req.body;

  const model = await initMainModel;
  if (!model) {
    console.log('Database connection failed!');
    return res.status(500).json({
      status: 'Internal server error',
      error: 'Database connection failed!'
    });
  }

  const payload = (emailOrUsername as string).trim();
  const user = await model.user.findOne({
    where: {
      [Op.or]: [
        { email: payload },
        where(fn('lower', col('username')), payload.toLowerCase())
      ]
    }
  });

  if (!user || !user.password) {
    return res.status(404).json({
      status: 'Not found',
      error: `Email or username of '${payload}' do not exist.`
    });
  }

  const correctPassword = await bcryptjs.compare(password, user.password);
  if (!correctPassword) {
    return res.status(401).json({
      status: 'Unauthorized',
      error: 'Password do not match!'
    });
  }

  try {
    if (user.id) {
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
    } else {
      const refreshToken = req.cookies[`${process.env.REFRESH_TOKEN}`];
      const deletedToken = await model.refreshToken.destroy({
        where: { token: refreshToken }
      });
      console.log(
        'Deleted refresh token after reuse detected >>>',
        deletedToken
      );

      return res.status(403).json({
        status: 'Forbidden',
        error: 'Reuse refresh token detected!'
      });
    }
  } catch (error) {
    console.error(
      'Login Error >>>',
      `${error instanceof Error ? error.message : error}`
    );
    return res.status(500).json({
      status: 'Internal server error',
      error: `${error instanceof Error ? error.message : error}`
    });
  }
}
