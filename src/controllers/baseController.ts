import { Request, Response } from "express";

const baseController = (_: Request, res: Response) => {
  try {
    res.status(200).json({
      status: 'OK',
      message: 'This is the root route.',
      data: {
        api: 'Authentication Service',
        version: '1.0',
        status: 'healthy',
        authentication_methods: ['JWT', 'OAuth2'],
        documentation: {
          authentication: '/docs/authentication',
          token_management: '/docs/token'
        }
      }
    });
  } catch (error) {
    res.status(500).json({
      status: 'Internal server error',
      message: `Request api data error: ${error}`
    });
  }
};

export default baseController;
