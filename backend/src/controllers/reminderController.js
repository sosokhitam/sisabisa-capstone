import pool from '../config/db.js';
import { sendExpiryReminderEmail } from '../services/emailService.js';

export const runExpiryReminder = async (req, res) => {
  try {
    const secret = req.headers['x-cron-secret'];

    if (secret !== process.env.CRON_SECRET) {
      return res.status(401).json({
        message: 'Unauthorized cron request',
      });
    }

    const result = await pool.query(`
      SELECT 
        ui.id AS inventory_id,
        ui.user_id,
        ui.ingredient_name,
        ui.expired_at,
        u.email
      FROM user_inventory ui
      JOIN users u ON ui.user_id = u.id
      LEFT JOIN notification_logs nl
        ON nl.inventory_id = ui.id
        AND nl.notification_type = 'expiry_reminder'
      WHERE ui.expired_at 
        BETWEEN CURRENT_DATE 
        AND CURRENT_DATE + INTERVAL '3 days'
      AND nl.id IS NULL
    `);

    for (const item of result.rows) {
      const formattedExpiredAt = new Date(item.expired_at).toLocaleDateString(
        'id-ID',
        {
          day: '2-digit',
          month: 'long',
          year: 'numeric',
        }
      );

      await sendExpiryReminderEmail(
        item.email,
        item.ingredient_name,
        formattedExpiredAt
      );

      await pool.query(
        `
        INSERT INTO notification_logs
        (user_id, inventory_id, notification_type)
        VALUES ($1, $2, 'expiry_reminder')
        `,
        [item.user_id, item.inventory_id]
      );
    }

    res.json({
      message: 'Expiry reminder processed',
      total: result.rows.length,
    });
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};