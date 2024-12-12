import MainModel from '../models/MainModel';
import models from '../models/MainModel';

export async function getAllUserImgsAndUsernames() {
  const model = await models;
  return await model.user.findAll({
    attributes: ['id', 'username', 'picture']
  });
}

export async function getUserById(userId: string) {
  const model = await models;
  return model.user.findByPk(userId, {
    attributes: ['username', 'picture']
  });
}

export function generateRandomChars(length: number) {
  let result = '';
  const characters =
    'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  const charactersLength = characters.length;
  for (let i = 0; i < length; i++) {
    result += characters.charAt(Math.floor(Math.random() * charactersLength));
  }

  return result;
}

export async function getMainModel() {
  return await MainModel;
}
