import { Router, Request, Response } from 'express';

const router = Router();

// Example route
router.get('/', (_req: Request, res: Response) => {
  res.json({ 
    message: 'Welcome to the API',
    version: '1.0.0',
    timestamp: new Date().toISOString()
  });
});

export default router; 