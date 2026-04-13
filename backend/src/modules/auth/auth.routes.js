// Auth routes - Register & Login
// Will be implemented in Step 5

export const setupAuthRoutes = (router) => {
  // register route
  router.post('/register', (req, res) => {
    res.status(200).json({ message: 'Not implemented' });
  });

  // login route
  router.post('/login', (req, res) => {
    res.status(200).json({ message: 'Not implemented' });
  });

  return router;
};

export default setupAuthRoutes;
