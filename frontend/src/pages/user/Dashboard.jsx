import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import { motion } from 'framer-motion';
import {
  Package,
  AlertTriangle,
  CheckCircle,
  Bot,
  ChefHat,
  Plus,
  Bookmark,
  ArrowRight,
  Refrigerator,
  Sparkles,
  TrendingUp,
} from 'lucide-react';
import api from '../../api/axios';
import { useAuth } from '../../context/auth';
import UserLayout from '../../layouts/UserLayout';

/* ── Stat Card ─────────────────────────────── */
function StatCard({ title, value, icon: Icon, gradientFrom, gradientTo, index }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.28, delay: index * 0.07 }}
      whileHover={{ y: -5, scale: 1.02 }}
      className="relative overflow-hidden bg-white rounded-3xl border border-slate-100/80 p-5 shadow-sm hover:shadow-md transition-all duration-300 cursor-default"
    >
      {/* Ambient background */}
      <div
        className={`absolute -top-8 -right-8 w-28 h-28 rounded-full blur-2xl opacity-[0.08]`}
        style={{ background: `linear-gradient(135deg, ${gradientFrom}, ${gradientTo})` }}
      />

      <div className="relative flex items-start justify-between gap-4">
        <div>
          <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">{title}</p>
          <h2 className="text-4xl font-black text-slate-900 mt-2 tracking-tight">{value}</h2>
        </div>
        <div
          className="p-3 rounded-2xl text-white shadow-lg flex-shrink-0"
          style={{ background: `linear-gradient(135deg, ${gradientFrom}, ${gradientTo})` }}
        >
          <Icon size={22} />
        </div>
      </div>
    </motion.div>
  );
}

/* ── Main Component ─────────────────────────── */
export default function Dashboard() {
  const { user } = useAuth();
  const [items, setItems]               = useState([]);
  const [favoriteCount, setFavoriteCount] = useState(0);

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const getDiffDays = (expiredAt) => {
    const expiredDate = new Date(expiredAt);
    expiredDate.setHours(0, 0, 0, 0);
    return Math.ceil((expiredDate - today) / (1000 * 60 * 60 * 24));
  };

  const expiredItems     = items.filter((item) => getDiffDays(item.expired_at) < 0);
  const soonExpiredItems = items.filter((item) => {
    const d = getDiffDays(item.expired_at);
    return d >= 0 && d <= 3;
  });
  const attentionItems = [...expiredItems, ...soonExpiredItems];

  useEffect(() => {
    let ignore = false;

    const fetchDashboardData = async () => {
      try {
        const [inventoryRes, favoriteRes] = await Promise.all([
          api.get('/inventory'),
          api.get('/favorites'),
        ]);

        const inventoryData = inventoryRes.data.data || [];
        const favoriteData  = favoriteRes.data.data  || [];

        if (ignore) return;

        setItems(inventoryData);
        setFavoriteCount(favoriteData.length);

        const currentDate = new Date();
        currentDate.setHours(0, 0, 0, 0);

        const expiredCount = inventoryData.filter((item) => {
          const d = new Date(item.expired_at);
          d.setHours(0, 0, 0, 0);
          return d < currentDate;
        }).length;

        const soonCount = inventoryData.filter((item) => {
          const d = new Date(item.expired_at);
          d.setHours(0, 0, 0, 0);
          const diff = Math.ceil((d - currentDate) / (1000 * 60 * 60 * 24));
          return diff >= 0 && diff <= 3;
        }).length;

        if (expiredCount > 0) toast.error(`${expiredCount} bahan sudah expired`);
        else if (soonCount > 0) toast(`${soonCount} bahan hampir expired`, { icon: '⚠️' });
      } catch {
        toast.error('Gagal memuat dashboard');
      }
    };

    fetchDashboardData();
    return () => { ignore = true; };
  }, []);

  return (
    <UserLayout>
      <div className="space-y-6">

        {/* ── Attention Alert ── */}
        {attentionItems.length > 0 && (
          <motion.section
            initial={{ opacity: 0, y: -14 }}
            animate={{ opacity: 1, y: 0 }}
            className="relative overflow-hidden rounded-3xl border border-orange-200/70 bg-gradient-to-r from-orange-50 to-amber-50/60 p-5 shadow-sm"
          >
            <div className="absolute -right-8 -top-8 w-32 h-32 rounded-full bg-orange-200/30 blur-2xl" />
            <div className="relative flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
              <div className="flex gap-4">
                <div className="bg-orange-100 text-orange-600 p-3 rounded-2xl h-fit shadow-sm flex-shrink-0">
                  <AlertTriangle size={22} className="animate-pulse" />
                </div>
                <div>
                  <h2 className="font-bold text-orange-950">Ada bahan yang perlu segera digunakan</h2>
                  <p className="text-sm text-orange-800/80 mt-1 font-medium">
                    {expiredItems.length > 0    && `${expiredItems.length} bahan sudah expired. `}
                    {soonExpiredItems.length > 0 && `${soonExpiredItems.length} bahan hampir expired.`}
                  </p>
                </div>
              </div>
              <Link
                to="/recommendations"
                className="group inline-flex items-center justify-center gap-2 bg-[#FFA02E] hover:bg-[#e08316] text-white px-5 py-3 rounded-2xl font-bold transition-all duration-200 shadow-md shadow-orange-500/15 hover:-translate-y-0.5 cursor-pointer flex-shrink-0"
              >
                Cari Resep AI
                <ArrowRight size={17} className="group-hover:translate-x-0.5 transition-transform" />
              </Link>
            </div>
          </motion.section>
        )}

        {/* ── Hero Banner ── */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
          className="relative overflow-hidden rounded-[2rem] bg-gradient-to-br from-[#4A7C2F] via-[#3e6827] to-[#2d4e1c] p-6 md:p-8 text-white shadow-lg shadow-green-900/10"
        >
          {/* Decorative circles */}
          <div className="absolute -right-20 -top-20 w-64 h-64 rounded-full bg-white/8" />
          <div className="absolute -bottom-28 right-16 w-72 h-72 rounded-full bg-white/5" />
          <div className="absolute top-1/2 left-[45%] w-48 h-48 rounded-full bg-lime-400/10" />

          <div className="relative z-10 flex flex-col xl:flex-row xl:items-end xl:justify-between gap-8">
            {/* Left text */}
            <div className="max-w-2xl">
              <div className="inline-flex items-center gap-2 bg-white/15 border border-white/20 rounded-full px-3.5 py-1.5 text-xs font-bold tracking-wider">
                <Sparkles size={13} className="animate-pulse" />
                Smart Food Management
              </div>
              <h1 className="text-3xl md:text-5xl font-black mt-4 leading-tight tracking-tight">
                Halo, {user?.name?.split(' ')[0] || 'Pengguna'} 👋
              </h1>
              <p className="text-green-100/80 mt-4 text-sm md:text-base leading-relaxed font-medium max-w-xl">
                Pantau bahan makanan, cegah food waste, dan dapatkan ide resep dari AI berdasarkan inventory yang kamu punya.
              </p>
            </div>

            {/* Stats mini grid */}
            <div className="grid grid-cols-2 sm:grid-cols-4 xl:grid-cols-2 gap-3 xl:min-w-[320px]">
              {[
                { label: 'Inventory',     value: items.length           },
                { label: 'Hampir Expired',value: soonExpiredItems.length },
                { label: 'Sudah Expired', value: expiredItems.length     },
                { label: 'Favorit',       value: favoriteCount           },
              ].map(({ label, value }) => (
                <div key={label} className="rounded-2xl bg-white/12 border border-white/15 px-4 py-3">
                  <p className="text-xs text-green-100/80 font-semibold">{label}</p>
                  <p className="text-2xl font-black mt-0.5">{value}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Action buttons */}
          <div className="relative z-10 mt-7 grid grid-cols-1 sm:grid-cols-3 gap-3">
            <Link
              to="/inventory"
              className="group inline-flex items-center justify-center gap-2 bg-white text-green-700 px-5 py-3.5 rounded-2xl font-bold hover:bg-green-50 transition-all duration-200 hover:-translate-y-0.5 shadow-sm cursor-pointer"
            >
              <Plus size={18} />
              Tambah Inventory
            </Link>
            <Link
              to="/recommendations"
              className="group inline-flex items-center justify-center gap-2 bg-white/15 border border-white/25 text-white px-5 py-3.5 rounded-2xl font-bold hover:bg-white/25 transition-all duration-200 hover:-translate-y-0.5 cursor-pointer"
            >
              <ChefHat size={18} />
              Rekomendasi AI
            </Link>
            <Link
              to="/favorites"
              className="group inline-flex items-center justify-center gap-2 bg-white/10 border border-white/18 text-white px-5 py-3.5 rounded-2xl font-bold hover:bg-white/20 transition-all duration-200 hover:-translate-y-0.5 cursor-pointer"
            >
              <Bookmark size={18} />
              Resep Favorit
            </Link>
          </div>
        </motion.section>

        {/* ── Stat Cards ── */}
        <section className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
          <StatCard title="Total Bahan"    value={items.length}            icon={Package}       gradientFrom="#4A7C2F" gradientTo="#9AD872" index={0} />
          <StatCard title="Hampir Expired" value={soonExpiredItems.length} icon={AlertTriangle}  gradientFrom="#FFA02E" gradientTo="#ffbc70" index={1} />
          <StatCard title="Sudah Expired"  value={expiredItems.length}     icon={TrendingUp}     gradientFrom="#e08316" gradientTo="#FFA02E" index={2} />
          <StatCard title="Resep Favorit"  value={favoriteCount}           icon={Bookmark}       gradientFrom="#4A7C2F" gradientTo="#FFEF91" index={3} />
        </section>

        {/* ── AI Insight + Attention Table ── */}
        <section className="grid grid-cols-1 xl:grid-cols-3 gap-6">

          {/* AI Insight card */}
          <motion.div
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.12 }}
            className="xl:col-span-1 relative overflow-hidden bg-gradient-to-br from-[#FFEF91]/40 to-yellow-50/60 rounded-3xl border border-yellow-200/40 p-6 shadow-sm hover:shadow-md transition-all duration-300"
          >
            <div className="absolute -top-6 -right-6 w-20 h-20 rounded-full bg-green-200/30 blur-xl" />
            <div className="relative flex items-start gap-4">
              <div className="bg-green-700 text-white p-3 rounded-2xl shadow-md shadow-green-700/20 flex-shrink-0">
                <Bot size={22} />
              </div>
              <div>
                <h2 className="font-bold text-lg text-green-900 tracking-tight">Insight AI Hari Ini</h2>
                <p className="text-slate-600 mt-3 text-sm leading-relaxed font-medium">
                  {attentionItems.length > 0
                    ? `Ada ${attentionItems.length} bahan yang perlu segera diperhatikan. Gunakan rekomendasi AI agar bahan tidak terbuang.`
                    : items.length === 0
                      ? 'Inventory kamu masih kosong. Tambahkan bahan pertama agar AI bisa memberi rekomendasi resep.'
                      : favoriteCount > 0
                        ? `Semua bahan terlihat aman. Kamu juga sudah menyimpan ${favoriteCount} resep favorit — hebat!`
                        : 'Semua bahan terlihat aman. Tetap pantau inventory secara rutin agar bahan makanan tidak terbuang.'}
                </p>
                <Link
                  to="/recommendations"
                  className="group inline-flex items-center gap-1.5 mt-5 text-green-700 font-bold text-sm hover:gap-2.5 transition-all duration-200"
                >
                  Buka rekomendasi
                  <ArrowRight size={15} className="group-hover:translate-x-0.5 transition-transform" />
                </Link>
              </div>
            </div>
          </motion.div>

          {/* Attention items table */}
          <motion.div
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.16 }}
            className="xl:col-span-2 bg-white rounded-3xl shadow-sm border border-slate-100/80 p-6"
          >
            <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3 mb-6">
              <div>
                <h2 className="font-bold text-lg text-slate-900 tracking-tight">Bahan yang Perlu Diperhatikan</h2>
                <p className="text-sm text-slate-400 mt-0.5">Prioritaskan bahan yang sudah atau hampir expired.</p>
              </div>
              <Link
                to="/inventory"
                className="group inline-flex items-center gap-1.5 text-green-700 font-bold text-sm hover:gap-2.5 transition-all duration-200 flex-shrink-0"
              >
                Lihat Inventory
                <ArrowRight size={15} className="group-hover:translate-x-0.5 transition-transform" />
              </Link>
            </div>

            {attentionItems.length === 0 ? (
              <div className="text-center py-12">
                <div className="mx-auto bg-green-100 text-green-700 w-16 h-16 rounded-3xl flex items-center justify-center shadow-sm">
                  <CheckCircle size={28} />
                </div>
                <h3 className="font-bold mt-4 text-slate-900">Semua bahan masih aman</h3>
                <p className="text-slate-400 mt-1.5 text-sm">Tidak ada bahan yang perlu perhatian khusus hari ini.</p>
              </div>
            ) : (
              <div className="space-y-3 max-h-[360px] overflow-auto pr-1">
                {attentionItems.map((item, index) => {
                  const diffDays  = getDiffDays(item.expired_at);
                  const isExpired = diffDays < 0;
                  return (
                    <motion.div
                      key={item.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.2, delay: index * 0.04 }}
                      className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 p-4 rounded-2xl border border-slate-100 hover:bg-slate-50/60 transition-colors duration-200"
                    >
                      <div className="flex items-start gap-3">
                        <div className={`p-3 rounded-2xl flex-shrink-0 ${isExpired ? 'bg-orange-100 text-orange-700' : 'bg-amber-50 text-amber-600'}`}>
                          <Refrigerator size={19} />
                        </div>
                        <div>
                          <h3 className="font-bold text-green-950 capitalize tracking-tight">{item.ingredient_name}</h3>
                          <p className="text-sm text-slate-500 mt-0.5 font-medium">
                            Expired: {new Date(item.expired_at).toLocaleDateString('id-ID', { day: '2-digit', month: 'long', year: 'numeric' })}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2 flex-shrink-0">
                        <span className={`px-3 py-1 rounded-full text-xs font-bold ${isExpired ? 'bg-orange-100 text-orange-800' : 'bg-amber-50 text-amber-700 border border-amber-200/50'}`}>
                          {isExpired ? 'Expired' : `${diffDays} hari lagi`}
                        </span>
                        <Link
                          to="/recommendations"
                          className="bg-[#FFA02E] hover:bg-[#e08316] text-white px-4 py-2 rounded-xl text-xs font-bold transition-all duration-200 hover:-translate-y-0.5 shadow-sm cursor-pointer"
                        >
                          Gunakan
                        </Link>
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            )}
          </motion.div>
        </section>
      </div>
    </UserLayout>
  );
}