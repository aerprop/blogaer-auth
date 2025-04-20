import { Request, Response } from 'express';
import MainModel from '../../models/MainModel';
import { col, fn, Op, where } from 'sequelize';
import userRequestService from '../../services/user/userRequestService';
import { UserSocial } from '../../types/common';
import { CommonStatus } from '../../utils/enums';

const accountController = {
  async patchAccount(req: Request, res: Response) {
    const { username, email, name, description, picture } = req.body;
    const model = await MainModel;
    if (!model) {
      console.log('Database connection failed!');
      return res.status(500).json({
        status: 'Internal server error',
        error: 'Database connection failed!'
      });
    }
    if (email) {
      const userRequest = req.userRequest;
      if (userRequest) {
        const emailExist = await model.user.findOne({
          where: {
            id: { [Op.ne]: req.userId },
            email
          }
        });
        if (emailExist) {
          return res.status(403).json({
            status: 'Already exists',
            error: 'Email already exists!'
          });
        } else {
          await userRequest.update({ status: CommonStatus.Success });
        }
      }
    }
    if (username) {
      const userRequest = req.userRequest;
      if (userRequest) {
        const payload = (username as string).trim();
        const usernameExist = await model.user.findOne({
          where: {
            [Op.and]: [
              { id: { [Op.ne]: req.userId } },
              where(fn('lower', col('username')), payload.toLowerCase())
            ]
          }
        });
        if (usernameExist) {
          return res.status(403).json({
            status: 'Already exists',
            error: 'Username already exists!'
          });
        } else {
          await userRequest.update({ status: CommonStatus.Success });
        }
      }
    }

    const [updatedData] = await model.user.update(
      { username, email, name, description, picture },
      { where: { id: req.userId } }
    );

    if (updatedData === 1) {
      return res.status(200).json({
        status: 'Success',
        message: 'User data successfully updated.'
      });
    } else {
      return res.sendStatus(204);
    }
  },
  async getAccount(req: Request, res: Response) {
    const { userId } = req;
    const model = await MainModel;
    if (!model) {
      console.log('securityController.ts >>> Database connection failed!');
      return res.status(500).json({
        status: 'Internal server error',
        error: 'Database connection failed!'
      });
    }
    const refreshToken = req.cookies[`${process.env.REFRESH_TOKEN}`];
    const token = await model.refreshToken.findByPk(refreshToken, {
      attributes: ['clientId']
    });
    const foundRequests = await userRequestService.getEmailAndUsernameRequests(
      model,
      userId,
      token?.clientId
    );
    const userRequests = {
      emailRequest: foundRequests.emailRequest?.status === CommonStatus.Pending,
      usernameRequest:
        foundRequests.usernameRequest?.status === CommonStatus.Pending
    };

    const socials = (await model.userSocial.findAll({
      where: { userId },
      attributes: ['social', 'link']
    })) as { social: string; link: string }[];
    const userSocials = socials.reduce((acc, current) => {
      acc[current.social as keyof UserSocial] = current.link;
      return acc;
    }, {} as UserSocial);

    return res.status(200).json({
      status: 'Success',
      data: { userRequests, socials: userSocials }
    });
  }
};

export default accountController;
