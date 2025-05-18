import { Request, Response } from 'express';
import emailService from '../../services/email/emailService';
import { EmailSubject } from '../../utils/enums';
import { generateClientId, generateOtp } from '../../utils/helper';
import initMainModel from '../../models/initMainModel';

const emailController = {
  async sendAddPasswordLink(req: Request, res: Response) {
    try {
      const refreshToken = req.cookies[`${process.env.REFRESH_TOKEN}`];

      const { email, limit, html } = await emailService.handleEmailSubject(
        EmailSubject.AddPassword,
        req.userId,
        refreshToken,
        req.headers.origin
      );
      const info = await emailService.sendEmail(
        email,
        'Add password request',
        html
      );

      return res.status(200).json({ status: 'Success', data: { info, limit } });
    } catch (error) {
      if (error instanceof CustomError)
        return res.status(error.status).json(error.info);
    }
  },
  async sendResetPasswordLink(req: Request, res: Response) {
    try {
      const refreshToken = req.cookies[`${process.env.REFRESH_TOKEN}`];

      const { email, limit, html } = await emailService.handleEmailSubject(
        EmailSubject.ResetPassword,
        req.userId,
        refreshToken,
        req.headers.origin
      );
      const info = await emailService.sendEmail(
        email,
        'Reset password request',
        html
      );

      return res.status(200).json({ status: 'Success', data: { info, limit } });
    } catch (error) {
      if (error instanceof CustomError)
        return res.status(error.status).json(error.message);
    }
  },
  async sendUpdateEmailLink(req: Request, res: Response) {
    try {
      const refreshToken = req.cookies[`${process.env.REFRESH_TOKEN}`];

      const { email, limit, html } = await emailService.handleEmailSubject(
        EmailSubject.UpdateEmail,
        req.userId,
        refreshToken,
        req.headers.origin
      );
      const info = await emailService.sendEmail(
        email,
        'Change email request',
        html
      );

      return res.status(200).json({ status: 'Success', data: { info, limit } });
    } catch (error) {
      if (error instanceof CustomError)
        return res.status(error.status).json(error.message);
    }
  },
  async sendUpdateEmailOtp(req: Request, res: Response) {
    const { email, request, limit } = req.body;
    const model = await initMainModel;
    if (!model) {
      console.log('emailController.ts', 'Database connection failed!');
      throw new CustomError(500, {
        status: 'Internal server error',
        error: 'Database connection failed!'
      });
    }

    const user = await model.user.findByPk(req.userId, {
      attributes: ['id']
    });
    if (!user?.id) {
      console.log('emailController.ts', 'No user found!');
      throw new CustomError(404, {
        status: 'Not found',
        error: 'User not found!'
      });
    }

    const otp = generateOtp();
    const html = emailService.createOtpHtml(otp);
    const date = new Date(Number(limit));
    const foundRequest = await model.userRequest.findOne({
      where: { userId: user.id, request, limit: date }
    });
    const updated = await foundRequest?.update({ otp });
    if (updated?.updatedAt) {
      const info = await emailService.sendEmail(
        email,
        'Change email request verification otp',
        html
      );

      return res.status(200).json({ status: 'Success', data: { info } });
    } else {
      return res
        .status(404)
        .json({ status: 'Not found', error: 'User request do not exist!' });
    }
  },
  async getUpdateEmailOtpTime(req: Request, res: Response) {
    const { request, limit } = req.query;

    const model = await initMainModel;
    if (!model) {
      console.log('emailController.ts', 'Database connection failed!');
      throw new CustomError(500, {
        status: 'Internal server error',
        error: 'Database connection failed!'
      });
    }

    const { clientId } = generateClientId(req.headers['user-agent']);
    if (!clientId) {
      return res
        .status(400)
        .json({ status: 'Bad request', error: 'User agent is invalid!' });
    }
    const foundRequest = await model.userRequest.findOne({
      where: {
        userId: req.userId,
        clientId,
        request: `${request}`,
        limit: new Date(Number(limit))
      }
    });

    if (foundRequest?.updatedAt && foundRequest?.otp) {
      const time = new Date(
        foundRequest.updatedAt.getTime() + 5 * 60 * 1000
      ).getTime();

      return res.status(200).json({ status: 'Success', data: { time } });
    } else {
      return res
        .status(404)
        .json({ status: 'Not found', error: 'Request not found!' });
    }
  },
  async sendUpdateUsernameLink(req: Request, res: Response) {
    try {
      const refreshToken = req.cookies[`${process.env.REFRESH_TOKEN}`];

      const { email, limit, html } = await emailService.handleEmailSubject(
        EmailSubject.UpdateUsername,
        req.userId,
        refreshToken,
        req.headers.origin
      );
      const info = await emailService.sendEmail(
        email,
        'Change username request',
        html
      );

      return res.status(200).json({ status: 'Success', data: { info, limit } });
    } catch (error) {
      if (error instanceof CustomError)
        return res.status(error.status).json(error.message);
    }
  }
};

export default emailController;
