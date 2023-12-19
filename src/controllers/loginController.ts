import Models from '../models';
import bcrypt from 'bcrypt';
import { Request, Response } from 'express';
import { body } from 'express-validator';
import jwt from 'jsonwebtoken';
import validateRequest from '../middlewares/validateRequest';

const loginController = [
  body('email').isEmail().withMessage('Not a valid email address.'),
  body('password').trim().notEmpty().withMessage('Password must not be empty.'),
  validateRequest,
  async (req: Request, res: Response) => {
    const cookies = req.cookies;
    const { email, password } = req.body;

    const foundUser = await Models.User.findOne({
      where: { email },
      attributes: ['id', 'username', 'email', 'password', 'role_id']
    });

    if (!foundUser) {
      return res.status(404).json({
        status: 'Not found',
        messages: `User with email of '${email}' not found.`
      });
    }

    const correctPassword = await bcrypt.compare(password, foundUser.password);
    if (correctPassword) {

      const accessToken = jwt.sign(
        {
          UserInfo: {
            id: foundUser.id,
            username: foundUser.username,
            role: foundUser.role_id === 2 ? 'Author' : 'Admin'
          }
        },
        process.env.ACCESS_TOKEN_SECRET as string,
        { expiresIn: '10m' }
      );

      const newRefreshToken = jwt.sign(
        {
          UserInfo: {
            id: foundUser.id,
            username: foundUser.username
          }
        },
        process.env.REFRESH_TOKEN_SECRET as string,
        { expiresIn: '1d' }
      );

      let isNoReuseDetected = true;

      if (cookies?.jwt) {
        const refreshToken = cookies.jwt;
        const foundToken = await Models.RefreshToken.findOne({
          where: { token: refreshToken }
        });
        // Detected refresh token reuse!
        if (!foundToken) {
          console.log('Attempted refresh token reuse at login');

          isNoReuseDetected = false;
        }

        res.clearCookie('jwt', {
          httpOnly: true,
          sameSite: false,
          secure: true
        });
      }

      try {
        if (isNoReuseDetected && foundUser.id) {
          await Models.RefreshToken.create({
            token: newRefreshToken,
            user_id: foundUser.id
          });

          // Send secure cookie
          res.cookie('jwt', newRefreshToken, {
            httpOnly: true,
            secure: process.env.NODE_ENV !== 'development',
            sameSite: 'lax',  
            maxAge: 24 * 60 * 60 * 1000
          });

          // Send the response
          res.status(200).json({
            status: 'OK',
            message: `User ${foundUser.username} successfully logged in.`,
            data: {
              username: foundUser.username,
              email: foundUser.email,
              role: foundUser.role_id === 2 ? 'Author' : 'Admin',
              token: accessToken
            }
          });
        } else {
          const deletedToken = await Models.RefreshToken.destroy({
            where: { token: cookies.jwt }
          });

          console.log(
            'Deleted refresh token after reuse attempted: ',
            deletedToken
          );
        }
      } catch (error) {
        console.error('Login', error);

        return res.status(500).json({
          status: 'Internal server error',
          message: `Login error: ${error}.`
        });
      }
    } else {
      return res.status(401).json({
        status: 'Unauthorized',
        message: 'Incorrect password. Please check your password and try again.'
      });
    }
  }
];

export default loginController;
