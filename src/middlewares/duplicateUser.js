import User from './models/user';

const duplicateUser = async (req, res, next) => {
  const { username, email } = req.body;
  const duplicateUsername = await User.findOne({
    where: {
      username: username
    }
  });
  const duplicateEmail = await User.findOne({
    where: {
      email: username
    }
  });

  if (duplicateEmail || duplicateEmail) {
    return res.status(409).json({
      status: Conflict,
      message: 'User already exist'
    });
  }

  next();
};
