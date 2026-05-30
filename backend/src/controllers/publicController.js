import pool from '../config/db.js';

export const checkExpiry = async (req, res) => {
  try {
    const { ingredient_id, storage, purchase_date } = req.body;

    if (!ingredient_id || !storage || !purchase_date) {
      return res.status(400).json({
        message: 'ingredient_id, storage, dan purchase_date wajib diisi',
      });
    }

    const result = await pool.query(
      `
      SELECT
        i.id AS ingredient_id,
        i.name AS item,
        i.category,
        r.storage,
        r.days
      FROM ingredients i
      JOIN ingredient_storage_rules r
        ON r.ingredient_id = i.id
      WHERE i.id = $1
        AND i.is_active = true
        AND LOWER(r.storage) = LOWER($2)
      LIMIT 1
      `,
      [ingredient_id, storage.trim()]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        message: 'Data bahan dengan storage tersebut tidak ditemukan',
      });
    }

    const ingredient = result.rows[0];

    const purchaseDate = new Date(purchase_date);
    const expiredDate = new Date(purchaseDate);

    expiredDate.setDate(expiredDate.getDate() + Number(ingredient.days));

    res.json({
      message: 'Estimasi expired berhasil dihitung',
      data: {
        ingredient_id: ingredient.ingredient_id,
        item: ingredient.item,
        category: ingredient.category,
        storage: ingredient.storage,
        shelf_life_days: ingredient.days,
        purchase_date,
        estimated_expired_at: expiredDate.toISOString().split('T')[0],
      },
    });
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};

export const searchIngredients = async (req, res) => {
  try {
    const { search } = req.query;

    if (!search || search.trim() === '') {
      return res.status(400).json({
        message: 'Query search wajib diisi',
      });
    }

    const result = await pool.query(
      `
      SELECT
        i.id AS ingredient_id,
        i.name AS item,
        i.category,
        COALESCE(
          json_agg(
            json_build_object(
              'storage', r.storage,
              'days', r.days
            )
            ORDER BY r.storage ASC
          ) FILTER (WHERE r.id IS NOT NULL),
          '[]'
        ) AS storage_rules
      FROM ingredients i
      LEFT JOIN ingredient_storage_rules r
        ON r.ingredient_id = i.id
      WHERE i.is_active = true
        AND i.name ILIKE $1
      GROUP BY i.id
      ORDER BY i.name ASC
      LIMIT 10
      `,
      [`%${search.trim()}%`]
    );

    res.json({
      message: 'Berhasil mengambil suggestion bahan',
      data: result.rows,
    });
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};