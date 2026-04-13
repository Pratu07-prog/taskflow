// Tasks routes
// Will be implemented in Step 8

export const setupTasksRoutes = (router) => {
  // GET /projects/:projectId/tasks
  router.get('/projects/:projectId/tasks', (req, res) => {
    res.status(200).json({ message: 'Not implemented' });
  });

  // POST /projects/:projectId/tasks
  router.post('/projects/:projectId/tasks', (req, res) => {
    res.status(200).json({ message: 'Not implemented' });
  });

  // PATCH /tasks/:id
  router.patch('/:id', (req, res) => {
    res.status(200).json({ message: 'Not implemented' });
  });

  // DELETE /tasks/:id
  router.delete('/:id', (req, res) => {
    res.status(200).json({ message: 'Not implemented' });
  });

  return router;
};

export default setupTasksRoutes;
