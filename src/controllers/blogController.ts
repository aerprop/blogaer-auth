import { Request, Response } from 'express';

const blogController = {
  async insert(req: Request, res: Response) {
    const data = JSON.stringify(req.body)
  },
  async get() {},
  async update() {},
  async delete() {}
};

export default blogController;
