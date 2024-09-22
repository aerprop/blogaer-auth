import models from '../models';

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
