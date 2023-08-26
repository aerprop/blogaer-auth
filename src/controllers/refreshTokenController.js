import Model from '../models/index.js';
import jwt from 'jsonwebtoken';

const refreshTokenController = async (req, res) => {
  const cookies = req.cookies;
  if (!cookies?.jwt) return res.sendStatus(401);

  const refreshToken = cookies.jwt;
  res.clearCookie('jwt', { httpOnly: true, sameSite: 'None', secure: true });

  const foundUser = Model.RefreshToken.findOne({
    where: { token: refreshToken },
    include: [Model.User]
  });

  // Detected refresh token reuse!
  if (!foundUser) {
    jwt.verify(
      refreshToken,
      process.env.REFRESH_TOKEN_SECRET,
      async (err, decoded) => {
        // No user found
        if (err) return res.sendStatus(403);
        // User found - attempted refresh token reuse!
        const hackedUser = await Model.User.findOne({
          where: {
            username: decoded.id
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
        console.log(`${foundUser.username}'s token expires!`);
        try {
          const deletedTokens = await Model.RefreshToken.destroy({
            where: {
              token: refreshToken
            }
          });
          console.log(`Deleted ${decoded.username}'s token:`, deletedTokens);
        } catch (error) {
          console.log(`Deleted tokens error: ${error}`);
        }
      }

      if (err || foundUser.username !== decoded.username) {
        return res.sendStatus(403);
      }

      // Refresh token was still valid
      const userRole = await Model.UserRole.findOne({
        where: { id: decoded.id }
      }).role;

      const accessToken = jwt.sign(
        {
          UserInfo: {
            id: decoded.id,
            username: decoded.username,
            role: userRole.role
          }
        },
        process.env.ACCESS_TOKEN_SECRET,
        { expiresIn: '10m' }
      );

      const newRefreshToken = jwt.sign(
        {
          UserInfo: {
            id: decoded.id,
            username: decoded.username,
            role: userRole.role
          }
        },
        process.env.REFRESH_TOKEN_SECRET,
        { expiresIn: '1d' }
      );

      try {
        // Insert a new refresh token to the database
        await Model.RefreshToken.create({
          token: newRefreshToken,
          user_id: decoded.id
        });

        // Send secure cookie
        res.cookie('jwt', newRefreshToken, {
          httpOnly: true,
          secure: true,
          sameSite: 'None',
          maxAge: 24 * 60 * 60 * 1000
        });

        // Send the response
        res.status(201).json({
          status: 'Created',
          message: 'New refresh toke created successfully',
          data: {
            username: decoded.username,
            accessToken,
            userRole
          }
        });
      } catch (error) {
        console.error('Create new refresh token error: ', error);
      }
    }
  );
};

export default refreshTokenController;
