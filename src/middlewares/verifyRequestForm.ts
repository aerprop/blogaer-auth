import { NextFunction, Request, Response } from 'express';
import initMainModel from '../models/initMainModel';
import { generateClientId } from '../utils/helper';

export default async function verifyRequestForm(
  req: Request,
  res: Response,
  next: NextFunction
) {
  const { request, limit } = req.body;

  const model = await initMainModel;
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
      limit: new Date(Number(limit))
    }
  });
  if (foundRequest) {
    const now = Date.now();
    const hasExpired = now > foundRequest.limit.getTime();
    if (hasExpired) {
      return res.status(498).json({
        status: 'Request timeout',
        error: 'Request form has expired!'
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
