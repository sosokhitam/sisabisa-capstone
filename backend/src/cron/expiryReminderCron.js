import cron from 'node-cron';
import pool from '../config/db.js';
import { sendExpiryReminderEmail } from '../services/emailService.js';

export const startExpiryReminderCron = () => {
  cron.schedule(
    '0 7 * * *',
    async () => {
      try {
        console.log('Checking expiry reminders...');

        const result = await pool.query(`
          SELECT 
            ui.id AS inventory_id,
            ui.user_id,
            ui.ingredient_name,
            ui.expired_at,
            u.email
          FROM user_inventory ui
          JOIN users u 
            ON ui.user_id = u.id
          LEFT JOIN notification_logs nl
            ON nl.inventory_id = ui.id
            AND nl.notification_type = 'expiry_reminder'
          WHERE ui.expired_at 
            BETWEEN CURRENT_DATE 
            AND CURRENT_DATE + INTERVAL '3 days'
          AND nl.id IS NULL
        `);

        console.log(`Found ${result.rows.length} items`);

        for (const item of result.rows) {
          try {
            const formattedExpiredAt = new Date(
              item.expired_at
            ).toLocaleDateString('id-ID', {
              day: '2-digit',
              month: 'long',
              year: 'numeric',
            });

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

            console.log(`Reminder sent to ${item.email}`);
          } catch (emailError) {
            console.error(
              `Failed sending email to ${item.email}:`,
              emailError.message
            );
          }
        }
      } catch (error) {
        console.error(
          'Expiry reminder cron error:',
          error.message
        );
      }
    },
    {
      timezone: 'Asia/Jakarta',
    }
  );
};