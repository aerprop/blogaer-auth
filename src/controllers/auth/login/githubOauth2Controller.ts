import { Request, Response } from 'express';
import axios from 'axios';
import MainModel from '../../../models/MainModel';
import { generateClientId, generateRandomChars } from '../../../utils/helper';
import jwtService from '../../../services/auth/jwtService';
import { OauthProvider } from '../../../utils/enums';

export default async function githubOauth2Controller(
  req: Request,
  res: Response
) {
  const code = req.oauthCode;
  if (!code) {
    return res.status(400).json({
      status: 'Error',
      error: `Register failed: missing github oauth2 code!: ${code}`
    });
  }
  try {
    const tokenRes = await axios.post(
      'https://github.com/login/oauth/access_token',
      {
        code,
        client_id: `${process.env.GITHUB_OAUTH2_ID}`,
        client_secret: `${process.env.GITHUB_OAUTH2_SECRET}`,
        redirect_uri: 'http://localhost:3000/api/auth/callback/github'
      },
      { headers: { Accept: 'application/json' } }
    );

    if (!tokenRes.data) throw new Error(tokenRes.statusText);

    const oauthToken = tokenRes.data.access_token;
    const userInfoRes = await axios.get('https://api.github.com/user', {
      headers: {
        Authorization: `Bearer ${oauthToken}`
      }
    });
    const userEmailsRes = await axios.get(
      'https://api.github.com/user/emails',
      {
        headers: {
          Authorization: `Bearer ${oauthToken}`
        }
      }
    );

    if (!userInfoRes.data || !userEmailsRes.data)
      throw new Error(tokenRes.statusText);

    const userInfo = userInfoRes.data;
    const userEmail = userEmailsRes.data.find(
      (email: any) => email.primary
    )?.email;
    console.log('github oauth user info >>>', userInfo);
    console.log('github oauth user email >>>', userEmail);

    const model = await MainModel;
    if (!model) {
      console.log('Database connection failed!');
      return res.status(500).json({
        status: 'Internal server error',
        error: 'Database connection failed!'
      });
    }
    const name = (userInfo.name as string).split(' ')[0];
    const [user] = await model.user.findOrCreate({
      where: {
        email: userEmail
      },
      defaults: {
        username: name + generateRandomChars(4),
        name,
        email: userEmail,
        picture: userInfo.avatar_url,
        verified: userEmail ? true : false
      }
    });

    if (user.id) {
      await model.userOauth.findOrCreate({
        where: {
          userId: user.id,
          oauthProvider: OauthProvider.Github,
          oauthEmail: user.email
        }
      });
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
      userId: `${user.id}`,
      loginWith: OauthProvider.Github,
      clientId
    });

    return res.status(200).json({
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
