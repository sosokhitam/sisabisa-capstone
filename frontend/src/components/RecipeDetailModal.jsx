import { useState } from 'react';
import toast from 'react-hot-toast';
import { motion } from 'framer-motion';
import {
  X,
  Clock,
  BarChart3,
  HeartPulse,
  Flame,
  Dumbbell,
  Wheat,
  Droplets,
  Leaf,
  ChefHat,
  Bookmark,
  LoaderCircle,
} from 'lucide-react';
import api from '../api/axios';

export default function RecipeDetailModal({ recipe, onClose }) {
  const [saving, setSaving] = useState(false);

  if (!recipe) return null;

  const steps = recipe.langkah_memasak || [];
  const nutrition = recipe.nutrisi || {};

  const cleanStepText = (step, index) => {
    return step.replace(new RegExp(`^${index + 1}\\.\\s*`), '');
  };

  const handleSaveRecipe = async () => {
    try {
      setSaving(true);

      await api.post('/favorites', {
        recipe_name: recipe.nama_menu,
        ingredients: recipe.bahan_resep,
        cooking_steps: steps,
        nutrition,
        cooking_time: recipe.waktu_masak,
        difficulty: recipe.tingkat_kesulitan,
        health_insight: recipe.insight_kesehatan,
      });

      toast.success('Resep berhasil disimpan');
    } catch (error) {
      toast.error(
        error.response?.data?.message || 'Gagal menyimpan resep'
      );
    } finally {
      setSaving(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="fixed inset-0 z-50 bg-black/50 flex items-end md:items-center justify-center md:px-4"
    >
      <motion.div
        initial={{ opacity: 0, y: 40, scale: 0.96 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.25 }}
        className="relative w-full md:max-w-4xl max-h-[92vh] md:max-h-[90vh] overflow-y-auto bg-white rounded-t-3xl md:rounded-3xl shadow-xl"
      >
        <div className="sticky top-0 z-10 bg-white border-b px-4 md:px-6 py-4 flex justify-between items-start rounded-t-3xl">
          <div className="pr-4">
            <p className="text-green-700 font-semibold flex items-center gap-2 text-sm">
              <ChefHat size={18} />
              Detail Resep AI
            </p>

            <h2 className="text-xl md:text-3xl font-bold mt-2 leading-tight">
              {recipe.nama_menu}
            </h2>
          </div>

          <button
            onClick={onClose}
            className="bg-slate-100 hover:bg-slate-200 rounded-full p-2 shrink-0"
          >
            <X size={20} />
          </button>
        </div>

        <div className="p-4 md:p-6 space-y-5 pb-28 md:pb-6">
          <section className="bg-green-50 border border-green-100 rounded-2xl md:rounded-3xl p-4 md:p-5">
            <h3 className="font-bold mb-2">Bahan yang Digunakan</h3>
            <p className="text-slate-700 leading-relaxed text-sm md:text-base">
              {recipe.bahan_resep}
            </p>
          </section>

          <section className="grid grid-cols-1 sm:grid-cols-2 gap-3 md:gap-4">
            <InfoCard
              icon={Clock}
              title="Waktu Masak"
              value={recipe.waktu_masak || '-'}
              color="bg-green-100 text-green-700"
            />

            <InfoCard
              icon={BarChart3}
              title="Tingkat Kesulitan"
              value={recipe.tingkat_kesulitan || '-'}
              color="bg-blue-100 text-blue-700"
            />
          </section>

          <section>
            <h3 className="font-bold text-lg md:text-xl mb-4">
              Langkah Memasak
            </h3>

            {steps.length > 0 ? (
              <div className="space-y-3">
                {steps.map((step, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, x: -12 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.2, delay: index * 0.05 }}
                    className="border border-slate-200 rounded-2xl p-4 bg-white flex gap-3 md:gap-4"
                  >
                    <div className="bg-green-600 text-white w-8 h-8 rounded-full flex items-center justify-center font-bold shrink-0 text-sm">
                      {index + 1}
                    </div>

                    <p className="text-slate-700 leading-relaxed text-sm md:text-base">
                      {cleanStepText(step, index)}
                    </p>
                  </motion.div>
                ))}
              </div>
            ) : (
              <div className="bg-slate-100 rounded-xl p-4">
                <p className="text-slate-500">
                  Langkah memasak belum tersedia.
                </p>
              </div>
            )}
          </section>

          <section>
            <h3 className="font-bold text-lg md:text-xl mb-4">
              Informasi Nutrisi
            </h3>

            <div className="grid grid-cols-2 lg:grid-cols-5 gap-3 md:gap-4">
              <NutritionCard icon={Flame} title="Kalori" value={nutrition.kalori} color="bg-red-100 text-red-700" />
              <NutritionCard icon={Dumbbell} title="Protein" value={nutrition.protein} color="bg-blue-100 text-blue-700" />
              <NutritionCard icon={Droplets} title="Lemak" value={nutrition.lemak} color="bg-yellow-100 text-yellow-700" />
              <NutritionCard icon={Wheat} title="Karbohidrat" value={nutrition.karbohidrat} color="bg-orange-100 text-orange-700" />
              <NutritionCard icon={Leaf} title="Serat" value={nutrition.serat} color="bg-green-100 text-green-700" />
            </div>
          </section>

          <section className="bg-blue-50 border border-blue-100 rounded-2xl md:rounded-3xl p-4 md:p-5">
            <div className="flex items-start gap-3">
              <div className="bg-blue-100 text-blue-700 p-3 rounded-2xl shrink-0">
                <HeartPulse size={22} />
              </div>

              <div>
                <h3 className="font-bold text-blue-900">
                  Insight Kesehatan
                </h3>

                <p className="text-slate-700 mt-1 leading-relaxed text-sm md:text-base">
                  {recipe.insight_kesehatan ||
                    'Insight kesehatan belum tersedia untuk resep ini.'}
                </p>
              </div>
            </div>
          </section>
        </div>

        <div className="md:hidden fixed bottom-0 left-0 right-0 z-20 bg-white border-t p-4 grid grid-cols-2 gap-3">
          <button
            onClick={onClose}
            className="w-full border border-green-700/30 hover:bg-green-50 text-green-800 py-3 rounded-2xl font-semibold transition duration-200"
          >
            Selesai
          </button>

          <button
            onClick={handleSaveRecipe}
            disabled={saving}
            className="w-full bg-orange-500 hover:bg-orange-600 disabled:bg-slate-400 text-white py-3 rounded-2xl font-semibold inline-flex items-center justify-center gap-2 transition duration-200 shadow-md shadow-orange-500/10"
          >
            {saving ? (
              <LoaderCircle size={18} className="animate-spin" />
            ) : (
              <Bookmark size={18} />
            )}
            Simpan
          </button>
        </div>

        <div className="hidden md:grid grid-cols-2 gap-3 px-6 pb-6">
          <button
            onClick={onClose}
            className="w-full border border-green-700/30 hover:bg-green-50 text-green-800 py-3 rounded-2xl font-semibold transition duration-200"
          >
            Selesai
          </button>

          <button
            onClick={handleSaveRecipe}
            disabled={saving}
            className="w-full bg-orange-500 hover:bg-orange-600 disabled:bg-slate-400 text-white py-3 rounded-2xl font-semibold inline-flex items-center justify-center gap-2 transition duration-200 shadow-md shadow-orange-500/10"
          >
            {saving ? (
              <LoaderCircle size={18} className="animate-spin" />
            ) : (
              <Bookmark size={18} />
            )}
            Simpan Resep
          </button>
        </div>
      </motion.div>
    </motion.div>
  );
}

function InfoCard({ icon: Icon, title, value, color }) {
  return (
    <div className="bg-yellow-50/40 border border-yellow-100/50 rounded-2xl p-4 md:p-5 flex items-center gap-4">
      <div className={`${color} p-3 rounded-2xl shrink-0`}>
        <Icon size={22} />
      </div>

      <div>
        <p className="text-slate-500 text-sm">{title}</p>
        <h4 className="font-bold text-base md:text-lg text-green-900">{value}</h4>
      </div>
    </div>
  );
}

function NutritionCard({ icon: Icon, title, value, color }) {
  return (
    <div className="bg-yellow-50/40 border border-yellow-100/50 rounded-2xl p-4">
      <div
        className={`${color} w-10 h-10 rounded-xl flex items-center justify-center`}
      >
        <Icon size={20} />
      </div>

      <p className="text-slate-500 text-xs md:text-sm mt-3">{title}</p>

      <h4 className="text-base md:text-lg font-bold mt-1 break-words text-green-900">
        {value || '-'}
      </h4>
    </div>
  );
}