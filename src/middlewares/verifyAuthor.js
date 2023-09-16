const verifyAuthor = (req, res, next) => {
  const role = req.role;
  if (role.toLowerCase() !== 'author') {
    res.status(403).send('Forbidden');
  }
  next();
};

export default verifyAuthor;
