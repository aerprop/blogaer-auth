import Models from '../models/index.js';
import bcrypt from 'bcrypt';

const registerController = async (req, res) => {
  const { username, email, password } = req.body;
  const hashPassword = await bcrypt.hash(password, 10);

  try {
    const user = await Models.User.create({
      username,
      email,
      password: hashPassword
    });
    if (!user) throw new Error('user');
    res.status(201).json({
      status: 'Created',
      message: 'User successfully registered'
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
