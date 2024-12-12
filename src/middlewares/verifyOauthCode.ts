import { NextFunction, Request, Response } from "express";

export default async function verifyOauthCode(
  req: Request,
  res: Response,
  next: NextFunction
) {
  const header = req.headers.authorization;
  if (!header?.startsWith('Oauth2')) {
    return res.status(401).json({
      status: 'Unauthorized',
      message: "Code Doesn't start with Oauth2."
    });
  }
  const code = header.split(' ')[1];
  if (code === 'undefined') return res.sendStatus(498);

  req.oauthCode = code;

  next();
}