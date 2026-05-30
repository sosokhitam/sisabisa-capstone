import pool from '../config/db.js';

export const saveFavoriteRecipe = async (req, res) => {
  try {
    const userId = req.user.id;

    const {
      recipe_name,
      ingredients,
      cooking_steps,
      nutrition,
      cooking_time,
      difficulty,
      health_insight,
    } = req.body;

    if (!recipe_name || !ingredients) {
      return res.status(400).json({
        message: 'recipe_name dan ingredients wajib diisi',
      });
    }

    const existingRecipe = await pool.query(
      `
      SELECT id
      FROM favorite_recipes
      WHERE user_id = $1
      AND LOWER(recipe_name) = LOWER($2)
      LIMIT 1
      `,
      [userId, recipe_name]
    );

    if (existingRecipe.rowCount > 0) {
      return res.status(409).json({
        message: 'Resep ini sudah ada di favorit',
      });
    }

    const result = await pool.query(
      `
      INSERT INTO favorite_recipes (
        user_id,
        recipe_name,
        ingredients,
        cooking_steps,
        nutrition,
        cooking_time,
        difficulty,
        health_insight
      )
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
      RETURNING *
      `,
      [
        userId,
        recipe_name,
        ingredients,
        JSON.stringify(cooking_steps || []),
        JSON.stringify(nutrition || {}),
        cooking_time || null,
        difficulty || null,
        health_insight || null,
      ]
    );

    return res.status(201).json({
      message: 'Resep berhasil disimpan',
      data: result.rows[0],
    });
  } catch (error) {
    return res.status(500).json({
      message: error.message,
    });
  }
};

export const getFavoriteRecipes = async (req, res) => {
  try {
    const userId = req.user.id;

    const result = await pool.query(
      `
      SELECT *
      FROM favorite_recipes
      WHERE user_id = $1
      ORDER BY created_at DESC
      `,
      [userId]
    );

    return res.json({
      message: 'Favorite recipes berhasil diambil',
      data: result.rows,
    });
  } catch (error) {
    return res.status(500).json({
      message: error.message,
    });
  }
};

export const deleteFavoriteRecipe = async (req, res) => {
  try {
    const userId = req.user.id;
    const { id } = req.params;

    const result = await pool.query(
      `
      DELETE FROM favorite_recipes
      WHERE id = $1 AND user_id = $2
      RETURNING *
      `,
      [id, userId]
    );

    if (result.rowCount === 0) {
      return res.status(404).json({
        message: 'Favorite recipe tidak ditemukan',
      });
    }

    return res.json({
      message: 'Favorite recipe berhasil dihapus',
    });
  } catch (error) {
    return res.status(500).json({
      message: error.message,
    });
  }
};