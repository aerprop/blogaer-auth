import Model from '../models/index.js';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';

const registerController = async (req, res) => {
  const { username, email, password } = req.body;
  const hashPassword = await bcrypt.hash(password, 10);

  const user = await Model.User.create({
    username,
    email,
    password: hashPassword
  });

  if (!user) {
    return res.status(500).json({
      status: 'Internal server error',
      message: 'Failed to insert user data to the database'
    });
  }

  const accessToken = jwt.sign(
    {
      UserInfo: {
        id: user.id,
        username: user.username,
        role: user.role_id
      }
    },
    process.env.ACCESS_TOKEN_SECRET,
    { expiresIn: '10m' }
  );

  const refreshToken = jwt.sign(
    {
      UserInfo: {
        id: user.id,
        username: user.username
      }
    },
    process.env.REFRESH_TOKEN_SECRET,
    { expiresIn: '1d' }
  );

  try {
    await Model.RefreshToken.create({
      token: refreshToken,
      user_id: user.id
    });

    // Send secure cookie
    res.cookie('jwt', refreshToken, {
      httpOnly: true,
      secure: true,
      sameSite: 'None',
      maxAge: 24 * 60 * 60 * 1000
    });

    // Send the response
    res.status(201).json({
      status: 'Created',
      message: 'User successfully registered',
      data: {
        username: user.username,
        email: user.email,
        accessToken
      }
    });
  } catch (error) {
    console.error('Register', error);

    return res.status(500).json({
      status: 'Internal server error',
      message: `Register error: ${error}.`
    });
  }
};

export default registerController;
