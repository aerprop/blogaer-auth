import { NextFunction, Request, Response } from 'express';
import createPublisherChan from '../../messaging/channels/createPublisherChan';
import createConsumerChan from '../../messaging/channels/createConsumerChan';

export default async function initPubConChan(
  req: Request,
  res: Response,
  next: NextFunction
) {
  const ch1 = await createPublisherChan;
  const ch2 = await createConsumerChan;
  if (ch1 && ch2) {
    req.publisherChan = ch1;
    req.consumerChan = ch2;
    next();
  } else {
    return res.status(500).json({
      status: 'Internal server error',
      error: 'Asserting exchange failed!'
    });
  }
}
