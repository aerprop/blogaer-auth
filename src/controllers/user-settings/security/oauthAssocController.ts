import { Request, Response } from 'express';
import userService from '../../../services/user/userService';

const oauthAssocController = {
  async getAssociations(req: Request, res: Response) {
    const { userId } = req;
    const data = userService.getOauthAssociations(userId);

    return res.status(200).json({ status: 'Success', data });
  }
};

export default oauthAssocController;
