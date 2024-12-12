import { Request, Response } from 'express';
import MainModel from '../models/MainModel';
import SavedAccount from '../models/SavedAccount';

type SavedAccountJoin = SavedAccount & {
  clientId: string;
  Users: { id: string; username: string; email: string; img: string }[];
};

export default async function savedAccountsController(
  req: Request,
  res: Response
) {
  const clientId = req.params.clientId;
  const model = await MainModel;
  const savedAccounts = (await model.savedAccount.findByPk(clientId, {
    include: {
      model: model.user,
      attributes: ['id', 'username', 'email', ['picture', 'img']]
    },
    attributes: ['clientId']
  })) as SavedAccountJoin;

  return res.status(200).json({ status: 'Success', data: savedAccounts.Users });
}
