import { validationResult } from 'express-validator';

const validateResult = (req, res, next) => {
  const errors = validationResult(req);

  if (!errors.isEmpty()) {
    return res.status(400).json({
      status: 'Bad request',
      message: 'Form validation error.',
      errors: errors.array()
    });
  }

  next();
};

export default validateResult;
