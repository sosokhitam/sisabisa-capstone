import express from 'express';
import {
  getAllIngredients,
  getIngredientById,
  createIngredient,
  updateIngredient,
  updateIngredientStatus,
} from '../controllers/ingredientController.js';
import { authenticate } from '../middleware/authMiddleware.js';
import { authorizeRole } from '../middleware/roleMiddleware.js';

const router = express.Router();

router.get('/', getAllIngredients);
router.get('/:id', getIngredientById);

router.post(
  '/',
  authenticate,
  authorizeRole('admin'),
  createIngredient
);

router.put(
  '/:id',
  authenticate,
  authorizeRole('admin'),
  updateIngredient
);

router.patch(
  '/:id/status',
  authenticate,
  authorizeRole('admin'),
  updateIngredientStatus
);

export default router;