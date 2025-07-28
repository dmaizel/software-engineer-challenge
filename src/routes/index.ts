import { Router } from 'express';
import searchController from './searchController/searchController';

const router = Router();

// Example route
router.post('/search', searchController);

export default router; 