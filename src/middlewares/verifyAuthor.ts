import { NextFunction, Request, Response } from "express";

const verifyAuthor = (req: Request, res: Response, next: NextFunction) => {
  // const role = req.role;
  // if (role.toLowerCase() !== 'author') {
  //   res.status(403).send('Forbidden');
  // }
  next();
};

export default verifyAuthor;
