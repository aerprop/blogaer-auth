import { Request, Response } from 'express';
import models from '../models';
import { LoginReqBody } from '../utils/types';
import jwt from 'jsonwebtoken';

export default async function googleOauth2Controller(
  req: Request,
  res: Response
) {
  const { email, picture, verified }: LoginReqBody = req.body;

  if (!email) {
    return res.status(400).json({
      status: 'Error',
      message: `Register failed: missing email!: ${email}`
    });
  }
  try {
    const userExist = await models.User.findOne({
      where: { email }
    });
    const userData = {
      id: '',
      username: '',
      email: '',
      roleId: 2,
      accessToken: '',
      refreshToken: ''
    };
    if (!userExist) {
      const user = await models.User.create({
        username: email,
        email,
        picture,
        verified
      });
      if (!user) throw new Error(`Inserting user data failed!: ${user}`);
      if (user.id) {
        await models.UserProvider.create({
          provider: 'google',
          userId: user.id
        });
        userData.id = user.id;
      }
      userData.username = user.username;
      userData.email = user.email;
      userData.roleId = user.roleId || 2;
      userData.accessToken = jwt.sign(
        {
          UserInfo: {
            id: user.id,
            username: user.username,
            role: user.roleId === 2 ? 'Author' : 'Admin'
          }
        },
        process.env.ACCESS_TOKEN_SECRET as string,
        { expiresIn: '10m' }
      );
      userData.refreshToken = jwt.sign(
        {
          UserInfo: {
            id: user.id,
            username: user.username
          }
        },
        process.env.REFRESH_TOKEN_SECRET as string,
        { expiresIn: '1d' }
      );
    } else {
      if (userExist.id) userData.id = userExist.id;
      userData.username = userExist.username;
      userData.email = userExist.email;
      userData.roleId = userExist.roleId || 2;
      userData.accessToken = jwt.sign(
        {
          UserInfo: {
            id: userExist.id,
            username: userExist.username,
            role: userExist.roleId === 2 ? 'Author' : 'Admin'
          }
        },
        process.env.ACCESS_TOKEN_SECRET as string,
        { expiresIn: '30m' }
      );
      userData.refreshToken = jwt.sign(
        {
          UserInfo: {
            id: userExist.id,
            username: userExist.username
          }
        },
        process.env.REFRESH_TOKEN_SECRET as string,
        { expiresIn: '1d' }
      );
    }

    await models.RefreshToken.create({
      token: userData.refreshToken,
      userId: userData.id
    });

    res.status(userExist ? 200 : 201).json({
      status: userExist ? 'Success' : 'Created',
      message: 'Login successful',
      data: {
        username: userData.username,
        email: userData.email,
        role: userData.roleId === 2 ? 'Author' : 'Admin',
        access: userData.accessToken,
        refresh: userData.refreshToken
      }
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      status: 'Error',
      message: `Login failed: ${error}`
    });
  }
}
