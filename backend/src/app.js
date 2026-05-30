import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import authRoutes from './routes/authRoutes.js';
import inventoryRoutes from './routes/inventoryRoutes.js';
import publicRoutes from './routes/publicRoutes.js';
import { startExpiryReminderCron } from './cron/expiryReminderCron.js';
import recommendationRoutes from './routes/recommendationRoutes.js';
import favoriteRecipeRoutes from './routes/favoriteRecipeRoutes.js';
import adminRoutes from './routes/adminRoutes.js';
import ingredientRoutes from './routes/ingredientRoutes.js';


dotenv.config();

const app = express();

app.use(cors());
app.use(express.json());

startExpiryReminderCron();
app.use('/auth', authRoutes);
app.use('/inventory', inventoryRoutes);
app.use('/public', publicRoutes);
app.use('/recommendations', recommendationRoutes);
app.use('/favorites', favoriteRecipeRoutes);
app.use('/admin', adminRoutes);
app.use('/ingredients', ingredientRoutes);
app.get('/', (req, res) => {
  res.json({
    message: 'API Running'
  });
});

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});