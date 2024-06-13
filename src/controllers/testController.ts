import { Request, Response } from 'express';

export default function testController(req: Request, res: Response) {
  console.log('set cookie');
  
  res.status(200).json({
    status: 'Success',
    message: 'test api route'
  })
}