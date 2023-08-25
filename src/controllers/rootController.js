<<<<<<< HEAD
const rootController = (req, res) => {
=======
const handleRoot = (req, res) => {
>>>>>>> 3ff51376fa586995278947de5f7501834dd0c1c2
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
      message: `Root route error: ${error}`
    });
  }
};

<<<<<<< HEAD
export default rootController;
=======
export default handleRoot;
>>>>>>> 3ff51376fa586995278947de5f7501834dd0c1c2
