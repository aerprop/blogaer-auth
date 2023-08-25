import User from './models/user';
import RefreshToken from './models/refreshToken';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';

const registerController = async (req, res) => {
  const { username, email, password } = req.body;

  if (!username || !email || !password) {
    return res.status(400).json({
      status: 'Bad request',
      message: 'Username, email and password are required.'
    });
  }

  const hashPassword = await bcrypt.hash(password, 10);

  const user = await User.create({
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
        username: user.username,
        role: user.role_id
      }
    },
    process.env.REFRESH_TOKEN_SECRET,
    { expiresIn: '1d' }
  );

  try {
    await RefreshToken.create({
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
    console.error('Login error: ', error);
  }
};

export default registerController;
