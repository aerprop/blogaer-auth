import MainModel from '../../models/MainModel';
import { AnyObj } from '../../types/common';

const userService = {
  async getOauthAssociations(userId: string) {
    const model = await MainModel;
    const associations = (await model.userOauth.findAll({
      where: { userId },
      attributes: ['oauthProvider', 'oauthEmail']
    })) as { oauthProvider: string; oauthEmail: string }[];
    const data = associations.reduce(
      (acc, current) => (
        (acc[current.oauthProvider.toLowerCase()] = current.oauthEmail), acc
      ),
      {} as AnyObj
    );

    return data;
  }
};

export default userService;
