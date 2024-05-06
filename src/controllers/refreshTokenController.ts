import { Request, Response } from 'express';
import Models from '../models';
import jwt, { JwtPayload, Secret, VerifyCallback, VerifyErrors } from 'jsonwebtoken';
import RefreshToken from '../models/refreshToken';

type Decoded = {
  UserInfo: {
    id: string;
    username: string;
  };
};

type Cookies = {
  jwt: string
}

type RefreshTokenJoinUser = RefreshToken & {
  User: {
    username: string,
    role_id: string
  }
}

const refreshTokenController = async (req: Request, res: Response) => {
  const cookies: Cookies = req.cookies;
  if (!cookies?.jwt) {
    return res.status(401).json({
      status: 'Unauthorized',
      message: 'No jwt cookie provided.'
    });
  }

  const refreshToken = cookies.jwt;
  res.clearCookie('jwt', { httpOnly: true, sameSite: 'none', secure: true });

  const foundToken = await Models.RefreshToken.findOne({
    where: { token: refreshToken },
    include: [
      {
        model: Models.User,
        attributes: ['username', 'role_id']
      }
    ]
  }) as RefreshTokenJoinUser;

  // Detected refresh token reuse!
  jwt.verify(
    refreshToken,
    process.env.REFRESH_TOKEN_SECRET as Secret,
    async (err: VerifyErrors | null, decoded?: string | JwtPayload) => {
      const decodedToken = decoded as Decoded
      if (!foundToken) {
        console.log('Attempted refresh token reuse at refresh token route');
        // No user found
        if (err) return res.sendStatus(403);
        // User found - attempted refresh token reuse!
        try {
          if (decodedToken?.UserInfo.username) {
            const hackedUser = await Models.User.findOne({
              where: {
                username: decodedToken.UserInfo.username
              }
            });

            if (hackedUser) {
              const deletedTokens = await Models.RefreshToken.destroy({
                where: {
                  user_id: hackedUser.id
                }
              });
              console.log(
                `Deleted ${hackedUser.username}'s tokens:`,
                deletedTokens
              );
            }
          }
        } catch (error) {
          console.log(`Deleted tokens error: ${error}`);
        }
        return res.sendStatus(403);
      }
      if (err) {
        if (decodedToken?.UserInfo.username) {
          console.log(`${decodedToken.UserInfo.username}'s token expires!`);
          try {
            const deletedTokens = await Models.RefreshToken.destroy({
              where: {
                token: refreshToken
              }
            });

            console.log(
              `Deleted ${decodedToken.UserInfo.username}'s token:`,
              deletedTokens
            );

            return res.status(403).json({
              status: 'Forbidden',
              message: `User ${decodedToken.UserInfo.username}'s token expires`
            });
          } catch (error) {
            console.error('Refresh', error);

            return res.status(500).json({
              status: 'Internal server error',
              message: `Delete refresh token error: ${error}.`
            });
          }
        }
      }

      if (foundToken.User.username && decodedToken?.UserInfo.username) {
        if (foundToken.User.username !== decodedToken.UserInfo.username) {
          return res.status(403).json({
            status: 'Forbidden',
            message: `User ${foundToken.User.username}'s username doesn't match token data.`
          });
        }

        // Refresh token was still valid
        const userRole = await Models.UserRole.findOne({
          where: { id: foundToken.User.role_id },
          attributes: ['role']
        });

        const accessToken = jwt.sign(
          {
            UserInfo: {
              id: decodedToken.UserInfo.id,
              username: decodedToken.UserInfo.username,
              role: userRole?.role
            }
          },
          process.env.ACCESS_TOKEN_SECRET as string,
          { expiresIn: '10m' }
        );

        const newRefreshToken = jwt.sign(
          {
            UserInfo: {
              id: decodedToken.UserInfo.id,
              username: decodedToken.UserInfo.username
            }
          },
          process.env.REFRESH_TOKEN_SECRET as string,
          { expiresIn: '1d' }
        );

        try {
          await foundToken.update(
            { token: refreshToken },
            { where: { token: refreshToken } }
          );

          return res.status(200).json({
            status: 'Created',
            message: 'New refresh token created successfully',
            data: {
              username: decodedToken.UserInfo.username,
              token: accessToken,
              refresh: newRefreshToken
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
    }
  );
};

export default refreshTokenController;
