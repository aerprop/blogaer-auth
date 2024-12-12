import models from '../../models/MainModel';
import bcrypt from 'bcrypt';
import { Request, Response } from 'express';
import jwt from 'jsonwebtoken';
import { Op } from 'sequelize';
import jwtService from '../../services/user/jwtService';

export default async function loginController(req: Request, res: Response) {
  const refreshToken = req.cookies[`${process.env.REFRESH_TOKEN}`];
  const { emailOrUsername, password, clientId } = req.body;

  const model = await models;
  const foundUser = await model.user.findOne({
    where: {
      [Op.or]: {
        email: emailOrUsername,
        username: {
          [Op.like]: emailOrUsername
        }
      }
    },
    attributes: [
      'id',
      'username',
      'name',
      'email',
      'description',
      'password',
      'roleId',
      'picture'
    ]
  });

  if (!foundUser || !foundUser.password) {
    return res.status(404).json({
      status: 'Not found',
      message: `Email or username of '${emailOrUsername}' do not exist.`
    });
  }

  const correctPassword = await bcrypt.compare(password, foundUser.password);
  if (!correctPassword) {
    return res.status(401).json({
      status: 'Unauthorized',
      message: 'Password do not match!'
    });
  }

  const [accessToken, newRefreshToken] = await jwtService.generateJwtService(
    foundUser.username,
    foundUser.roleId,
    foundUser.id
  );

  try {
    if (foundUser.id) {
      await model.refreshToken.create({
        token: newRefreshToken,
        userId: foundUser.id,
        clientId
      });

      return res.status(200).json({
        status: 'Success',
        data: {
          username: foundUser.username,
          name: foundUser.name,
          email: foundUser.email,
          desc: foundUser.description,
          role: foundUser.roleId === 1 ? 'Admin' : 'Author',
          img: foundUser.picture,
          access: accessToken,
          refresh: newRefreshToken
        }
      });
    } else {
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
    console.error('Login', error);
    return res.status(500).json({
      status: 'Internal server error',
      message: `Login error: ${error}.`
    });
  }
}
