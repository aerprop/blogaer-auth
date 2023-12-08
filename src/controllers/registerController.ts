import { Request, Response } from 'express';
import Models from '../models';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { body } from 'express-validator';
import validateRequest from '../middlewares/validateRequest';

type ReqBody = {
  username: string;
  email: string;
  password: string;
};

const registerController = [
  body('username').trim().isLength({ min: 2 }).withMessage('Username must be at least 2 characters.'),
  body('email').isEmail().withMessage('Not a valid email address.'),
  body('password').trim().isLength({ min: 4 }).withMessage('Password must be at least 4 characters.'),
  validateRequest,
  async (req: Request, res: Response) => {
  const { username, email, password }: ReqBody = req.body;
  const hashPassword = await bcrypt.hash(password, 10);

  try {
    const user = await Models.User.create({
      username,
      email,
      password: hashPassword
    });

    if (!user || !user.id) throw new Error('Create user failed');

    const accessToken = jwt.sign(
      {
        UserInfo: {
          id: user.id,
          username: user.username,
          role: user.role_id === 2 ? 'Author' : 'Admin'
        }
      },
      process.env.ACCESS_TOKEN_SECRET as string,
      { expiresIn: '10m' }
    );

    const refreshToken = jwt.sign(
      {
        UserInfo: {
          id: user.id,
          username: user.username
        }
      },
      process.env.REFRESH_TOKEN_SECRET as string,
      { expiresIn: '1d' }
    );

    await Models.RefreshToken.create({
      token: refreshToken,
      user_id: user.id
    });

    // Send secure cookie
    res.cookie('jwt', refreshToken, {
      httpOnly: true,
      secure: true,
      sameSite: 'none',
      maxAge: 24 * 60 * 60 * 1000
    });

    res.status(201).json({
      status: 'Created',
      message: 'User successfully registered',
      data: {
        username: user.username,
        email: user.email,
        role: user.role_id === 2 ? 'Author' : 'Admin',
        token: accessToken
      }
    });
  } catch (error) {
    console.error('Register', error);

    return res.status(500).json({
      status: 'Internal server error',
      message: `Register error: ${error}.`
    });
  }
}];

export default registerController;
