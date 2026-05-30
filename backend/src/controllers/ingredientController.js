import pool from '../config/db.js';

const isValidStorageRules = (storageRules) => {
  return (
    Array.isArray(storageRules) &&
    storageRules.length > 0 &&
    storageRules.every(
      (rule) =>
        rule.storage &&
        Number.isInteger(Number(rule.days)) &&
        Number(rule.days) >= 0
    )
  );
};

export const getAllIngredients = async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT 
        i.id,
        i.name,
        i.category,
        i.is_active,
        COALESCE(
          json_agg(
            json_build_object(
              'id', r.id,
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
      GROUP BY i.id
      ORDER BY i.name ASC
    `);

    res.json({
      status: 'success',
      data: result.rows,
    });
  } catch (error) {
    res.status(500).json({
      status: 'error',
      message: error.message,
    });
  }
};

export const getIngredientById = async (req, res) => {
  try {
    const { id } = req.params;

    const result = await pool.query(
      `
      SELECT 
        i.id,
        i.name,
        i.category,
        i.is_active,
        COALESCE(
          json_agg(
            json_build_object(
              'id', r.id,
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
      WHERE i.id = $1
      GROUP BY i.id
      `,
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        status: 'fail',
        message: 'Bahan tidak ditemukan',
      });
    }

    res.json({
      status: 'success',
      data: result.rows[0],
    });
  } catch (error) {
    res.status(500).json({
      status: 'error',
      message: error.message,
    });
  }
};

export const createIngredient = async (req, res) => {
  const client = await pool.connect();

  try {
    const { name, category, storage_rules } = req.body;

    if (!name || !category || !isValidStorageRules(storage_rules)) {
      return res.status(400).json({
        status: 'fail',
        message:
          'name, category, dan storage_rules wajib diisi dengan format valid',
      });
    }

    await client.query('BEGIN');

    const ingredientResult = await client.query(
      `
      INSERT INTO ingredients (name, category, is_active)
      VALUES ($1, $2, true)
      RETURNING *
      `,
      [name.trim().toLowerCase(), category.trim()]
    );

    const ingredient = ingredientResult.rows[0];

    for (const rule of storage_rules) {
      await client.query(
        `
        INSERT INTO ingredient_storage_rules (ingredient_id, storage, days)
        VALUES ($1, $2, $3)
        `,
        [ingredient.id, rule.storage.trim(), Number(rule.days)]
      );
    }

    await client.query('COMMIT');

    res.status(201).json({
      status: 'success',
      message: 'Bahan berhasil ditambahkan',
      data: ingredient,
    });
  } catch (error) {
    await client.query('ROLLBACK');

    if (error.code === '23505') {
      return res.status(409).json({
        status: 'fail',
        message: 'Bahan sudah ada atau storage rule duplikat',
      });
    }

    res.status(500).json({
      status: 'error',
      message: error.message,
    });
  } finally {
    client.release();
  }
};

export const updateIngredient = async (req, res) => {
  const client = await pool.connect();

  try {
    const { id } = req.params;
    const { name, category, storage_rules } = req.body;

    if (storage_rules && !isValidStorageRules(storage_rules)) {
      return res.status(400).json({
        status: 'fail',
        message: 'storage_rules tidak valid',
      });
    }

    await client.query('BEGIN');

    const ingredientResult = await client.query(
      `
      UPDATE ingredients
      SET 
        name = COALESCE($1, name),
        category = COALESCE($2, category),
        updated_at = CURRENT_TIMESTAMP
      WHERE id = $3
      RETURNING *
      `,
      [
        name ? name.trim().toLowerCase() : null,
        category ? category.trim() : null,
        id,
      ]
    );

    if (ingredientResult.rows.length === 0) {
      await client.query('ROLLBACK');

      return res.status(404).json({
        status: 'fail',
        message: 'Bahan tidak ditemukan',
      });
    }

    if (Array.isArray(storage_rules)) {
      await client.query(
        'DELETE FROM ingredient_storage_rules WHERE ingredient_id = $1',
        [id]
      );

      for (const rule of storage_rules) {
        await client.query(
          `
          INSERT INTO ingredient_storage_rules (ingredient_id, storage, days)
          VALUES ($1, $2, $3)
          `,
          [id, rule.storage.trim(), Number(rule.days)]
        );
      }
    }

    await client.query('COMMIT');

    const updatedResult = await pool.query(
      `
      SELECT 
        i.id,
        i.name,
        i.category,
        i.is_active,
        COALESCE(
          json_agg(
            json_build_object(
              'id', r.id,
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
      WHERE i.id = $1
      GROUP BY i.id
      `,
      [id]
    );

    res.json({
      status: 'success',
      message: 'Bahan berhasil diperbarui',
      data: updatedResult.rows[0],
    });
  } catch (error) {
    await client.query('ROLLBACK');

    if (error.code === '23505') {
      return res.status(409).json({
        status: 'fail',
        message: 'Nama bahan atau storage rule sudah ada',
      });
    }

    res.status(500).json({
      status: 'error',
      message: error.message,
    });
  } finally {
    client.release();
  }
};

export const updateIngredientStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { is_active } = req.body;

    if (typeof is_active !== 'boolean') {
      return res.status(400).json({
        status: 'fail',
        message: 'is_active harus bernilai boolean',
      });
    }

    const result = await pool.query(
      `
      UPDATE ingredients
      SET is_active = $1, updated_at = CURRENT_TIMESTAMP
      WHERE id = $2
      RETURNING *
      `,
      [is_active, id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        status: 'fail',
        message: 'Bahan tidak ditemukan',
      });
    }

    res.json({
      status: 'success',
      message: is_active
        ? 'Bahan berhasil dipulihkan'
        : 'Bahan berhasil diarsipkan',
      data: result.rows[0],
    });
  } catch (error) {
    res.status(500).json({
      status: 'error',
      message: error.message,
    });
  }
};

export const getAdminIngredients = async (req, res) => {
  try {
    const search = req.query.search || '';

    const result = await pool.query(
      `
      SELECT 
        i.id,
        i.name,
        i.category,
        i.is_active,
        COALESCE(
          json_agg(
            json_build_object(
              'id', r.id,
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
      WHERE 
        LOWER(i.name) LIKE LOWER($1)
        OR LOWER(i.category) LIKE LOWER($1)
      GROUP BY i.id
      ORDER BY i.name ASC
      `,
      [`%${search.trim()}%`]
    );

    res.json({
      status: 'success',
      data: result.rows,
    });
  } catch (error) {
    res.status(500).json({
      status: 'error',
      message: error.message,
    });
  }
};