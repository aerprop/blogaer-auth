import { Request, Response } from 'express';
import models from '../../../models/MainModel';
import inMemoryModel from '../../../models/in-memory/InMemoryModel';
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
import { TwoFAMethod } from '../../../utils/enums';
import Bowser from 'bowser';
import UserPasskey from '../../../models/UserPasskey';
import User from '../../../models/User';
import jwtService from '../../../services/user/jwtService';

const rpName = 'Blogaer-auth';
const rpID = 'localhost';
const origin = `http://${rpID}:3000`;
const inMemModel = inMemoryModel();
const webAuthnController = {
  async generateRegisterOptions(req: Request, res: Response) {
    const { userId, username } = req;
    const model = await models;
    const user = await model.user.findByPk(userId, {
      attributes: ['name']
    });

    const userPasskeys =
      (await model.userPasskey.findAll({
        where: {
          userId
        }
      })) || [];

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
          residentKey: 'preferred',
          userVerification: 'required',
          authenticatorAttachment: 'platform'
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
  },
  async verifyRegisterOptions(req: Request, res: Response) {
    const { options }: { options: RegistrationResponseJSON } = req.body;
    const { userId } = req;

    const inMemOption = await inMemModel.webAuthnRegisterOption.findOne({
      where: { userId }
    });

    const currentOptions = inMemOption?.options;
    if (!currentOptions?.challenge) {
      inMemModel.sequelize.close();

      return res.status(404).json({
        status: 'Not found',
        error: 'Webauthn registration option not found!'
      });
    }

    let verification: VerifiedRegistrationResponse;
    try {
      verification = await verifyRegistrationResponse({
        response: options,
        expectedChallenge: currentOptions.challenge,
        expectedOrigin: origin,
        expectedRPID: rpID
      });
    } catch (error) {
      console.error(error);
      inMemModel.sequelize.close();

      return res.status(500).json({
        status: 'Bad request',
        error: error instanceof Error ? error.message : 'Internal server error'
      });
    }

    const { verified, registrationInfo } = verification;

    if (verified && registrationInfo) {
      const { credential, credentialDeviceType, credentialBackedUp } =
        registrationInfo;

      const model = await models;
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
        const client = Bowser.parse(req.headers['user-agent'] || '');
        const clientBrowser = client.browser.name;
        const clientOs = client.os.name;
        const isMobile = client.platform.type !== 'desktop';
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
          publicKey: credential.publicKey,
          counter: credential.counter,
          deviceType: credentialDeviceType,
          backedUp: credentialBackedUp,
          transports: credential.transports
        });
      }
    }
    inMemModel.sequelize.close();

    return res.status(200).json({ status: 'Success', message: { verified } });
  },
  async generateLoginOptions(req: Request, res: Response) {
    const { userId } = req;
    const model = await models;
    const userPasskeys = await model.userPasskey.findAll({
      where: {
        userId
      }
    });

    const options: PublicKeyCredentialRequestOptionsJSON =
      await generateAuthenticationOptions({
        rpID,
        allowCredentials: userPasskeys.map((passkey) => ({
          id: passkey.id,
          transports: passkey.transports
        }))
      });

    await inMemModel.webAuthnLoginOption.create({
      userId,
      options
    });

    return res.status(200).json({
      status: 'Success',
      data: { options }
    });
  },
  async verifyLoginOptions(req: Request, res: Response) {
    const {
      options,
      clientId
    }: { options: AuthenticationResponseJSON; clientId: string } = req.body;
    const { userId } = req;

    const inMemOption = await inMemModel.webAuthnLoginOption.findOne({
      where: { userId }
    });
    const currentOptions = inMemOption?.options;
    if (!currentOptions?.challenge) {
      inMemModel.sequelize.close();

      return res.status(404).json({
        status: 'Not found',
        error: 'Webauthn temporary option not found!'
      });
    }
    const model = await models;
    const userPasskey = (await model.userPasskey.findByPk(options.id, {
      include: {
        model: model.user,
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
      }
    })) as UserPasskey & { User: User };

    if (!userPasskey || !userPasskey.User.id) {
      inMemModel.sequelize.close();

      return res.status(404).json({
        status: 'Not found',
        error: !userPasskey
          ? 'User passkey not found!'
          : !userPasskey.User && 'User not found!'
      });
    }

    let verification;
    try {
      verification = await verifyAuthenticationResponse({
        response: options,
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
    } catch (error) {
      inMemModel.sequelize.close();

      return res.status(500).json({
        status: 'Internal server error',
        error: error instanceof Error ? error.message : 'Internal server error!'
      });
    }
    const { verified } = verification;
    if (verified) {
      const [accessToken, newRefreshToken] =
        await jwtService.generateJwtService(
          userPasskey.User.username,
          userPasskey.User.roleId,
          userPasskey.User.id
        );
      await model.refreshToken.create({
        token: newRefreshToken,
        userId: userPasskey.User.id,
        clientId
      });
      inMemModel.sequelize.close();

      return res.status(200).json({
        status: 'Success',
        data: {
          username: userPasskey.User.username,
          name: userPasskey.User.name,
          email: userPasskey.User.email,
          desc: userPasskey.User.description,
          role: userPasskey.User.roleId === 1 ? 'Admin' : 'Author',
          img: userPasskey.User.picture,
          access: accessToken,
          refresh: newRefreshToken
        }
      });
    } else {
      inMemModel.sequelize.close();

      return res.status(400).json({
        status: 'Bad request',
        message: 'Token or biometric key invalid!'
      });
    }
  }
};

export default webAuthnController;
