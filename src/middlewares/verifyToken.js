import jwt from 'jsonwebtoken';

const verifyToken = (req, res, next) => {
  const header = req.headers.authorization || req.headers.Authorization;
  if (!header?.startsWith('Bearer')) {
    return res.status(401).json({
      status: 'Unauthorized',
      message: "Token Doesn't start with Bearer."
    });
  }

  const token = header.split(' ')[1];
  jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, (err, decoded) => {
    if (err) {
      return res.status(403).json({
        status: 'Forbidden',
        message: 'Invalid token.'
      });
    }

    next();
  });
};

export default verifyToken;
