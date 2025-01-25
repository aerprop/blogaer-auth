import { Request, Response } from 'express';
import axios from 'axios';
import mainModel from '../../models/MainModel';
import { generateRandomChars } from '../../utils/helper';
import jwtService from '../../services/user/jwtService';

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

    const model = await mainModel;
    if (!model) {
      console.log('Database connection failed!');
      return res.status(500).json({
        status: 'Internal server error',
        error: 'Database connection failed!'
      });
    }
    const [user, isCreated] = await model.user.findOrCreate({
      where: {
        email: userInfo.email
      },
      defaults: {
        username: userInfo.given_name + generateRandomChars(4),
        name: userInfo.given_name,
        email: userInfo.email,
        picture: userInfo.picture,
        verified: true
      }
    });

    if (isCreated && user.id) {
      await model.userOauth.create({
        userId: user.id,
        oauthProvider: 'Google',
        oauthEmail: user.email
      });
    }

    const [accessToken, newRefreshToken] = await jwtService.generateJwt(
      user.username,
      user.roleId,
      user.id
    );

    await model.refreshToken.create({
      token: newRefreshToken,
      userId: `${user.id}`,
      loginWith: 'Google',
      clientId
    });

    res.status(200).json({
      status: 'Success',
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
