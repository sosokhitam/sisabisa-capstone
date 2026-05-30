import express from 'express';
import {
  getAdminStats,
  getUsersOverview,
  getExpiredItemsOverview,
} from '../controllers/adminController.js';
import { getAdminIngredients } from '../controllers/ingredientController.js';
import { authenticate } from '../middleware/authMiddleware.js';
import { authorizeRole } from '../middleware/roleMiddleware.js';

const router = express.Router();

router.get('/stats', authenticate, getAdminStats);
router.get('/users-overview', authenticate, getUsersOverview);
router.get('/expired-items', authenticate, getExpiredItemsOverview);

router.get(
  '/ingredients',
  authenticate,
  authorizeRole('admin'),
  getAdminIngredients
);

export default router;