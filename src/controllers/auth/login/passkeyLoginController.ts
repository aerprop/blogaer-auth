import { Request, Response } from 'express';
import mainModel from '../../../models/MainModel';
import { col, fn, Op, where } from 'sequelize';
import jwtService from '../../../services/auth/jwtService';
import { generateClientId } from '../../../utils/helper';

export default async function passkeyLoginController(
  req: Request,
  res: Response
) {
  const inMemModel = req.inMemModel;
  if (!inMemModel) {
    console.log('Failed to initialize in-memory database!');
    return res.status(500).json({
      status: 'Internal server error',
      error: 'In-memory database failed!'
    });
  }
  try {
    const { emailOrUsername, optionId } = req.body;
    const inMemOption = await inMemModel.webAuthnLoginOption.findOne({
      where: { passkeyId: optionId }
    });
    if (!inMemOption) {
      inMemModel.webAuthnLoginOption.truncate({
        cascade: true,
        restartIdentity: true
      });
      return res.status(401).json({
        status: 'Unauthorized',
        error: 'Webauthn login option do not match!'
      });
    }

    const model = await mainModel;
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

    if (!user) {
      return res.status(404).json({
        status: 'Not found',
        message: `Email or username of '${emailOrUsername}' do not exist.`
      });
    }

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

      await inMemModel.webAuthnLoginOption.truncate({
        cascade: true,
        restartIdentity: true
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
        message: 'Reuse refresh token detected!'
      });
    }
  } catch (error) {
    inMemModel.webAuthnLoginOption.truncate({
      cascade: true,
      restartIdentity: true
    });
    console.error('passkeyLoginController ERROR >>>', error);

    return res.status(500).json({
      status: 'Internal server error',
      error: `${error instanceof Error ? error.message : error}`
    });
  }
}
