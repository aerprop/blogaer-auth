import models from '../models';
import bcrypt from 'bcrypt';
import { Request, Response } from 'express';
import jwt from 'jsonwebtoken';
import { Op } from 'sequelize';

export default async function loginController(req: Request, res: Response) {
  const refreshToken = req.cookies[`${process.env.REFRESH_TOKEN}`];
  const { emailOrUsername, password, clientId } = req.body;

  const model = await models;
  const foundUser = await model.user.findOne({
    where: {
      [Op.or]: {
        email: emailOrUsername,
        username: emailOrUsername
      }
    },
    attributes: ['id', 'username', 'email', 'password', 'roleId', 'picture']
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

  const accessToken = jwt.sign(
    {
      UserInfo: {
        id: foundUser.id,
        username: foundUser.username,
        role: foundUser.roleId === 2 ? 'Author' : 'Admin'
      }
    },
    process.env.ACCESS_TOKEN_SECRET as string,
    { expiresIn: '15m' }
  );

  const newRefreshToken = jwt.sign(
    {
      UserInfo: {
        id: foundUser.id,
        username: foundUser.username
      }
    },
    process.env.REFRESH_TOKEN_SECRET as string,
    { expiresIn: '1d' }
  );

  try {
    if (foundUser.id) {
      await model.refreshToken.create({
        token: newRefreshToken,
        userId: foundUser.id,
        clientId
      });

      // Send the response
      res.status(200).json({
        status: 'Success',
        message: `User ${foundUser.username} successfully logged in.`,
        data: {
          username: foundUser.username,
          email: foundUser.email,
          role: foundUser.roleId === 2 ? 'Author' : 'Admin',
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
