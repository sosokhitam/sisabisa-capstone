import express from 'express';
import {
  checkExpiry,
  searchIngredients,
} from '../controllers/publicController.js';

const router = express.Router();

router.post('/check-expiry', checkExpiry);
router.get('/ingredients', searchIngredients);

export default router;