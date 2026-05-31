import pool from '../config/db.js';

export const getInventory = async (req, res) => {
  try {
    const result = await pool.query(
      `
      SELECT 
        ui.id,
        ui.user_id,
        ui.ingredient_id,
        COALESCE(i.name, ui.ingredient_name) AS ingredient_name,
        COALESCE(i.category, '-') AS category,
        ui.quantity,
        ui.unit,
        ui.storage,
        ui.expired_at,
        ui.created_at,
        ui.updated_at
      FROM user_inventory ui
      LEFT JOIN ingredients i
        ON i.id = ui.ingredient_id
      WHERE ui.user_id = $1
      ORDER BY ui.expired_at ASC
      `,
      [req.user.id]
    );

    res.json({
      message: 'Berhasil mengambil inventory',
      data: result.rows,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const createInventory = async (req, res) => {
  try {
    const {
      ingredient_id,
      storage,
      quantity = 1,
      unit,
      purchase_date,
      ingredient_name,
      expired_at,
    } = req.body;

    // Mode baru: pakai ingredient_id + storage + purchase_date
    if (ingredient_id && storage && purchase_date) {
      const ruleResult = await pool.query(
        `
        SELECT 
          i.id,
          i.name,
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

      if (ruleResult.rows.length === 0) {
        return res.status(404).json({
          message: 'Bahan atau aturan penyimpanan tidak ditemukan',
        });
      }

      const ingredient = ruleResult.rows[0];
      const purchaseDate = new Date(purchase_date);
      const expiredDate = new Date(purchaseDate);

      expiredDate.setDate(expiredDate.getDate() + Number(ingredient.days));

      const calculatedExpiredAt = expiredDate.toISOString().split('T')[0];

      const result = await pool.query(
        `
        INSERT INTO user_inventory
        (
          user_id,
          ingredient_id,
          ingredient_name,
          quantity,
          unit,
          storage,
          expired_at
        )
        VALUES ($1, $2, $3, $4, $5, $6, $7)
        RETURNING *
        `,
        [
          req.user.id,
          ingredient.id,
          ingredient.name,
          quantity,
          unit,
          ingredient.storage,
          calculatedExpiredAt,
        ]
      );

      return res.status(201).json({
        message: 'Inventory berhasil ditambahkan',
        data: result.rows[0],
      });
    }

    // Mode lama: fallback agar fitur lama tidak langsung rusak
    if (ingredient_name && expired_at) {
      const result = await pool.query(
        `
        INSERT INTO user_inventory
        (
          user_id,
          ingredient_name,
          quantity,
          unit,
          expired_at
        )
        VALUES ($1, $2, $3, $4, $5)
        RETURNING *
        `,
        [req.user.id, ingredient_name, quantity, unit, expired_at]
      );

      return res.status(201).json({
        message: 'Inventory berhasil ditambahkan',
        data: result.rows[0],
      });
    }

    return res.status(400).json({
      message:
        'Data tidak lengkap. Gunakan ingredient_id, storage, dan purchase_date',
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const updateInventory = async (req, res) => {
  try {
    const { id } = req.params;
    const {
      ingredient_id,
      storage,
      quantity,
      unit,
      purchase_date,
      ingredient_name,
      expired_at,
    } = req.body;

    // Mode baru: update dengan ingredient_id + storage + purchase_date
    if (ingredient_id && storage && purchase_date) {
      const ruleResult = await pool.query(
        `
        SELECT 
          i.id,
          i.name,
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

      if (ruleResult.rows.length === 0) {
        return res.status(404).json({
          message: 'Bahan atau aturan penyimpanan tidak ditemukan',
        });
      }

      const ingredient = ruleResult.rows[0];
      const purchaseDate = new Date(purchase_date);
      const expiredDate = new Date(purchaseDate);

      expiredDate.setDate(expiredDate.getDate() + Number(ingredient.days));

      const calculatedExpiredAt = expiredDate.toISOString().split('T')[0];

      const result = await pool.query(
        `
        UPDATE user_inventory
        SET 
          ingredient_id = $1,
          ingredient_name = $2,
          quantity = $3,
          unit = $4,
          storage = $5,
          expired_at = $6,
          updated_at = CURRENT_TIMESTAMP
        WHERE id = $7 AND user_id = $8
        RETURNING *
        `,
        [
          ingredient.id,
          ingredient.name,
          quantity,
          unit,
          ingredient.storage,
          calculatedExpiredAt,
          id,
          req.user.id,
        ]
      );

      if (result.rows.length === 0) {
        return res.status(404).json({
          message: 'Inventory tidak ditemukan',
        });
      }

      return res.json({
        message: 'Inventory berhasil diperbarui',
        data: result.rows[0],
      });
    }

    // Mode lama: fallback
    const result = await pool.query(
      `
      UPDATE user_inventory
      SET 
        ingredient_name = COALESCE($1, ingredient_name),
        quantity = COALESCE($2, quantity),
        unit = COALESCE($3, unit),
        expired_at = COALESCE($4, expired_at),
        updated_at = CURRENT_TIMESTAMP
      WHERE id = $5 AND user_id = $6
      RETURNING *
      `,
      [ingredient_name, quantity, unit, expired_at, id, req.user.id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        message: 'Inventory tidak ditemukan',
      });
    }

    res.json({
      message: 'Inventory berhasil diperbarui',
      data: result.rows[0],
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const deleteInventory = async (req, res) => {
  try {
    const { id } = req.params;

    const result = await pool.query(
      `
      DELETE FROM user_inventory
      WHERE id = $1 AND user_id = $2
      RETURNING *
      `,
      [id, req.user.id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        message: 'Inventory tidak ditemukan',
      });
    }

    res.json({
      message: 'Inventory berhasil dihapus',
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const updateInventoryStorage = async (req, res) => {
  try {
    const { id } = req.params;
    const { storage, purchase_date, quantity, unit } = req.body;

    if (!storage) {
      return res.status(400).json({
        message: 'Storage wajib diisi',
      });
    }

    const inventoryResult = await pool.query(
      `
      SELECT *
      FROM user_inventory
      WHERE id = $1 AND user_id = $2
      LIMIT 1
      `,
      [id, req.user.id]
    );

    if (inventoryResult.rows.length === 0) {
      return res.status(404).json({
        message: 'Inventory tidak ditemukan',
      });
    }

    const inventory = inventoryResult.rows[0];

    if (!inventory.ingredient_id) {
      return res.status(400).json({
        message: 'Inventory lama belum memiliki ingredient_id',
      });
    }

    const usedPurchaseDate =
      purchase_date || inventory.purchase_date;

    if (!usedPurchaseDate) {
      return res.status(400).json({
        message: 'Tanggal beli dibutuhkan untuk menghitung ulang expired',
      });
    }

    const ruleResult = await pool.query(
      `
      SELECT 
        storage,
        days
      FROM ingredient_storage_rules
      WHERE ingredient_id = $1
        AND LOWER(storage) = LOWER($2)
      LIMIT 1
      `,
      [inventory.ingredient_id, storage.trim()]
    );

    if (ruleResult.rows.length === 0) {
      return res.status(404).json({
        message: 'Aturan penyimpanan tidak ditemukan',
      });
    }

    const rule = ruleResult.rows[0];

    const purchaseDate = new Date(usedPurchaseDate);
    const expiredDate = new Date(purchaseDate);

    expiredDate.setDate(expiredDate.getDate() + Number(rule.days));

    const calculatedExpiredAt = expiredDate.toISOString().split('T')[0];

    const finalQuantity =
      quantity !== undefined && quantity !== null && quantity !== ''
        ? quantity
        : inventory.quantity;

    const finalUnit =
      unit !== undefined && unit !== null
        ? unit
        : inventory.unit;

    const result = await pool.query(
      `
      UPDATE user_inventory
      SET 
        storage = $1,
        purchase_date = $2,
        expired_at = $3,
        quantity = $4,
        unit = $5,
        updated_at = CURRENT_TIMESTAMP
      WHERE id = $6 AND user_id = $7
      RETURNING *
      `,
      [
        rule.storage,
        usedPurchaseDate,
        calculatedExpiredAt,
        finalQuantity,
        finalUnit,
        id,
        req.user.id,
      ]
    );

    res.json({
      message: 'Inventory berhasil diperbarui',
      data: result.rows[0],
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};