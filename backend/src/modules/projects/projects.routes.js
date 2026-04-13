// Projects routes
// Will be implemented in Step 7

export const setupProjectsRoutes = (router) => {
  // GET /projects
  router.get('/', (req, res) => {
    res.status(200).json({ message: 'Not implemented' });
  });

  // POST /projects
  router.post('/', (req, res) => {
    res.status(200).json({ message: 'Not implemented' });
  });

  // GET /projects/:id
  router.get('/:id', (req, res) => {
    res.status(200).json({ message: 'Not implemented' });
  });

  // PATCH /projects/:id
  router.patch('/:id', (req, res) => {
    res.status(200).json({ message: 'Not implemented' });
  });

  // DELETE /projects/:id
  router.delete('/:id', (req, res) => {
    res.status(200).json({ message: 'Not implemented' });
  });

  // GET /projects/:id/stats
  router.get('/:id/stats', (req, res) => {
    res.status(200).json({ message: 'Not implemented' });
  });

  return router;
};

export default setupProjectsRoutes;
