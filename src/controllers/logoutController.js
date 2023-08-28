import Model from '../models/index.js';

const logoutController = async (req, res) => {
  const cookies = req.cookies;
  if (!cookies.jwt) return res.sendStatus(204);

  const refreshToken = cookies.jwt;

  const foundToken = await Model.RefreshToken.findOne({
    where: { token: refreshToken },
    include: [
      {
        model: Model.User,
        attributes: ['username']
      }
    ]
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

    return res.status(200).json({
      status: 'OK',
      message: `${foundToken.User.username} has successfully logged out.`
    });
  } catch (error) {
    console.error('Logout', error);

    return res.status(500).json({
      status: 'Internal server error',
      message: `Logout error: ${error}.`,
      data: {
        user: foundToken.User.username
      }
    });
  }
};

export default logoutController;
