import { motion } from 'framer-motion';
import { useState, useCallback } from 'react';
import {
  Bot,
  ChefHat,
  Clock,
  Sparkles,
  Search,
  AlertTriangle,
  Utensils,
  Wand2,
  ClipboardList,
  LoaderCircle,
  RefreshCcw,
  ArrowRight,
} from 'lucide-react';
import api from '../../api/axios';
import UserLayout from '../../layouts/UserLayout';
import RecipeDetailModal from '../../components/RecipeDetailModal';

export default function Recommendations() {
  const [mode, setMode]                 = useState('auto');
  const [recipes, setRecipes]           = useState([]);
  const [expiringItems, setExpiringItems] = useState([]);
  const [selectedRecipe, setSelectedRecipe] = useState(null);

  const [manualForm, setManualForm] = useState({
    bahan_user: '', bahan_mau_basi: '',
  });

  const [loading, setLoading]             = useState(false);
  const [detailLoading, setDetailLoading] = useState(false);
  const [message, setMessage]             = useState('');

  const getMatchLabel = (score) => {
    const n = parseInt(score);
    if (n >= 80) return { label: 'Sangat Cocok', color: 'bg-green-100 text-green-800 border border-green-200/60' };
    if (n >= 50) return { label: 'Cocok',        color: 'bg-yellow-100 text-yellow-800 border border-yellow-200/60' };
    return              { label: 'Relevan',       color: 'bg-blue-100 text-blue-700 border border-blue-200/60' };
  };

  const fetchExpiringItems = useCallback(async () => {
    try {
      const response = await api.get('/inventory');
      const items    = response.data.data || [];
      const today    = new Date();
      today.setHours(0, 0, 0, 0);

      const filtered = items
        .map((item) => {
          const expiredDate = new Date(item.expired_at);
          expiredDate.setHours(0, 0, 0, 0);
          const diffDays = Math.ceil((expiredDate - today) / (1000 * 60 * 60 * 24));
          return { ...item, diffDays };
        })
        .filter((item) => item.diffDays >= 0 && item.diffDays <= 3);

      setExpiringItems(filtered);
    } catch {
      console.log('Gagal mengambil bahan hampir expired');
    }
  }, []);

  const fetchAutoRecommendations = useCallback(async () => {
    try {
      setLoading(true); setMessage(''); setRecipes([]);
      await fetchExpiringItems();
      const response = await api.get('/recommendations');
      setRecipes(response.data.data.results || []);
    } catch (error) {
      setMessage(error.response?.data?.message || 'AI sedang disiapkan. Silakan coba lagi beberapa saat.');
    } finally {
      setLoading(false);
    }
  }, [fetchExpiringItems]);

  const handleManualRecommendation = async (e) => {
    e?.preventDefault();
    setMessage(''); setRecipes([]);
    if (!manualForm.bahan_user.trim() || !manualForm.bahan_mau_basi.trim()) {
      setMessage('Isi daftar bahan dan bahan utama terlebih dahulu.');
      return;
    }
    try {
      setLoading(true);
      const response = await api.post('/recommendations/manual', {
        bahan_user: manualForm.bahan_user,
        bahan_mau_basi: manualForm.bahan_mau_basi,
      });
      setRecipes(response.data.data.results || []);
    } catch (error) {
      setMessage(error.response?.data?.message || 'AI sedang disiapkan. Silakan coba lagi beberapa saat.');
    } finally {
      setLoading(false);
    }
  };

  const handleRetry = () => {
    if (mode === 'auto') fetchAutoRecommendations();
    else handleManualRecommendation();
  };

  const handleManualChange = (e) => setManualForm({ ...manualForm, [e.target.name]: e.target.value });

  const handleModeChange = (selectedMode) => {
    setMode(selectedMode); setMessage(''); setRecipes([]); setExpiringItems([]); setSelectedRecipe(null);
  };

  const handleRecipeDetail = async (recipe) => {
    try {
      setDetailLoading(true); setMessage('');
      const response = await api.post('/recommendations/detail', {
        nama_menu: recipe.nama_menu, bahan_resep: recipe.bahan_resep,
      });
      setSelectedRecipe(response.data.data);
    } catch (error) {
      setMessage(error.response?.data?.message || 'Gagal mengambil detail resep.');
    } finally {
      setDetailLoading(false);
    }
  };

  const useExample = () => {
    setManualForm({ bahan_user: 'telur ayam, bawang merah, cabai, nasi, garam', bahan_mau_basi: 'telur ayam' });
  };

  const inputCls = 'w-full border border-slate-200 rounded-2xl px-4 py-3 outline-none focus:border-green-600 focus:ring-2 focus:ring-green-500/15 transition-all duration-200 bg-white text-sm placeholder:text-slate-400';

  return (
    <UserLayout>
      <div className="space-y-5 md:space-y-6">

        {/* ── Header banner ── */}
        <section className="relative overflow-hidden bg-gradient-to-br from-[#4A7C2F] via-[#3e6827] to-[#2d4e1c] rounded-[2rem] shadow-lg shadow-green-900/10 p-6 md:p-8 text-white">
          <div className="absolute -right-16 -top-16 w-56 h-56 rounded-full bg-white/7" />
          <div className="absolute -bottom-20 right-12 w-64 h-64 rounded-full bg-lime-400/10" />
          <div className="relative">
            <div className="inline-flex items-center gap-1.5 bg-white/15 border border-white/20 rounded-full px-3 py-1 text-xs font-bold mb-3">
              <Sparkles size={12} className="animate-pulse" />
              AI Recipe Assistant
            </div>
            <h1 className="text-2xl md:text-4xl font-black mt-1 leading-tight tracking-tight">
              Cari Resep dari Bahan yang Kamu Punya
            </h1>
            <p className="text-green-100/80 mt-3 text-sm md:text-base max-w-2xl leading-relaxed font-medium">
              Pilih bahan hampir expired dari inventory atau masukkan bahan sendiri. AI akan membantu memberi ide resep yang mudah diikuti.
            </p>
          </div>
        </section>

        {/* ── Mode switcher ── */}
        <div className="bg-white rounded-3xl border border-slate-100 p-2 flex gap-2 shadow-sm">
          {[
            { mode: 'auto',   icon: Bot,    label: 'Dari Inventory'     },
            { mode: 'manual', icon: Search, label: 'Input Bahan Sendiri' },
          ].map(({ mode: m, icon: Icon, label }) => (
            <button
              key={m}
              onClick={() => handleModeChange(m)}
                className={`flex-1 py-3 md:py-4 rounded-2xl font-bold transition-all duration-200 flex flex-col sm:flex-row items-center justify-center gap-1 sm:gap-2 cursor-pointer text-sm ${
                mode === m
                  ? 'bg-gradient-to-r from-green-700 to-green-600 text-white shadow-md shadow-green-700/15'
                  : 'text-slate-500 hover:text-green-700 hover:bg-green-50/60'
              }`}
            >
              <Icon size={18} className={`flex-shrink-0 ${m === 'manual' ? 'translate-x-[0.5px] translate-y-[0.5px]' : ''}`} />
              <span className="leading-tight text-center">{label}</span>
            </button>
          ))}
        </div>

        {mode === 'auto' ? (
          <div className="grid lg:grid-cols-3 gap-5 md:gap-6">
            {/* Sidebar */}
            <aside className="lg:col-span-1 space-y-5">
              {/* Auto panel */}
              <div className="bg-white rounded-3xl border border-slate-100/80 p-5 md:p-6 shadow-sm">
                <div className="bg-gradient-to-br from-green-700 to-green-600 text-white w-12 h-12 rounded-2xl flex items-center justify-center shadow-md shadow-green-700/20">
                  <Bot size={22} />
                </div>
                <h2 className="font-bold text-lg mt-4 text-green-950 tracking-tight">Rekomendasi Otomatis</h2>
                <p className="text-slate-500 text-sm mt-2 leading-relaxed">
                  Cocok saat kamu ingin memakai bahan yang mendekati expired tanpa perlu mengetik manual.
                </p>

                <div className="mt-5 space-y-3">
                  {['Sistem membaca inventory kamu.', 'AI mencari resep dari bahan prioritas.'].map((step, i) => (
                    <div key={i} className="flex gap-3 items-start">
                      <span className="bg-green-100 text-green-800 w-7 h-7 rounded-full flex items-center justify-center font-black text-xs flex-shrink-0">
                        {i + 1}
                      </span>
                      <span className="text-sm text-slate-600 font-medium pt-0.5">{step}</span>
                    </div>
                  ))}
                </div>

                <button
                  onClick={fetchAutoRecommendations}
                  disabled={loading}
                  className="mt-6 w-full bg-[#FFA02E] hover:bg-[#e08316] text-white py-3.5 rounded-2xl font-bold disabled:bg-slate-300 disabled:cursor-not-allowed inline-flex items-center justify-center gap-2 transition-all duration-200 shadow-md shadow-orange-400/20 hover:-translate-y-0.5 cursor-pointer"
                >
                  {loading && <LoaderCircle size={17} className="animate-spin" />}
                  {loading ? 'AI sedang mencari...' : 'Cari Rekomendasi'}
                </button>
              </div>

              {/* Expiring items */}
              {expiringItems.length > 0 && (
                <div className="bg-orange-50/80 border border-orange-200/50 rounded-3xl p-5 shadow-sm">
                  <div className="flex items-center gap-2 text-orange-700 font-bold mb-3">
                    <AlertTriangle size={18} className="animate-pulse" />
                    Bahan Prioritas
                  </div>
                  <p className="text-xs text-orange-900/80 font-semibold mb-3">Bahan ini diprioritaskan oleh AI.</p>
                  <div className="space-y-2">
                    {expiringItems.map((item) => (
                      <div key={item.id} className="bg-white border border-orange-100/60 rounded-2xl px-4 py-3 shadow-sm">
                        <p className="font-bold text-green-950 capitalize text-sm">{item.ingredient_name}</p>
                        <p className="text-xs text-slate-500 mt-0.5 font-semibold">
                          {item.diffDays === 0 ? 'Expired hari ini' : `${item.diffDays} hari lagi`}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </aside>

            {/* Results */}
            <main className="lg:col-span-2">
              <RecommendationResult
                recipes={recipes} loading={loading} message={message}
                detailLoading={detailLoading} getMatchLabel={getMatchLabel}
                onDetail={handleRecipeDetail} onRetry={handleRetry}
              />
            </main>
          </div>
        ) : (
          <div className="grid lg:grid-cols-3 gap-5 md:gap-6">
            {/* Manual form sidebar */}
            <aside className="lg:col-span-1">
              <div className="bg-white rounded-3xl border border-slate-100/80 p-5 md:p-6 shadow-sm">
                <div className="bg-gradient-to-br from-yellow-400 to-yellow-300 text-white w-12 h-12 rounded-2xl flex items-center justify-center shadow-md shadow-yellow-400/20">
                  <Search size={22} className="text-yellow-900 translate-x-[1px] translate-y-[1px]" />
                </div>
                <h2 className="font-bold text-lg mt-4 text-green-950 tracking-tight">Input Bahan Sendiri</h2>
                <p className="text-slate-500 text-sm mt-2 leading-relaxed">
                  Masukkan bahan yang tersedia di rumah. Gunakan tanda koma agar AI lebih mudah membacanya.
                </p>

                <button
                  type="button"
                  onClick={useExample}
                  className="mt-4 text-xs bg-yellow-100/60 hover:bg-yellow-100 text-green-800 px-4 py-2 rounded-xl font-bold transition-all duration-200 border border-yellow-200/50 cursor-pointer"
                >
                  ✨ Gunakan contoh
                </button>

                <form onSubmit={handleManualRecommendation} className="mt-5 space-y-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-600 mb-1.5 uppercase tracking-wider">
                      Bahan yang Dimiliki
                    </label>
                    <textarea
                      name="bahan_user"
                      value={manualForm.bahan_user}
                      onChange={handleManualChange}
                      placeholder="Contoh: telur ayam, bawang merah, cabai, nasi, garam"
                      className={`${inputCls} min-h-28 resize-none`}
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-600 mb-1.5 uppercase tracking-wider">
                      Bahan Utama / Prioritas
                    </label>
                    <input
                      name="bahan_mau_basi"
                      value={manualForm.bahan_mau_basi}
                      onChange={handleManualChange}
                      placeholder="Contoh: telur ayam"
                      className={inputCls}
                      required
                    />
                    <p className="text-xs text-slate-400 mt-1.5 font-medium">Pilih bahan yang paling ingin digunakan.</p>
                  </div>

                  <button
                    disabled={loading}
                    className="w-full bg-[#FFA02E] hover:bg-[#e08316] disabled:bg-slate-300 disabled:cursor-not-allowed text-white py-3.5 rounded-2xl font-bold transition-all duration-200 inline-flex items-center justify-center gap-2 shadow-md shadow-orange-400/20 hover:-translate-y-0.5 cursor-pointer"
                  >
                    {loading && <LoaderCircle size={17} className="animate-spin" />}
                    {loading ? 'AI sedang mencari...' : 'Cari Resep'}
                  </button>
                </form>
              </div>
            </aside>

            <main className="lg:col-span-2">
              <RecommendationResult
                recipes={recipes} loading={loading} message={message}
                detailLoading={detailLoading} getMatchLabel={getMatchLabel}
                onDetail={handleRecipeDetail} onRetry={handleRetry}
              />
            </main>
          </div>
        )}

        {selectedRecipe && (
          <RecipeDetailModal recipe={selectedRecipe} onClose={() => setSelectedRecipe(null)} />
        )}
      </div>
    </UserLayout>
  );
}

/* ── Result Panel ──────────────────────────────── */
function RecommendationResult({ recipes, loading, message, detailLoading, getMatchLabel, onDetail, onRetry }) {
  if (loading) return <AiLoadingState />;

  if (message) {
    return (
      <div className="bg-red-50 border border-red-200/60 text-red-800 rounded-3xl p-6 shadow-sm">
        <p className="font-bold text-red-900">Rekomendasi belum bisa ditampilkan</p>
        <p className="text-sm mt-1.5 leading-relaxed font-medium text-red-700">{message}</p>
        <button
          onClick={onRetry}
          className="mt-4 inline-flex items-center gap-2 bg-red-500 hover:bg-red-600 text-white px-4 py-2.5 rounded-xl font-bold text-sm transition-all duration-200 cursor-pointer shadow-sm"
        >
          <RefreshCcw size={15} />
          Coba Lagi
        </button>
      </div>
    );
  }

  if (recipes.length === 0) {
    return (
      <div className="bg-white rounded-3xl border border-slate-100/80 p-10 text-center shadow-sm">
        <div className="mx-auto bg-slate-100 text-slate-400 w-16 h-16 rounded-3xl flex items-center justify-center mb-4">
          <Utensils size={26} />
        </div>
        <h2 className="font-bold text-lg text-slate-800">Belum ada rekomendasi</h2>
        <p className="text-slate-400 mt-2 max-w-sm mx-auto text-sm leading-relaxed">
          Pilih mode rekomendasi, lalu klik tombol pencarian. Hasil resep akan muncul di sini.
        </p>
      </div>
    );
  }

  return (
    <div>
      <div className="flex items-center gap-3 mb-5">
        <div className="bg-green-100 text-green-700 p-2.5 rounded-2xl shadow-sm">
          <ClipboardList size={19} />
        </div>
        <div>
          <h2 className="font-bold text-lg text-green-950 tracking-tight">Hasil Rekomendasi</h2>
          <p className="text-xs text-slate-400 font-semibold">Pilih resep untuk melihat langkah memasaknya.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {recipes.map((recipe, index) => {
          const match = getMatchLabel(recipe.persentase_kecocokan);
          return (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.25, delay: index * 0.08 }}
              whileHover={{ y: -4 }}
              className="group bg-white rounded-3xl border border-slate-100/80 p-5 md:p-6 hover:shadow-lg hover:shadow-green-700/5 hover:border-green-100/60 transition-all duration-300"
            >
              <div className="flex items-start gap-3 mb-4">
                <div className="bg-green-100 group-hover:bg-green-700 text-green-700 group-hover:text-white w-12 h-12 rounded-2xl flex items-center justify-center flex-shrink-0 shadow-sm transition-all duration-300">
                  <ChefHat size={22} />
                </div>
                <div className="flex-1 min-w-0">
                  <h2 className="font-bold text-[1.05rem] leading-tight text-green-950 tracking-tight">{recipe.nama_menu}</h2>
                  <div className="flex flex-wrap gap-2 mt-2">
                    <span className={`px-2.5 py-1 rounded-full text-xs font-bold ${match.color}`}>{match.label}</span>
                    <span className="bg-yellow-100/70 border border-yellow-200/50 text-slate-600 px-2.5 py-1 rounded-full text-xs font-semibold inline-flex items-center gap-1">
                      <Clock size={11} />
                      Mudah diikuti
                    </span>
                  </div>
                </div>
              </div>

              <p className="text-slate-500 text-sm leading-relaxed line-clamp-3 mb-4">{recipe.bahan_resep}</p>

              <button
                onClick={() => onDetail(recipe)}
                disabled={detailLoading}
                className="w-full bg-[#FFA02E] hover:bg-[#e08316] text-white py-3 rounded-2xl font-bold transition-all duration-200 shadow-md shadow-orange-400/15 hover:-translate-y-0.5 cursor-pointer disabled:bg-slate-300 disabled:cursor-not-allowed flex items-center justify-center gap-2 text-sm"
              >
                {detailLoading ? <LoaderCircle size={16} className="animate-spin" /> : <ArrowRight size={16} />}
                {detailLoading ? 'Memuat Detail...' : 'Lihat Cara Memasak'}
              </button>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}

/* ── AI Loading ────────────────────────────────── */
function AiLoadingState() {
  return (
    <div className="bg-white rounded-3xl border border-slate-100/80 p-6 md:p-8 shadow-sm">
      <div className="flex items-start gap-4 mb-6">
        <div className="bg-green-100 text-green-700 p-3 rounded-2xl flex-shrink-0 shadow-sm">
          <Wand2 size={22} className="animate-pulse" />
        </div>
        <div>
          <h2 className="font-bold text-lg text-slate-900">AI sedang menyusun resep...</h2>
          <p className="text-slate-500 mt-1 text-sm leading-relaxed">
            Sistem sedang mencocokkan bahan, menghitung kecocokan, dan menyiapkan rekomendasi terbaik.
          </p>
        </div>
      </div>

      <div className="bg-green-50 border border-green-100/60 rounded-2xl p-4 mb-6 flex items-center gap-3">
        <LoaderCircle size={17} className="animate-spin text-green-600 flex-shrink-0" />
        <div>
          <p className="text-sm text-green-700 font-semibold">Menganalisis bahan makanan...</p>
          <p className="text-xs text-slate-500 mt-0.5">Proses mungkin membutuhkan beberapa detik.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {[1, 2].map((n) => (
          <div key={n} className="border border-slate-100 rounded-3xl p-5 space-y-4">
            <div className="w-12 h-12 bg-slate-100 rounded-2xl animate-pulse" />
            <div className="h-5 bg-slate-100 rounded-xl w-3/4 animate-pulse" />
            <div className="space-y-2">
              <div className="h-3 bg-slate-100 rounded-full animate-pulse" />
              <div className="h-3 bg-slate-100 rounded-full w-4/5 animate-pulse" />
              <div className="h-3 bg-slate-100 rounded-full w-3/5 animate-pulse" />
            </div>
            <div className="h-11 bg-slate-100 rounded-2xl animate-pulse" />
          </div>
        ))}
      </div>
    </div>
  );
}