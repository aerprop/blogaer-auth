import { Request, Response } from 'express';
import models from '../../models';
import jwt, { JwtPayload, Secret, VerifyErrors } from 'jsonwebtoken';
import RefreshToken from '../../models/refreshToken';
import { Decoded } from '../../types/common';

type RefreshTokenJoinUser = RefreshToken & {
  User: {
    username: string;
    roleId: string;
  };
};

export default async function refreshTokenController(
  req: Request,
  res: Response
) {
  const refreshToken = req.cookies[`${process.env.REFRESH_TOKEN}`];
  if (!refreshToken) {
    return res.status(401).json({
      status: 'Unauthorized',
      message: 'No login cookie provided.'
    });
  }
  const model = await models;
  const foundToken = (await model.refreshToken.findOne({
    where: { token: refreshToken },
    include: [
      {
        model: model.user,
        attributes: ['username', 'roleId']
      }
    ]
  })) as RefreshTokenJoinUser;
  // Refresh token reuse detection!
  jwt.verify(
    refreshToken,
    process.env.REFRESH_TOKEN_SECRET as Secret,
    async (err: VerifyErrors | null, decoded?: string | JwtPayload) => {
      const decodedToken = decoded as Decoded;
      if (!foundToken) {
        console.log('Attempted refresh token reuse at refresh token route');
        // No user found
        if (err) return res.sendStatus(403);
        // User found - attempted refresh token reuse!
        try {
          if (decodedToken?.UserInfo.username) {
            const hackedUser = await model.user.findOne({
              where: {
                username: decodedToken.UserInfo.username
              }
            });
            if (hackedUser) {
              const deletedTokens = await model.refreshToken.destroy({
                where: {
                  userId: hackedUser.id
                }
              });
              console.log(
                `Deleted ${hackedUser.username}'s tokens:`,
                deletedTokens
              );
            }
          }
          return res.status(401).json({
            status: 'Unauthorized',
            message: 'Reuse token detected.'
          });
        } catch (error) {
          console.log(`Deleted tokens error: ${error}`);
        }
        return res.sendStatus(403);
      }
      if (err) {
        // Session expired
        if (decodedToken?.UserInfo.username) {
          console.log(`${decodedToken.UserInfo.username}'s token expires!`);
          try {
            const deletedTokens = await model.refreshToken.destroy({
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
        const userRole = await model.userRole.findOne({
          where: { id: foundToken.User.roleId },
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
          { expiresIn: '15m' }
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
          await model.refreshToken.update(
            { token: newRefreshToken },
            { where: { token: refreshToken } }
          );

          return res.status(201).json({
            status: 'Created',
            message: 'New refresh token created successfully',
            data: {
              username: decodedToken.UserInfo.username,
              access: accessToken,
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
}
