import express from 'express';
import {
  getInventory,
  createInventory,
  updateInventory,
  updateInventoryStorage,
  deleteInventory,
} from '../controllers/inventoryController.js';

import { authenticate } from '../middleware/authMiddleware.js';

const router = express.Router();

router.get('/', authenticate, getInventory);
router.post('/', authenticate, createInventory);
router.put('/:id', authenticate, updateInventory);
router.patch('/:id/storage', authenticate, updateInventoryStorage);
router.delete('/:id', authenticate, deleteInventory);

export default router;