import User from './models/user';
import RefreshToken from './models/refreshToken';
import jwt, { decode } from 'jsonwebtoken';

const handleRefreshToken = async (req, res) => {
  const cookies = req.cookies;
  if (!cookies?.jwt) return res.sendStatus(401);

  const refreshToken = cookies.jwt;
  res.clearCookie('jwt', { httpOnly: true, sameSite: 'None', secure: true });

  const foundUser = RefreshToken.findOne({
    where: { token: refreshToken },
    include: [User]
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
        const hackedUser = await User.findOne({
          where: {
            username: decoded.id
          }
        });
        try {
          const deletedTokens = await Token.destroy({
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
          const deletedTokens = await Token.destroy({
            where: {
              token: refreshToken
            }
          });
          console.log(`Deleted ${hackedUser.username}'s token:`, deletedTokens);
        } catch (error) {
          console.log(`Deleted tokens error: ${error}`);
        }
      }

      if (err || foundUser.username !== decoded.username) return res.sendStatus(403);

      // Refresh token was still valid
    }
  );
};
