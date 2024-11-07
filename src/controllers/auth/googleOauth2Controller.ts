import { Request, Response } from 'express';
import jwt from 'jsonwebtoken';
import axios from 'axios';
import models from '../../models';
import { generateRandomChars } from '../../utils/helper';

export default async function googleOauth2Controller(
  req: Request,
  res: Response
) {
  const codes = req.oauthCode.split('-');
  const clientId = codes[codes.length - 1];
  const code = req.oauthCode.replace('-' + clientId, '');

  if (!code) {
    return res.status(400).json({
      status: 'Error',
      error: `Register failed: missing google oauth2 code!: ${code}`
    });
  }
  try {
    const tokenRes = await axios.post('https://oauth2.googleapis.com/token', {
      code,
      client_id: `${process.env.GOOGLE_OAUTH2_ID}`,
      client_secret: `${process.env.GOOGLE_OAUTH2_SECRET}`,
      redirect_uri: 'http://localhost:3000/api/auth/callback/google',
      grant_type: 'authorization_code'
    });

    if (!tokenRes.data) throw new Error(tokenRes.statusText);

    const oauthToken = tokenRes.data.access_token;
    console.log('google oauth access token >>>', oauthToken);

    const userInfoRes = await axios.get(
      'https://www.googleapis.com/oauth2/v3/userinfo',
      {
        headers: {
          Authorization: `Bearer ${oauthToken}`
        }
      }
    );

    if (!userInfoRes.data) throw new Error(tokenRes.statusText);

    const userInfo = userInfoRes.data;
    console.log('google oauth user info >>>', userInfo);

    const model = await models;
    const [user, created] = await model.user.findOrCreate({
      where: {
        email: userInpmnfo.email
      },
      defaults: {
        username: userInfo.given_name + generateRandomChars(4),
        name: userInfo.given_name,
        email: userInfo.email,
        picture: userInfo.picture,
        verified: true
      },
      attributes: [
        'id',
        'username',
        'name',
        'email',
        'description',
        'roleId',
        'picture'
      ]
    });

    if (created && user.id) {
      await model.userOauth.create({
        userId: user.id,
        oauthProvider: 'Google',
        oauthEmail: user.email
      });
    }

    const accessToken = jwt.sign(
      {
        UserInfo: {
          id: user.id,
          username: user.username,
          role: user.roleId === 2 ? 'Author' : 'Admin'
        }
      },
      `${process.env.ACCESS_TOKEN_SECRET}`,
      { expiresIn: '15m' }
    );

    const newRefreshToken = jwt.sign(
      {
        UserInfo: {
          id: user.id,
          username: user.username
        }
      },
      `${process.env.REFRESH_TOKEN_SECRET}`,
      { expiresIn: '1d' }
    );

    await model.refreshToken.create({
      token: newRefreshToken,
      userId: `${user.id}`,
      loginWith: 'Google',
      clientId
    });

    res.status(200).json({
      status: 'Success',
      message: `User ${user.username} successfully logged in.`,
      data: {
        username: user.username,
        name: user.name,
        email: user.email,
        desc: user.description,
        role: user.roleId === 2 ? 'Author' : 'Admin',
        img: user.picture,
        access: accessToken,
        refresh: newRefreshToken
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
