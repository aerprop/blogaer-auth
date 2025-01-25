import { Request, Response } from 'express';
import mainModel from '../../models/MainModel';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { LoginReqBody } from '../../types/common';

export default async function registerController(req: Request, res: Response) {
  const { username, email, password, deviceId }: LoginReqBody = req.body;
  if (!password) {
    return res.status(400).json({
      status: 'Error',
      message: `Register failed: password is empty`
    });
  }
  const hashPassword = await bcrypt.hash(password, 10);

  try {
    const model = await mainModel;
    if (!model) {
      console.log('Database connection failed!');
      return res.status(500).json({
        status: 'Internal server error',
        error: 'Database connection failed!'
      });
    }
    const user = await model.user.create({
      username,
      email,
      password: hashPassword
    });

    if (!user || !user.id) throw new Error('Create user failed');

    const accessToken = jwt.sign(
      {
        UserInfo: {
          id: user.id,
          username: user.username,
          role: user.roleId === 2 ? 'Author' : 'Admin'
        }
      },
      process.env.ACCESS_TOKEN_SECRET as string,
      { expiresIn: '30m' }
    );

    const refreshToken = jwt.sign(
      {
        UserInfo: {
          id: user.id,
          username: user.username
        }
      },
      process.env.REFRESH_TOKEN_SECRET as string,
      { expiresIn: '1d' }
    );

    await model.refreshToken.create({
      token: refreshToken,
      userId: user.id,
      clientId: deviceId
    });

    res.status(201).json({
      status: 'Registered',
      message: 'User successfully registered',
      data: {
        username: user.username,
        email: user.email,
        role: user.roleId === 2 ? 'Author' : 'Admin',
        token: accessToken,
        refresh: refreshToken
      }
    });
  } catch (error) {
    console.error('Register', error);

    return res.status(500).json({
      status: 'Internal server error',
      message: `Register error: ${error}.`
    });
  }
}
