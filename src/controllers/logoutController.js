import Model from '../models/index.js';

const logoutController = async (req, res) => {
  const cookies = req.cookies;
  if (!cookies.jwt) return res.sendStatus(204);

  const refreshToken = cookies.jwt;

  const foundToken = await Model.RefreshToken.findOne({
    where: { token: refreshToken },
    include: [Model.User]
  });
  if (!foundToken) {
    res.clearCookie('jwt', {
      httpOnly: true,
      sameSite: 'None',
      secure: true
    });

    return res.sendStatus(204);
  }

  try {
    await foundToken.destroy({
      where: { token: refreshToken }
    });

    res.clearCookie('jwt', {
      httpOnly: true,
      sameSite: 'None',
      secure: true
    });

    res.sendStatus(204);
  } catch (error) {
    console.error('Logout error: ', error);
  }
};

export default logoutController;
