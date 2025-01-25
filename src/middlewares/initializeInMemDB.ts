import { NextFunction, Request, Response } from 'express';
import getInMemoryModel from '../models/in-memory/InMemoryModel';

export default async function initializeInMemDB(
  req: Request,
  _: Response,
  next: NextFunction
) {
  req.inMemModel = await getInMemoryModel();
  next();
}
