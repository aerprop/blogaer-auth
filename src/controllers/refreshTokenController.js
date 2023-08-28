import Model from '../models/index.js';
import jwt from 'jsonwebtoken';

const refreshTokenController = async (req, res) => {
  const cookies = req.cookies;
  if (!cookies?.jwt) {
    return res.status(401).json({
      status: 'Unauthorized',
      message: 'No jwt cookie provided.'
    });
  }

  const refreshToken = cookies.jwt;
  res.clearCookie('jwt', { httpOnly: true, sameSite: 'None', secure: true });

  const foundToken = await Model.RefreshToken.findOne({
    where: { token: refreshToken },
    include: [
      {
        model: Model.User,
        attributes: ['username', 'role_id']
      }
    ]
  });

  // Detected refresh token reuse!
  if (!foundToken) {
    console.log('Attempted refresh token reuse at refresh token route');
    jwt.verify(
      refreshToken,
      process.env.REFRESH_TOKEN_SECRET,
      async (err, decoded) => {
        // No user found
        if (err) return res.sendStatus(403);
        // User found - attempted refresh token reuse!
        const hackedUser = await Model.User.findOne({
          where: {
            username: decoded.UserInfo.username
          }
        });
        try {
          const deletedTokens = await Model.RefreshToken.destroy({
            where: {
              user_id: hackedUser.id
            }
          });
          console.log(
            `Deleted ${hackedUser.username}'s tokens:`,
            deletedTokens
          );
        } catch (error) {
          console.log(`Deleted tokens error: ${error}`);
        }
      }
    );
    return res.sendStatus(403);
  }

  jwt.verify(
    refreshToken,
    process.env.REFRESH_TOKEN_SECRET,
    async (err, decoded) => {
      if (err) {
        console.log(`${decoded.UserInfo.username}'s token expires!`);
        try {
          const deletedTokens = await Model.RefreshToken.destroy({
            where: {
              token: refreshToken
            }
          });

          console.log(
            `Deleted ${decoded.UserInfo.username}'s token:`,
            deletedTokens
          );

          return res.status(403).json({
            status: 'Forbidden',
            message: `User ${decoded.UserInfo.username}'s token expires`
          });
        } catch (error) {
          console.error('Refresh', error);

          return res.status(500).json({
            status: 'Internal server error',
            message: `Delete refresh token error: ${error}.`
          });
        }
      }

      if (foundToken.User.username !== decoded.UserInfo.username) {
        return res.status(403).json({
          status: 'Forbidden',
          message: `User ${foundToken.User.username}'s username doesn't match token data.`
        });
      }

      // Refresh token was still valid
      const userRole = await Model.UserRole.findOne({
        where: { id: foundToken.User.role_id },
        attributes: ['role']
      });

      const accessToken = jwt.sign(
        {
          UserInfo: {
            id: decoded.UserInfo.id,
            username: decoded.UserInfo.username,
            role: userRole.role
          }
        },
        process.env.ACCESS_TOKEN_SECRET,
        { expiresIn: '10m' }
      );

      const newRefreshToken = jwt.sign(
        {
          UserInfo: {
            id: decoded.UserInfo.id,
            username: decoded.UserInfo.username
          }
        },
        process.env.REFRESH_TOKEN_SECRET,
        { expiresIn: '1d' }
      );

      try {
        // Update the refresh token
        await foundToken.update(
          { token: refreshToken },
          { where: { token: refreshToken } }
        );

        // Send secure cookie
        res.cookie('jwt', newRefreshToken, {
          httpOnly: true,
          secure: true,
          sameSite: 'None',
          maxAge: 24 * 60 * 60 * 1000
        });

        // Send the response
        return res.status(201).json({
          status: 'Created',
          message: 'New refresh toke created successfully',
          data: {
            username: decoded.UserInfo.username,
            accessToken,
            userRole
          }
        });
      } catch (error) {
        console.error('Refresh token', error);

        return res.status(500).json({
          status: 'Internal server error',
          message: `Refresh token error: ${error}.`
        });
      }
    }
  );
};

export default refreshTokenController;
