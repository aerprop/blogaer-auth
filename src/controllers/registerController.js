import User from './models/user';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';

const handleRegister = async (req, res) => {
  const { username, email, password } = req.body;

  if (!username || !email || !password) {
    return res.status(400).json({
      status: 'Bad request',
      message: 'Username, email and password are required.'
    });
  }

  try {
    const hashPassword = await bcrypt.hash(password, 10);

    const user = await User.create({
      username: username,
      email: email,
      password: hashPassword
    });

    if (!user) {
      return res.status(500).json({
        status: 'Internal server error',
        message: 'Failed to insert user data to the database'
      });
    }

    const userInfo = await User.findOne({ where: { email: user.email } });

    const accessToken = jwt.sign(
      {
        UserInfo: {
          id: userInfo,
          username: userInfo.username,
          role: userInfo.role_id
        }
      },
      process.env.ACCESS_TOKEN_SECRET,
      { expiresIn: '10m'}
    );
    const refreshToken = jwt.sign(
      {
        UserInfo: {
          id: userInfo,
          username: userInfo.username,
          role: userInfo.role_id
        }
      },
      process.env.REFRESH_TOKEN_SECRET,
      { expiresIn: '1d'}
    );

    res.status(201).json({
      status: 'Created',
      message: 'User successfully registered',
      data: {
        username: user.username,
        email: user.email,
        access_token: '',
        refresh_token: ''
      }
    });
  } catch (error) {}
};

module.exports = { handleRegister };
