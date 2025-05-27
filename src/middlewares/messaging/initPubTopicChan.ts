import { NextFunction, Request, Response } from 'express';
import createPubTopicChan from '../../messaging/channels/createPubTopicChan';

export default async function initPubTopicChan(
  req: Request,
  res: Response,
  next: NextFunction
) {
  const channel = await createPubTopicChan();
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
