import { Request, Response } from 'express';
import initMainModel from '../../models/initMainModel';
import { AnyObj } from '../../types/common';

const socialsController = {
  async patchSocials(req: Request, res: Response) {
    const { userId } = req;
    const { social, link } = req.body;

    const model = await initMainModel;
    if (!model) {
      console.log('Database connection failed!');
      return res.status(500).json({
        status: 'Internal server error',
        error: 'Database connection failed!'
      });
    }
    const [userSocial, isCreated] = await model.userSocial.findOrCreate({
      where: {
        userId,
        social,
        link
      },
      defaults: {
        userId,
        social,
        link
      },
      attributes: ['id']
    });

    if (!isCreated) {
      await model.userSocial.update(
        { social, link },
        { where: { userId: userSocial.id } }
      );
    }

    return res.status(isCreated ? 201 : 200).json({
      status: isCreated ? 'Created' : 'Updated',
      message: isCreated
        ? `Your ${social} link has been added`
        : `Your ${social} link has been updated`
    });
  },
  async getSocials(req: Request, res: Response) {
    const { userId } = req;
    const model = await initMainModel;
    if (!model) {
      console.log('Database connection failed!');
      return res.status(500).json({
        status: 'Internal server error',
        error: 'Database connection failed!'
      });
    }
    const socials = (await model.userSocial.findAll({
      where: { userId },
      attributes: ['social', 'link']
    })) as { social: string; link: string }[];
    const data = socials.reduce(
      (acc, current) => ((acc[current.social] = current.link), acc),
      {} as AnyObj
    );

    return res.status(200).json({ status: 'Success', data });
  }
};

export default socialsController;
