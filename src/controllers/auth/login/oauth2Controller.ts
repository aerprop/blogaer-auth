import { Request, Response } from 'express';
import initMainModel from '../../../models/initMainModel';
import {
  closeChannel,
  generateClientId,
  generateRandomChars
} from '../../../utils/helper';
import { ExchangeName, OauthProvider } from '../../../utils/enums';
import jwtService from '../../../services/auth/jwtService';
import { nanoid } from 'nanoid';

const oauth2Controller = {
  async google(req: Request, res: Response) {
    const { publisherChan, consumerChan } = req;
    const code = req.oauthCode;
    if (!code) {
      return res.status(400).json({
        status: 'Error',
        error: 'Missing github oauth2 code!'
      });
    }
    try {
      const { queue } = await consumerChan.assertQueue('', {
        exclusive: true,
        durable: false
      });
      const correlationId = nanoid(9);
      const message = Buffer.from(JSON.stringify({ code }));
      publisherChan.publish(ExchangeName.Rpc, 'oauth.google.key', message, {
        persistent: false,
        replyTo: queue,
        correlationId
      });
      const timeout = setTimeout(() => res.sendStatus(408), 5000);

      await consumerChan.consume(queue, async (msg) => {
        if (msg) {
          if (msg.properties.correlationId !== correlationId) return;

          const model = await initMainModel;
          if (!model) {
            console.log('Database connection failed!');
            return res.status(500).json({
              status: 'Internal server error',
              error: 'Database connection failed!'
            });
          }

          const userInfo = JSON.parse(msg.content.toString());
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
              oauthProvider: OauthProvider.Google,
              oauthEmail: user.email
            });
          }

          const [accessToken, newRefreshToken] = await jwtService.generateJwt(
            user.username,
            user.roleId,
            user.id
          );

          const { clientId } = generateClientId(req.headers['user-agent']);
          if (clientId) {
            await model.refreshToken.create({
              token: newRefreshToken,
              userId: `${user.id}`,
              loginWith: OauthProvider.Google,
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
            consumerChan.ack(msg);
            await closeChannel(timeout, consumerChan);
          } else {
            res
              .status(400)
              .json({ status: 'Bad request', error: 'User agent is invalid!' });
            consumerChan.nack(msg);
            await closeChannel(timeout, consumerChan);
          }
        } else {
          res.status(500).json({
            status: 'Internal Server Error',
            error: 'Google login failed! No user info content.'
          });
          await closeChannel(timeout, consumerChan);
        }
      });
    } catch (error) {
      console.error(
        'Google login failed >>',
        `${error instanceof Error ? error.message : error}`
      );

      res.status(500).json({
        status: 'Internal Server Error',
        error:
          error instanceof Error ? error.message : 'Unexpected error occurred!'
      });
      await consumerChan.close();
    }
  },
  async github(req: Request, res: Response) {
    const { publisherChan, consumerChan } = req;
    const code = req.oauthCode;
    if (!code) {
      return res.status(400).json({
        status: 'Error',
        error: 'Missing github oauth2 code!'
      });
    }
    try {
      const { queue } = await consumerChan.assertQueue('', {
        exclusive: true,
        durable: false
      });
      const correlationId = nanoid(9);
      const message = Buffer.from(JSON.stringify({ code }));
      publisherChan.publish(ExchangeName.Rpc, 'oauth.github.key', message, {
        persistent: false,
        replyTo: queue,
        correlationId
      });
      const timeout = setTimeout(() => res.sendStatus(408), 5000);

      await consumerChan.consume(queue, async (msg) => {
        if (msg) {
          if (msg.properties.correlationId !== correlationId) return;

          const userData = JSON.parse(msg.content.toString());
          console.log('Important!!! userData >>', userData);

          const userInfo = userData.userInfo;
          const userEmail = userData.userEmail.email;

          const model = await initMainModel;
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
          if (clientId) {
            await model.refreshToken.create({
              token: newRefreshToken,
              userId: `${user.id}`,
              loginWith: OauthProvider.Github,
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
            consumerChan.ack(msg);
            await closeChannel(timeout, consumerChan);
          } else {
            res
              .status(400)
              .json({ status: 'Bad request', error: 'User agent is invalid!' });
            consumerChan.nack(msg);
            await closeChannel(timeout, consumerChan);
          }
        } else {
          res.status(500).json({
            status: 'Internal Server Error',
            error: 'Github login failed! No user info content.'
          });
          await closeChannel(timeout, consumerChan);
        }
      });
    } catch (error) {
      console.error(
        'Github login failed >>',
        `${error instanceof Error ? error.message : error}`
      );

      res.status(500).json({
        status: 'Internal server error',
        error: `${error instanceof Error ? error.message : error}`
      });
      await consumerChan.close();
    }
  }
};

export default oauth2Controller;
