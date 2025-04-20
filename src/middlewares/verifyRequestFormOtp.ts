import { NextFunction, Request, Response } from 'express';
import MainModel from '../models/MainModel';
import { generateClientId } from '../utils/helper';

export default async function verifyRequestFormOtp(
  req: Request,
  res: Response,
  next: NextFunction
) {
  const { otp, request, limit } = req.body;
  if (otp === 'undefined') return res.sendStatus(498);

  const model = await MainModel;
  if (!model) {
    console.log('securityController.ts >>> Database connection failed!');
    return res.status(500).json({
      status: 'Internal server error',
      error: 'Database connection failed!'
    });
  }
  const { clientId } = generateClientId(req.headers['user-agent']);
  if (!clientId) {
    return res
      .status(400)
      .json({ status: 'Bad request', error: 'User agent is invalid!' });
  }
  const foundRequest = await model.userRequest.findOne({
    where: {
      userId: req.userId,
      clientId,
      request,
      limit: new Date(Number(limit)),
      otp
    }
  });
  if (foundRequest?.updatedAt) {
    const now = Date.now();
    const hasExpired = now > foundRequest.limit.getTime();
    if (hasExpired) {
      return res.status(498).json({
        status: 'Request timeout',
        error: 'Request form has expired!'
      });
    }

    const hasPassed5Min =
      Date.now() - foundRequest.updatedAt.getTime() > 5 * 60 * 1000;
    if (hasPassed5Min) {
      return res.status(498).json({
        status: 'Request timeout',
        error: 'Otp has passed 5 minutes timer!'
      });
    } else {
      req.userRequest = foundRequest;
      next();
    }
  } else {
    return res
      .status(404)
      .json({ status: 'Not found', error: 'Otp does not match!' });
  }
}
