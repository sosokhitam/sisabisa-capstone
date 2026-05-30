import axios from 'axios';
import pool from '../config/db.js';

const AI_REQUEST_TIMEOUT = 20000;

const getAiErrorMessage = (error) => {
  if (error.response?.status === 503) {
    return {
      status: 503,
      message:
        'AI sedang tidak aktif atau loading. Silakan coba lagi dalam beberapa saat.',
    };
  }

  if (error.code === 'ECONNABORTED') {
    return {
      status: 504,
      message:
        'AI membutuhkan waktu terlalu lama untuk merespons. Silakan coba lagi.',
    };
  }

  return {
    status: 500,
    message:
      error.response?.data?.detail ||
      error.response?.data?.message ||
      error.message,
  };
};

const normalizeRecipeDetail = (aiData, fallbackMenu, fallbackIngredients) => {
  const detail = aiData.data || aiData.result || aiData.results || aiData;

  const nutrisi =
    detail.nutrisi ||
    detail.fakta_nutrisi ||
    detail.nutrition ||
    detail.nutrition_facts ||
    detail.nutritionFact ||
    {};

  return {
    nama_menu: detail.nama_menu || fallbackMenu,
    bahan_resep: detail.bahan_resep || fallbackIngredients,

    waktu_masak: detail.waktu_masak || '-',
    tingkat_kesulitan: detail.tingkat_kesulitan || '-',
    insight_kesehatan: detail.insight_kesehatan || '-',

    langkah_memasak:
      detail.langkah_memasak ||
      detail.langkah ||
      detail.steps ||
      detail.cara_memasak ||
      [],

    nutrisi: {
      kalori:
        nutrisi.kalori ||
        nutrisi.calories ||
        detail.kalori ||
        detail.calories ||
        '-',

      protein:
        nutrisi.protein ||
        detail.protein ||
        '-',

      lemak:
        nutrisi.lemak ||
        nutrisi.fat ||
        detail.lemak ||
        detail.fat ||
        '-',

      karbohidrat:
        nutrisi.karbohidrat ||
        nutrisi.carbohydrate ||
        nutrisi.carbs ||
        detail.karbohidrat ||
        detail.carbohydrate ||
        detail.carbs ||
        '-',

      serat:
        nutrisi.serat ||
        nutrisi.fiber ||
        detail.serat ||
        detail.fiber ||
        '-',
    },

    raw_response: aiData,
  };
};

export const getRecommendations = async (req, res) => {
  try {
    const userId = req.user.id;

    const inventoryResult = await pool.query(
      `
      SELECT ingredient_name, expired_at
      FROM user_inventory
      WHERE user_id = $1
      ORDER BY expired_at ASC
      `,
      [userId]
    );

    const items = inventoryResult.rows;

    if (items.length === 0) {
      return res.status(404).json({
        message: 'Inventory masih kosong',
      });
    }

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const bahanUser = items.map((item) => item.ingredient_name).join(', ');

    const bahanMauBasi = items
      .filter((item) => {
        const expiredDate = new Date(item.expired_at);
        expiredDate.setHours(0, 0, 0, 0);

        const diffDays = Math.ceil(
          (expiredDate - today) / (1000 * 60 * 60 * 24)
        );

        return diffDays >= 0 && diffDays <= 3;
      })
      .map((item) => item.ingredient_name)
      .join(', ');

    if (!bahanMauBasi) {
      return res.status(400).json({
        message: 'Belum ada bahan yang hampir expired',
      });
    }

    const aiResponse = await axios.post(
      `${process.env.AI_API_URL}/api/rekomendasi`,
      {
        bahan_user: bahanUser,
        bahan_mau_basi: bahanMauBasi,
      },
      {
        timeout: AI_REQUEST_TIMEOUT,
      }
    );

    return res.json({
      message: 'Rekomendasi resep berhasil diambil',
      data: aiResponse.data,
    });
  } catch (error) {
    const aiError = getAiErrorMessage(error);

    return res.status(aiError.status).json({
      message: aiError.message,
    });
  }
};

export const getManualRecommendations = async (req, res) => {
  try {
    const { bahan_user, bahan_mau_basi } = req.body;

    if (!bahan_user || !bahan_mau_basi) {
      return res.status(400).json({
        message: 'bahan_user dan bahan_mau_basi wajib diisi',
      });
    }

    const aiResponse = await axios.post(
      `${process.env.AI_API_URL}/api/rekomendasi`,
      {
        bahan_user,
        bahan_mau_basi,
      },
      {
        timeout: AI_REQUEST_TIMEOUT,
      }
    );

    return res.json({
      message: 'Rekomendasi manual berhasil diambil',
      data: aiResponse.data,
    });
  } catch (error) {
    const aiError = getAiErrorMessage(error);

    return res.status(aiError.status).json({
      message: aiError.message,
    });
  }
};

export const getRecipeDetail = async (req, res) => {
  try {
    const { nama_menu, bahan_resep } = req.body;

    if (!nama_menu || !bahan_resep) {
      return res.status(400).json({
        message: 'nama_menu dan bahan_resep wajib diisi',
      });
    }

    const aiResponse = await axios.post(
      `${process.env.AI_API_URL}/api/detail-resep`,
      {
        nama_menu,
        bahan_resep,
      },
      {
        timeout: AI_REQUEST_TIMEOUT,
      }
    );

    const normalizedDetail = normalizeRecipeDetail(
      aiResponse.data,
      nama_menu,
      bahan_resep
    );

    return res.json({
      message: 'Detail resep berhasil diambil',
      data: normalizedDetail,
    });
  } catch (error) {
    const aiError = getAiErrorMessage(error);

    return res.status(aiError.status).json({
      message: aiError.message,
    });
  }
};