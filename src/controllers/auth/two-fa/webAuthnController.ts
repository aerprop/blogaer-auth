import { Request, Response } from 'express';
import initMainModel from '../../../models/initMainModel';
import {
  AuthenticationResponseJSON,
  PublicKeyCredentialCreationOptionsJSON,
  PublicKeyCredentialRequestOptionsJSON,
  RegistrationResponseJSON
} from '@simplewebauthn/server/script/deps';
import {
  generateAuthenticationOptions,
  generateRegistrationOptions,
  VerifiedRegistrationResponse,
  verifyAuthenticationResponse,
  verifyRegistrationResponse
} from '@simplewebauthn/server';
import UserPasskey from '../../../models/UserPasskey';
import User from '../../../models/User';
import { col, fn, Op, where } from 'sequelize';
import { generateClientId } from '../../../utils/helper';

const rpName = 'Blogaer-auth';
const rpID = 'localhost';
const origin = `http://${rpID}:3000`;
const webAuthnController = {
  async generateRegisterOptions(req: Request, res: Response) {
    const inMemModel = req.inMemModel;
    if (!inMemModel) {
      console.log('Failed to initialize in-memory database!');
      return res.status(500).json({
        status: 'Internal server error',
        error: 'In-memory database connection failed!'
      });
    }
    try {
      const { userId, username } = req;
      const model = await initMainModel;
      if (!model) {
        console.log('Database connection failed!');
        return res.status(500).json({
          status: 'Internal server error',
          error: 'Database connection failed!'
        });
      }
      const user = await model.user.findByPk(userId, {
        attributes: ['name']
      });

      const userPasskeys = await model.userPasskey.findAll({
        where: { userId }
      });

      const options: PublicKeyCredentialCreationOptionsJSON =
        await generateRegistrationOptions({
          rpName,
          rpID,
          userName: username,
          userDisplayName: user?.name,
          attestationType: 'none',
          excludeCredentials: userPasskeys.map((passkey) => ({
            id: passkey.id,
            transports: passkey.transports
          })),
          authenticatorSelection: {
            residentKey: 'required',
            userVerification: 'preferred'
          }
        });

      await inMemModel.webAuthnRegisterOption.create({
        userId,
        options
      });

      return res.status(200).json({
        status: 'Success',
        data: { options }
      });
    } catch (error) {
      await inMemModel.webAuthnRegisterOption.truncate({
        cascade: true,
        restartIdentity: true
      });
      console.error('generateRegisterOptions error >>>', error);

      return res.status(500).json({
        status: 'Internal server error',
        error: `${error instanceof Error ? error.message : error}`
      });
    }
  },
  async verifyRegisterOptions(req: Request, res: Response) {
    const inMemModel = req.inMemModel;
    if (!inMemModel) {
      console.log('Failed to initialize in-memory database!');
      return res.status(500).json({
        status: 'Internal server error',
        error: 'In-memory database failed!'
      });
    }
    try {
      const { userId } = req;
      const { options }: { options: RegistrationResponseJSON } = req.body;

      const inMemOption = await inMemModel.webAuthnRegisterOption.findOne({
        where: { userId }
      });

      const memoryOptions = inMemOption?.options;
      if (!memoryOptions?.challenge) {
        await inMemModel.webAuthnRegisterOption.truncate({
          cascade: true,
          restartIdentity: true
        });
        return res.status(404).json({
          status: 'Not found',
          error: 'Webauthn registration option not found!'
        });
      }

      const { userAgent } = generateClientId(req.headers['user-agent']);
      if (!userAgent) {
        return res
          .status(400)
          .json({ status: 'Bad request', error: 'User agent is invalid!' });
      }
      const isMobile = userAgent.platform === 'mobile';
      let verification: VerifiedRegistrationResponse;
      verification = await verifyRegistrationResponse({
        response: options,
        requireUserVerification: isMobile,
        expectedChallenge: memoryOptions.challenge,
        expectedOrigin: origin,
        expectedRPID: rpID
      });

      const { verified, registrationInfo } = verification;
      if (verified && registrationInfo) {
        const { credential, credentialDeviceType, credentialBackedUp } =
          registrationInfo;

        const model = await initMainModel;
        if (!model) {
          console.log('Database connection failed!');
          return res.status(500).json({
            status: 'Internal server error',
            error: 'Database connection failed!'
          });
        }
        const userPasskeys = await model.userPasskey.findAll({
          where: {
            userId
          }
        });

        const existingPasskey = userPasskeys.find(
          (key) => key.id === credential.id
        );

        const refreshToken = req.cookies[`${process.env.REFRESH_TOKEN}`];
        const token = await model.refreshToken.findByPk(refreshToken, {
          attributes: ['clientId']
        });
        const clientId = token?.clientId;

        if (!existingPasskey && clientId) {
          const clientBrowser = userAgent.browser;
          const clientOs = userAgent.os;
          if (!clientBrowser || !clientOs) {
            return res.status(400).json({
              status: 'Bad request',
              error: 'No user-agent header provided'
            });
          }

          await model.userPasskey.create({
            id: credential.id,
            userId,
            clientId,
            clientBrowser,
            clientOs,
            isMobile,
            publicKey: Buffer.from(credential.publicKey),
            counter: credential.counter,
            deviceType: credentialDeviceType,
            backedUp: credentialBackedUp,
            transports: credential.transports
          });
        }
      }
      await inMemModel.webAuthnRegisterOption.truncate({
        cascade: true,
        restartIdentity: true
      });

      return res.status(200).json({ status: 'Success', message: { verified } });
    } catch (error) {
      await inMemModel.webAuthnRegisterOption.truncate({
        cascade: true,
        restartIdentity: true
      });
      console.error('verifyRegisterOptions error >>>', error);

      return res.status(500).json({
        status: 'Internal server error',
        error: `${error instanceof Error ? error.message : error}`
      });
    }
  },
  async generateLoginOptions(req: Request, res: Response) {
    const inMemModel = req.inMemModel;
    if (!inMemModel) {
      console.log('Failed to initialize in-memory database!');
      return res.status(500).json({
        status: 'Internal server error',
        error: 'In-memory database failed!'
      });
    }
    const { clientId } = generateClientId(req.headers['user-agent']);
    if (!clientId) {
      return res
        .status(400)
        .json({ status: 'Bad request', error: 'User agent is invalid!' });
    }
    try {
      const { emailOrUsername } = req.body;
      const model = await initMainModel;
      if (!model) {
        console.log('Database connection failed!');
        return res.status(500).json({
          status: 'Internal server error',
          error: 'Database connection failed!'
        });
      }

      const payload = (emailOrUsername as string).trim();
      const user = (await model.user.findOne({
        where: {
          [Op.or]: [
            { email: payload },
            where(fn('lower', col('username')), payload.toLowerCase())
          ]
        },
        attributes: ['id'],
        include: {
          model: model.userPasskey,
          attributes: ['id', 'transports', 'clientId', 'userId'],
          where: { clientId }
        }
      })) as User & { UserPasskeys: UserPasskey[] };

      const userPasskey = user.UserPasskeys.find(
        (passkey) => passkey.clientId === clientId && passkey.userId === user.id
      );
      if (!userPasskey) {
        return res
          .status(404)
          .json({ status: 'Not found', message: "User passkey doesn't exist" });
      }

      const allowCredentials = user.UserPasskeys.map((passkey) => {
        return {
          id: passkey.id,
          transports: passkey.transports
        };
      });
      const options: PublicKeyCredentialRequestOptionsJSON =
        await generateAuthenticationOptions({
          rpID,
          allowCredentials,
          userVerification: 'preferred'
        });

      const optionId = options.allowCredentials?.at(0)?.id;
      if (!optionId) {
        inMemModel.webAuthnLoginOption.truncate({
          cascade: true,
          restartIdentity: true
        });
        return res
          .status(404)
          .json({ status: 'Not found', error: 'No passkeys was found!' });
      }

      await inMemModel.webAuthnLoginOption.create({
        passkeyId: optionId,
        options
      });

      return res.status(200).json({
        status: 'Success',
        data: { options }
      });
    } catch (error) {
      inMemModel.webAuthnLoginOption.truncate({
        cascade: true,
        restartIdentity: true
      });
      console.error('generateLoginOptions error >>>', error);

      return res.status(500).json({
        status: 'Internal server error',
        error: `${error instanceof Error ? error.message : error}`
      });
    }
  },
  async verifyLoginOptions(req: Request, res: Response) {
    const inMemModel = req.inMemModel;
    if (!inMemModel) {
      console.log('Failed to initialize in-memory database!');
      return res.status(500).json({
        status: 'Internal server error',
        error: 'In-memory database failed!'
      });
    }
    try {
      const { option }: { option: AuthenticationResponseJSON } = req.body;
      if (!option) {
        return res.status(400).json({
          status: 'Bad request',
          error: 'Webauthn options not provided!'
        });
      }

      const inMemOption = await inMemModel.webAuthnLoginOption.findOne({
        where: { passkeyId: option.id }
      });
      const currentOptions = inMemOption?.options;
      if (!currentOptions?.challenge) {
        inMemModel.webAuthnLoginOption.truncate({
          cascade: true,
          restartIdentity: true
        });
        return res.status(404).json({
          status: 'Not found',
          error: 'Webauthn temporary option not found!'
        });
      }

      const model = await initMainModel;
      if (!model) {
        console.log('Database connection failed!');
        return res.status(500).json({
          status: 'Internal server error',
          error: 'Database connection failed!'
        });
      }
      const userPasskey = await model.userPasskey.findByPk(option.id);

      if (!userPasskey) {
        inMemModel.webAuthnLoginOption.truncate({
          cascade: true,
          restartIdentity: true
        });
        return res.status(404).json({
          status: 'Not found',
          error: 'User passkey not found!'
        });
      }

      const { userAgent } = generateClientId(req.headers['user-agent'] || '');
      if (!userAgent) {
        return res
          .status(400)
          .json({ status: 'Bad request', error: 'User agent is invalid!' });
      }
      const isMobile = userAgent.platform === 'mobile';
      let verification;
      verification = await verifyAuthenticationResponse({
        response: option,
        requireUserVerification: isMobile,
        expectedChallenge: currentOptions.challenge,
        expectedOrigin: origin,
        expectedRPID: rpID,
        credential: {
          id: userPasskey.id,
          publicKey: userPasskey.publicKey,
          counter: userPasskey.counter,
          transports: userPasskey.transports
        }
      });

      const { verified } = verification;
      if (verified) {
        await inMemModel.webAuthnLoginOption.update(
          { verifiedAuthInfo: verification },
          { where: { passkeyId: option.id } }
        );

        return res.status(200).json({
          status: 'Success',
          data: { verified }
        });
      } else {
        inMemModel.webAuthnLoginOption.truncate({
          cascade: true,
          restartIdentity: true
        });
        return res.status(400).json({
          status: 'Bad request',
          message: 'Token or biometric key invalid!'
        });
      }
    } catch (error) {
      inMemModel.webAuthnLoginOption.truncate({
        cascade: true,
        restartIdentity: true
      });
      console.error('verifyLoginOptions error >>>', error);

      return res.status(500).json({
        status: 'Internal server error',
        error: `${error instanceof Error ? error.message : error}`
      });
    }
  }
};

export default webAuthnController;
