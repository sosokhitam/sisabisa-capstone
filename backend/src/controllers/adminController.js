import pool from '../config/db.js';

export const getAdminStats = async (req, res) => {
  try {
    const totalUsers = await pool.query(`
      SELECT COUNT(*)::int AS total
      FROM users
      WHERE role = 'user'
    `);

    const totalInventory = await pool.query(`
      SELECT COUNT(ui.*)::int AS total
      FROM user_inventory ui
      JOIN users u
        ON ui.user_id = u.id
      WHERE u.role = 'user'
    `);

    const totalFavorites = await pool.query(`
      SELECT COUNT(fr.*)::int AS total
      FROM favorite_recipes fr
      JOIN users u
        ON fr.user_id = u.id
      WHERE u.role = 'user'
    `);

    const expiredItems = await pool.query(`
      SELECT COUNT(ui.*)::int AS total
      FROM user_inventory ui
      JOIN users u
        ON ui.user_id = u.id
      WHERE ui.expired_at < CURRENT_DATE
      AND u.role = 'user'
    `);

    return res.json({
      message: 'Admin stats berhasil diambil',
      data: {
        total_users: totalUsers.rows[0].total,
        total_inventory: totalInventory.rows[0].total,
        total_favorites: totalFavorites.rows[0].total,
        expired_items: expiredItems.rows[0].total,
      },
    });
  } catch (error) {
    return res.status(500).json({
      message: error.message,
    });
  }
};

export const getUsersOverview = async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT
        u.id,
        u.name,
        u.email,
        u.role,
        COUNT(DISTINCT ui.id)::int AS total_inventory,
        COUNT(DISTINCT fr.id)::int AS total_favorites
      FROM users u
      LEFT JOIN user_inventory ui
        ON ui.user_id = u.id
      LEFT JOIN favorite_recipes fr
        ON fr.user_id = u.id
      WHERE u.role = 'user'
      GROUP BY u.id
      ORDER BY total_inventory DESC
    `);

    return res.json({
      message: 'Users overview berhasil diambil',
      data: result.rows,
    });
  } catch (error) {
    return res.status(500).json({
      message: error.message,
    });
  }
};

export const getExpiredItemsOverview = async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT
        ui.id,
        ui.ingredient_name,
        ui.quantity,
        ui.unit,
        ui.expired_at,
        u.name AS user_name,
        u.email AS user_email
      FROM user_inventory ui
      JOIN users u
        ON ui.user_id = u.id
      WHERE ui.expired_at < CURRENT_DATE
      AND u.role = 'user'
      ORDER BY ui.expired_at ASC
    `);

    return res.json({
      message: 'Expired items overview berhasil diambil',
      data: result.rows,
    });
  } catch (error) {
    return res.status(500).json({
      message: error.message,
    });
  }
};