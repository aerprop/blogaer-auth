import { NextFunction, Request, Response } from 'express';
import createPublisherChan from '../../messaging/channels/createPublisherChan';

export default async function initPublisherChan(
  req: Request,
  res: Response,
  next: NextFunction
) {
  const channel = await createPublisherChan;
  if (channel) {
    req.publisherChan = channel;
    next();
  } else {
    return res.status(500).json({
      status: 'Internal server error',
      error: 'Asserting exchange failed!'
    });
  }
}
