import express from 'express';
import {
  saveFavoriteRecipe,
  getFavoriteRecipes,
  deleteFavoriteRecipe,
} from '../controllers/favoriteRecipeController.js';
import { authenticate } from '../middleware/authMiddleware.js';

const router = express.Router();

router.post('/', authenticate, saveFavoriteRecipe);
router.get('/', authenticate, getFavoriteRecipes);
router.delete('/:id', authenticate, deleteFavoriteRecipe);

export default router;