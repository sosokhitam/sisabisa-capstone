import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import { motion } from 'framer-motion';
import {
  Users,
  Package,
  Archive,
  Plus,
  ArrowRight,
  ShieldCheck,
  Leaf,
  Boxes,
} from 'lucide-react';
import api from '../../api/axios';

function StatCard({ title, value, icon: Icon, color, bg, index }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 14 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.25, delay: index * 0.06 }}
      whileHover={{ y: -4 }}
      className="bg-white rounded-3xl border border-slate-100 shadow-sm p-6 hover:shadow-md transition"
    >
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-sm font-medium text-slate-500">{title}</p>
          <h2 className="text-3xl font-bold text-slate-900 mt-2">
            {value}
          </h2>
        </div>

        <div className={`${bg} ${color} p-3 rounded-2xl`}>
          <Icon size={22} />
        </div>
      </div>
    </motion.div>
  );
}

export default function AdminDashboard() {
  const [stats, setStats] = useState({
    total_users: 0,
    total_inventory: 0,
  });

  const [ingredients, setIngredients] = useState([]);
  const [loading, setLoading] = useState(true);

  const activeIngredients = ingredients.filter((item) => item.is_active);
  const archivedIngredients = ingredients.filter((item) => !item.is_active);
  const recentIngredients = ingredients.slice(0, 5);

  useEffect(() => {
    let ignore = false;

    const loadDashboard = async () => {
      try {
        setLoading(true);

        const [statsResponse, ingredientsResponse] = await Promise.all([
          api.get('/admin/stats'),
          api.get('/admin/ingredients', {
            params: { search: '' },
          }),
        ]);

        if (ignore) return;

        setStats(statsResponse.data.data || {});
        setIngredients(ingredientsResponse.data.data || []);
      } catch (error) {
        console.error(error);
        toast.error('Gagal memuat dashboard admin');
      } finally {
        if (!ignore) {
          setLoading(false);
        }
      }
    };

    loadDashboard();

    return () => {
      ignore = true;
    };
  }, []);

  if (loading) {
    return <AdminSkeleton />;
  }

  return (
    <div className="space-y-6">
      <motion.section
        initial={{ opacity: 0, y: 18 }}
        animate={{ opacity: 1, y: 0 }}
        className="rounded-[2rem] bg-gradient-to-br from-green-700 to-lime-500 p-6 md:p-8 text-white shadow-md shadow-green-700/5"
      >
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
          <div>
            <div className="inline-flex items-center gap-2 rounded-full bg-white/10 px-3 py-1 text-sm text-green-50 font-semibold border border-white/5">
              <ShieldCheck size={16} />
              Admin Console
            </div>

            <h1 className="mt-4 text-3xl md:text-4xl font-bold tracking-tight">
              Dashboard Admin
            </h1>

            <p className="mt-3 max-w-2xl text-green-50/95 font-medium leading-relaxed">
              Pantau ringkasan sistem dan kualitas data ingredient yang
              digunakan oleh fitur inventory user.
            </p>
          </div>

          <div className="grid grid-cols-2 gap-3 min-w-full lg:min-w-[360px]">
            <div className="rounded-2xl bg-white/10 border border-white/10 p-4">
              <p className="text-sm text-green-50 font-medium">Ingredient</p>
              <p className="text-2xl font-bold mt-1">
                {ingredients.length}
              </p>
            </div>

            <div className="rounded-2xl bg-white/10 border border-white/10 p-4">
              <p className="text-sm text-green-50 font-medium">User</p>
              <p className="text-2xl font-bold mt-1">
                {stats.total_users || 0}
              </p>
            </div>
          </div>
        </div>
      </motion.section>

      <section className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        <StatCard
          title="Total Ingredients"
          value={ingredients.length}
          icon={Boxes}
          color="text-green-700"
          bg="bg-green-100"
          index={0}
        />

        <StatCard
          title="Active Ingredients"
          value={activeIngredients.length}
          icon={Leaf}
          color="text-green-800"
          bg="bg-lime-100"
          index={1}
        />

        <StatCard
          title="Archived Ingredients"
          value={archivedIngredients.length}
          icon={Archive}
          color="text-orange-700"
          bg="bg-orange-100"
          index={2}
        />

        <StatCard
          title="Total Users"
          value={stats.total_users || 0}
          icon={Users}
          color="text-green-700"
          bg="bg-yellow-100"
          index={3}
        />
      </section>

      <section className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          className="xl:col-span-2 bg-white rounded-3xl border border-green-100/30 shadow-sm p-6"
        >
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-6">
            <div>
              <h2 className="text-xl font-bold text-green-950">
                Recent Ingredients
              </h2>
              <p className="text-sm text-slate-500 mt-1 font-semibold">
                Bahan terbaru dari master data ingredient.
              </p>
            </div>

            <Link
              to="/admin/ingredients"
              className="inline-flex items-center gap-2 text-green-700 font-bold text-sm hover:underline animate-pulse"
            >
              Lihat semua
              <ArrowRight size={16} />
            </Link>
          </div>

          {recentIngredients.length === 0 ? (
            <div className="bg-yellow-50/30 rounded-3xl text-center py-12">
              <div className="mx-auto bg-yellow-100 text-green-700 w-16 h-16 rounded-3xl flex items-center justify-center">
                <Package size={30} />
              </div>

              <h3 className="font-bold mt-4 text-green-950">
                Belum ada ingredient
              </h3>

              <p className="text-slate-500 mt-1 text-sm font-semibold">
                Tambahkan ingredient pertama melalui halaman management.
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {recentIngredients.map((item) => (
                <div
                  key={item.id}
                  className="flex flex-col md:flex-row md:items-center md:justify-between gap-3 border border-green-100/20 rounded-2xl p-4 hover:bg-yellow-50/20 transition duration-200"
                >
                  <div>
                    <h3 className="font-bold text-green-950 capitalize">
                      {item.name}
                    </h3>
                    <p className="text-sm text-slate-500 mt-1 font-semibold">
                      {item.category}
                    </p>
                  </div>

                  <span
                    className={`w-fit px-3 py-1 rounded-full text-xs font-bold ${
                      item.is_active
                        ? 'bg-green-100 text-green-800'
                        : 'bg-orange-100 text-orange-800'
                    }`}
                  >
                    {item.is_active ? 'Aktif' : 'Diarsipkan'}
                  </span>
                </div>
              ))}
            </div>
          )}
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-3xl border border-green-100/30 shadow-sm p-6"
        >
          <h2 className="text-xl font-bold text-green-950 tracking-tight">
            Quick Actions
          </h2>

          <p className="text-sm text-slate-500 mt-1 mb-5 font-semibold">
            Akses cepat untuk mengelola data utama aplikasi.
          </p>

          <div className="space-y-3">
            <Link
              to="/admin/ingredients"
              className="flex items-center justify-between gap-3 rounded-2xl bg-orange-500 text-white p-4 font-bold hover:bg-orange-600 transition shadow-md shadow-orange-500/10 cursor-pointer"
            >
              <span className="inline-flex items-center gap-2">
                <Plus size={18} />
                Tambah Ingredient
              </span>
              <ArrowRight size={18} />
            </Link>

            <Link
              to="/admin/ingredients"
              className="flex items-center justify-between gap-3 rounded-2xl border border-green-700/30 text-green-800 p-4 font-bold hover:bg-green-50 transition duration-200 cursor-pointer"
            >
              <span className="inline-flex items-center gap-2">
                <Package size={18} />
                Ingredient Management
              </span>
              <ArrowRight size={18} />
            </Link>
          </div>

          <div className="mt-6 rounded-2xl bg-yellow-100/40 border border-yellow-100/20 p-4">
            <p className="text-sm font-bold text-green-900">
              Catatan Admin
            </p>
            <p className="text-sm text-slate-600 mt-1 leading-relaxed font-semibold">
              Data ingredient aktif akan langsung digunakan oleh fitur inventory
              dan expiry checker user.
            </p>
          </div>
        </motion.div>
      </section>
    </div>
  );
}

function AdminSkeleton() {
  return (
    <div className="space-y-6">
      <div className="h-56 rounded-[2rem] bg-slate-200 animate-pulse" />

      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        {[1, 2, 3, 4].map((item) => (
          <div
            key={item}
            className="bg-white rounded-3xl border border-slate-100 p-6 space-y-4"
          >
            <div className="h-4 bg-slate-100 rounded animate-pulse" />
            <div className="h-10 bg-slate-100 rounded animate-pulse w-1/2" />
          </div>
        ))}
      </div>
    </div>
  );
}