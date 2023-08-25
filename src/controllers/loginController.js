import User from './models/user';
import UserRole from './models/userRole';
import RefreshToken from './models/refreshToken';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';

const loginController = async (req, res) => {
  const cookies = req.cookies;

  const { email, password } = req.body;
  if (!email || !password) {
    return res.status(400).status({
      status: 'Bad request',
      messages: 'Email and password are required.'
    });
  }

  const foundUser = await User.findOne({ where: { email } });
  if (!foundUser) {
    return res.status(404).status({
      status: 'Not found',
      messages: `User with email of '${email}' not found.`
    });
  }

  const correctPassword = await bcrypt.compare(password, foundUser.password);
  if (correctPassword) {
    const userRole = await UserRole.findOne({
      where: { id: foundUser.role_id }
    }).role;

    const accessToken = jwt.sign(
      {
        UserInfo: {
          id: foundUser.id,
          username: foundUser.username,
          role: userRole.role
        }
      },
      process.env.ACCESS_TOKEN_SECRET,
      { expiresIn: '10m' }
    );

    const newRefreshToken = jwt.sign(
      {
        UserInfo: {
          id: foundUser.id,
          username: foundUser.username,
          role: userRole.role
        }
      },
      process.env.REFRESH_TOKEN_SECRET,
      { expiresIn: '1d' }
    );

    let isNoReuseDetected = true;

    if (cookies?.jwt) {
      const refreshToken = cookies.jwt;
      const foundToken = await RefreshToken.findOne({
        where: { token: refreshToken }
      });
      // Detected refresh token reuse!
      if (!foundToken) {
        console.log('Attempted refresh token reuse at login');

        isNoReuseDetected = false;
      }

      res.clearCookie('jwt', {
        httpOnly: true,
        sameSite: 'None',
        secure: true
      });
    }

    try {
      if (isNoReuseDetected) {
        await RefreshToken.create({
          token: newRefreshToken,
          user_id: foundUser.id
        });

        // Send secure cookie
        res.cookie('jwt', newRefreshToken, {
          httpOnly: true,
          secure: true,
          sameSite: 'None',
          maxAge: 24 * 60 * 60 * 1000
        });

        // Send the response
        res.status(200).json({
          status: 'OK',
          message: 'User successfully logged in.',
          data: {
            accessToken,
            userRole
          }
        });
      } else {
        const deletedToken = await RefreshToken.destroy({
          where: { token: cookies.jwt }
        });

        console.log(
          'Deleted refresh token after reuse attempted: ',
          deletedToken
        );
      }
    } catch (error) {
      console.error('Login error: ', error);
    }
  }
};

export default loginController;
