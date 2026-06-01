import { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import { motion } from 'framer-motion';
import {
  Bookmark,
  Trash2,
  Clock,
  BarChart3,
  ChefHat,
  HeartPulse,
  Package,
  Eye,
  Search,
  Sparkles,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';
import api from '../../api/axios';
import UserLayout from '../../layouts/UserLayout';
import DeleteConfirmModal from '../../components/DeleteConfirmModal';
import RecipeDetailModal from '../../components/RecipeDetailModal';

export default function FavoriteRecipes() {
  const [favorites, setFavorites]             = useState([]);
  const [deleteTarget, setDeleteTarget]       = useState(null);
  const [selectedRecipe, setSelectedRecipe]   = useState(null);
  const [search, setSearch]                   = useState('');
  const [difficultyFilter, setDifficultyFilter] = useState('all');

  const fetchFavorites = async () => {
    const response = await api.get('/favorites');
    return response.data.data || [];
  };

  useEffect(() => {
    let ignore = false;
    const loadFavorites = async () => {
      try {
        const data = await fetchFavorites();
        if (!ignore) setFavorites(data);
      } catch {
        toast.error('Gagal memuat resep favorit');
      }
    };
    loadFavorites();
    return () => { ignore = true; };
  }, []);

  const filteredFavorites = favorites.filter((recipe) => {
    const keyword      = search.toLowerCase();
    const matchesSearch =
      recipe.recipe_name?.toLowerCase().includes(keyword) ||
      recipe.ingredients?.toLowerCase().includes(keyword);
    const matchesDifficulty =
      difficultyFilter === 'all' || recipe.difficulty?.toLowerCase() === difficultyFilter;
    return matchesSearch && matchesDifficulty;
  });

  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 4;

  useEffect(() => {
    setCurrentPage(1);
  }, [search, difficultyFilter]);

  const totalPages = Math.ceil(filteredFavorites.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedFavorites = filteredFavorites.slice(startIndex, startIndex + itemsPerPage);

  const mapFavoriteToRecipe = (recipe) => ({
    id:                recipe.id,
    nama_menu:         recipe.recipe_name,
    bahan_resep:       recipe.ingredients,
    langkah_memasak:   recipe.cooking_steps || [],
    nutrisi:           recipe.nutrition || {},
    waktu_masak:       recipe.cooking_time,
    tingkat_kesulitan: recipe.difficulty,
    insight_kesehatan: recipe.health_insight,
  });

  const handleOpenDetail = (recipe) => setSelectedRecipe(mapFavoriteToRecipe(recipe));

  const handleDelete = async () => {
    if (!deleteTarget) return;
    try {
      await api.delete(`/favorites/${deleteTarget.id}`);
      toast.success('Resep favorit berhasil dihapus');
      const data = await fetchFavorites();
      setFavorites(data);
      setDeleteTarget(null);
    } catch {
      toast.error('Gagal menghapus resep favorit');
    }
  };

  const difficulties = ['all', 'mudah', 'sedang', 'sulit'];
  const diffLabels   = { all: 'Semua', mudah: 'Mudah', sedang: 'Sedang', sulit: 'Sulit' };

  return (
    <UserLayout>
      <div className="space-y-5 md:space-y-6">

        {/* ── Header banner ── */}
        <motion.section
          initial={{ opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.28 }}
          className="relative overflow-hidden bg-gradient-to-br from-[#4A7C2F] via-[#3e6827] to-[#2d4e1c] rounded-[2rem] shadow-lg shadow-green-900/10 p-6 md:p-8 text-white"
        >
          <div className="absolute -right-16 -top-16 w-56 h-56 rounded-full bg-white/7" />
          <div className="absolute -bottom-20 right-12 w-60 h-60 rounded-full bg-lime-400/10" />

          <div className="relative">
            <div className="inline-flex items-center gap-1.5 bg-white/15 border border-white/20 rounded-full px-3 py-1 text-xs font-bold mb-3">
              <Sparkles size={12} className="animate-pulse" />
              Favorite Recipes
            </div>
            <h1 className="text-2xl md:text-4xl font-black leading-tight tracking-tight">
              Resep yang Disimpan
            </h1>
            <p className="text-green-100/80 mt-3 max-w-xl text-sm md:text-base leading-relaxed font-medium">
              Kamu memiliki{' '}
              <span className="font-extrabold text-white">{favorites.length}</span>{' '}
              resep favorit yang bisa dibuka kembali kapan saja.
            </p>
          </div>
        </motion.section>

        {/* ── Search + Filter bar ── */}
        <section className="bg-white rounded-3xl border border-slate-100/80 shadow-sm p-5">
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1">
              <Search size={17} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Cari nama resep atau bahan..."
                className="w-full border border-slate-200 rounded-2xl pl-11 pr-4 py-3 outline-none focus:border-green-600 focus:ring-2 focus:ring-green-500/15 transition-all duration-200 text-sm"
              />
            </div>

            <div className="flex gap-2 flex-wrap">
              {difficulties.map((d) => (
                <button
                  key={d}
                  onClick={() => setDifficultyFilter(d)}
                  className={`px-4 py-2 rounded-xl text-xs font-bold transition-all duration-200 cursor-pointer ${
                    difficultyFilter === d
                      ? 'bg-green-700 text-white shadow-sm'
                      : 'bg-slate-100 text-slate-600 hover:bg-green-100 hover:text-green-800'
                  }`}
                >
                  {diffLabels[d]}
                </button>
              ))}
            </div>
          </div>

          <p className="text-xs text-slate-400 mt-3 font-semibold">
            Menampilkan {filteredFavorites.length} dari {favorites.length} resep favorit.
          </p>
        </section>

        {/* ── Recipe grid ── */}
        <section className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {paginatedFavorites.map((recipe, index) => (
            <motion.div
              key={recipe.id}
              initial={{ opacity: 0, y: 14 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.22, delay: index * 0.05 }}
              whileHover={{ y: -4 }}
              className="group bg-white rounded-3xl border border-slate-100/80 p-5 md:p-6 hover:shadow-lg hover:shadow-green-700/5 hover:border-green-100/60 transition-all duration-300"
            >
              {/* Clickable recipe body */}
              <button
                type="button"
                onClick={() => handleOpenDetail(recipe)}
                className="w-full text-left cursor-pointer"
              >
                <div className="flex items-start gap-3 mb-4">
                  <div className="bg-green-100 group-hover:bg-green-700 text-green-700 group-hover:text-white p-3 rounded-2xl flex-shrink-0 shadow-sm transition-all duration-300">
                    <ChefHat size={22} />
                  </div>
                  <div className="min-w-0">
                    <h2 className="font-bold text-lg leading-tight text-green-950 tracking-tight">{recipe.recipe_name}</h2>
                    <p className="text-xs text-slate-400 mt-1 font-medium">
                      Disimpan {new Date(recipe.created_at).toLocaleDateString('id-ID', { day: '2-digit', month: 'long', year: 'numeric' })}
                    </p>
                  </div>
                </div>

                <p className="text-slate-500 text-sm leading-relaxed line-clamp-3 mb-4">
                  {recipe.ingredients}
                </p>

                <div className="grid grid-cols-2 gap-2 mb-4">
                  <InfoBadge icon={Clock}    title="Waktu"     value={recipe.cooking_time || '-'} />
                  <InfoBadge icon={BarChart3} title="Kesulitan" value={recipe.difficulty || '-'}   />
                </div>

                {recipe.health_insight && (
                  <div className="bg-green-50/60 border border-green-100/60 rounded-2xl p-3.5 mb-4">
                    <div className="flex items-start gap-2.5">
                      <HeartPulse size={16} className="text-green-700 flex-shrink-0 mt-0.5" />
                      <p className="text-xs text-slate-600 leading-relaxed">{recipe.health_insight}</p>
                    </div>
                  </div>
                )}

                <div className="inline-flex items-center gap-1.5 text-green-700 text-sm font-bold hover:gap-2.5 transition-all duration-200">
                  <Eye size={15} />
                  Lihat detail resep
                </div>
              </button>

              {/* Delete button */}
              <button
                onClick={() => setDeleteTarget(recipe)}
                className="mt-4 w-full inline-flex items-center justify-center gap-2 bg-orange-50 hover:bg-orange-100 active:scale-[0.98] text-orange-700 px-4 py-3 rounded-2xl font-bold transition-all duration-200 cursor-pointer border border-orange-100/60 text-sm hover:-translate-y-0.5"
              >
                <Trash2 size={15} />
                Hapus dari Favorit
              </button>
            </motion.div>
          ))}
        </section>

        {/* Pagination Controls */}
        {filteredFavorites.length > itemsPerPage && (
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 bg-white rounded-3xl border border-slate-100/80 shadow-sm p-5">
            <p className="text-xs text-slate-400 font-semibold order-2 sm:order-1">
              Menampilkan <span className="text-slate-700 font-bold">{startIndex + 1}</span> -{' '}
              <span className="text-slate-700 font-bold">
                {Math.min(startIndex + itemsPerPage, filteredFavorites.length)}
              </span>{' '}
              dari <span className="text-slate-700 font-bold">{filteredFavorites.length}</span> resep.
            </p>
            <div className="flex items-center gap-1.5 order-1 sm:order-2">
              <button
                type="button"
                disabled={currentPage === 1}
                onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
                className="p-2 rounded-xl border border-slate-200 text-slate-500 hover:bg-slate-50 disabled:opacity-50 disabled:hover:bg-transparent transition-all duration-200 cursor-pointer disabled:cursor-not-allowed"
              >
                <ChevronLeft size={16} />
              </button>
              
              {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                <button
                  key={page}
                  type="button"
                  onClick={() => setCurrentPage(page)}
                  className={`min-w-[2.25rem] h-9 rounded-xl text-xs font-bold transition-all duration-200 cursor-pointer ${
                    currentPage === page
                      ? 'bg-green-700 text-white shadow-sm'
                      : 'border border-slate-200 text-slate-600 hover:bg-slate-50'
                  }`}
                >
                  {page}
                </button>
              ))}

              <button
                type="button"
                disabled={currentPage === totalPages}
                onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
                className="p-2 rounded-xl border border-slate-200 text-slate-500 hover:bg-slate-50 disabled:opacity-50 disabled:hover:bg-transparent transition-all duration-200 cursor-pointer disabled:cursor-not-allowed"
              >
                <ChevronRight size={16} />
              </button>
            </div>
          </div>
        )}

        {/* ── Empty state ── */}
        {filteredFavorites.length === 0 && (
          <motion.div
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center py-16 rounded-3xl border border-dashed border-green-200/60 bg-green-50/20"
          >
            <div className="mx-auto bg-yellow-100 text-green-700 w-16 h-16 rounded-3xl flex items-center justify-center shadow-sm mb-5">
              <Package size={28} />
            </div>
            <h2 className="font-bold text-lg text-green-950">Tidak ada resep yang cocok</h2>
            <p className="text-slate-400 mt-2 text-sm">
              {favorites.length === 0
                ? 'Belum ada resep favorit. Coba dapatkan rekomendasi dari AI!'
                : 'Coba ubah kata pencarian atau filter yang digunakan.'}
            </p>
          </motion.div>
        )}

        {deleteTarget && (
          <DeleteConfirmModal
            itemName={deleteTarget.recipe_name}
            onCancel={() => setDeleteTarget(null)}
            onConfirm={handleDelete}
          />
        )}

        {selectedRecipe && (
          <RecipeDetailModal
            recipe={selectedRecipe}
            onClose={() => setSelectedRecipe(null)}
            onFavoriteToggle={async () => {
              const data = await fetchFavorites();
              setFavorites(data);
            }}
          />
        )}
      </div>
    </UserLayout>
  );
}

function InfoBadge({ icon: Icon, title, value }) {
  return (
    <div className="bg-yellow-50/60 border border-yellow-100/50 rounded-2xl p-3 flex items-center gap-2.5">
      <div className="bg-yellow-100 text-green-700 p-1.5 rounded-xl flex-shrink-0">
        <Icon size={15} />
      </div>
      <div className="min-w-0">
        <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">{title}</p>
        <p className="font-bold text-xs text-green-950 truncate capitalize">{value}</p>
      </div>
    </div>
  );
}