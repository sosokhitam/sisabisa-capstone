import express from 'express';
import { runExpiryReminder } from '../controllers/reminderController.js';

const router = express.Router();

router.post('/expiry-reminder', runExpiryReminder);

export default router;