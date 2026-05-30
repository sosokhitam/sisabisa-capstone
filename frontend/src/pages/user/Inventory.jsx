import { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import { motion } from 'framer-motion';
import DeleteConfirmModal from '../../components/DeleteConfirmModal';
import {
  Search,
  Plus,
  Package,
  Trash2,
  CalendarDays,
  Refrigerator,
  AlertTriangle,
  CheckCircle,
  Sparkles,
} from 'lucide-react';
import api from '../../api/axios';
import UserLayout from '../../layouts/UserLayout';

export default function Inventory() {
  const [items, setItems]                       = useState([]);
  const [search, setSearch]                     = useState('');
  const [inventorySearch, setInventorySearch]   = useState('');
  const [filter, setFilter]                     = useState('all');
  const [suggestions, setSuggestions]           = useState([]);
  const [selectedIngredient, setSelectedIngredient] = useState(null);
  const [deleteTarget, setDeleteTarget]         = useState(null);

  const [form, setForm] = useState({
    quantity: '', unit: '', storage: '', purchase_date: '',
  });

  const fetchInventory = async () => {
    const response = await api.get('/inventory');
    return response.data.data || [];
  };

  useEffect(() => {
    let ignore = false;
    const loadInventory = async () => {
      try {
        const data = await fetchInventory();
        if (!ignore) setItems(data);
      } catch {
        toast.error('Gagal memuat inventory');
      }
    };
    loadInventory();
    return () => { ignore = true; };
  }, []);

  const getExpiryStatus = (expiredAt) => {
    const today       = new Date();
    const expiredDate = new Date(expiredAt);
    today.setHours(0, 0, 0, 0);
    expiredDate.setHours(0, 0, 0, 0);
    const diffDays = Math.ceil((expiredDate - today) / (1000 * 60 * 60 * 24));

    if (diffDays < 0)  return { key: 'expired', label: 'Expired',           icon: AlertTriangle, className: 'bg-orange-100 text-orange-800 border border-orange-200/60' };
    if (diffDays <= 3) return { key: 'soon',    label: `${diffDays} hari lagi`, icon: AlertTriangle, className: 'bg-amber-50 text-amber-700 border border-amber-200/50' };
    return               { key: 'safe',    label: 'Aman',               icon: CheckCircle,   className: 'bg-green-100 text-green-800 border border-green-200/50' };
  };

  const filteredItems = items.filter((item) => {
    const status = getExpiryStatus(item.expired_at);
    const matchesSearch = item.ingredient_name?.toLowerCase().includes(inventorySearch.toLowerCase());
    const matchesFilter = filter === 'all' || status.key === filter;
    return matchesSearch && matchesFilter;
  });

  const handleSearch = async (value) => {
    setSearch(value);
    setSelectedIngredient(null);
    setForm({ ...form, storage: '' });
    if (value.length < 2) { setSuggestions([]); return; }
    try {
      const response = await api.get('/public/ingredients', { params: { search: value } });
      setSuggestions(response.data.data || []);
    } catch {
      toast.error('Gagal mencari bahan');
    }
  };

  const handleSelectIngredient = (ingredient) => {
    setSelectedIngredient(ingredient);
    setSearch(ingredient.item);
    setSuggestions([]);
    setForm({ ...form, storage: '' });
  };

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleAdd = async (e) => {
    e.preventDefault();
    if (!selectedIngredient) { toast.error('Pilih bahan dari suggestion terlebih dahulu'); return; }
    if (!form.storage)        { toast.error('Pilih kondisi penyimpanan'); return; }
    try {
      await api.post('/inventory', {
        ingredient_id: selectedIngredient.ingredient_id,
        storage: form.storage, quantity: form.quantity,
        unit: form.unit, purchase_date: form.purchase_date,
      });
      setSearch(''); setSelectedIngredient(null); setSuggestions([]);
      setForm({ quantity: '', unit: '', storage: '', purchase_date: '' });
      toast.success('Bahan berhasil ditambahkan');
      const data = await fetchInventory();
      setItems(data);
    } catch {
      toast.error('Gagal menambah inventory');
    }
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    try {
      await api.delete(`/inventory/${deleteTarget.id}`);
      toast.success('Bahan berhasil dihapus');
      const data = await fetchInventory();
      setItems(data);
      setDeleteTarget(null);
    } catch {
      toast.error('Gagal menghapus bahan');
    }
  };

  const filterOptions = [
    { label: 'Semua',         value: 'all'     },
    { label: 'Aman',          value: 'safe'    },
    { label: 'Hampir Expired',value: 'soon'    },
    { label: 'Expired',       value: 'expired' },
  ];

  const selectedStorageRules = selectedIngredient?.storage_rules || [];

  /* input class reused */
  const inputCls = 'w-full border border-slate-200 rounded-2xl px-4 py-3 outline-none focus:border-green-600 focus:ring-2 focus:ring-green-500/15 transition-all duration-200 bg-white text-sm placeholder:text-slate-400';

  return (
    <UserLayout>
      <div className="space-y-5 md:space-y-6">

        {/* ── Page header banner ── */}
        <motion.section
          initial={{ opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.28 }}
          className="relative overflow-hidden bg-gradient-to-br from-[#4A7C2F] via-[#3e6827] to-[#2d4e1c] rounded-[2rem] shadow-lg shadow-green-900/10 p-6 md:p-8 text-white"
        >
          <div className="absolute -right-16 -top-16 w-56 h-56 rounded-full bg-white/7" />
          <div className="absolute -bottom-24 right-12 w-64 h-64 rounded-full bg-lime-400/10" />

          <div className="relative flex flex-col md:flex-row md:items-center md:justify-between gap-5">
            <div>
              <div className="inline-flex items-center gap-1.5 bg-white/15 border border-white/20 rounded-full px-3 py-1 text-xs font-bold mb-3">
                <Sparkles size={12} className="animate-pulse" />
                Inventory Management
              </div>
              <h1 className="text-2xl md:text-4xl font-black leading-tight tracking-tight">
                Kelola Bahan Makanan
              </h1>
              <p className="text-green-100/80 mt-3 max-w-xl text-sm md:text-base leading-relaxed font-medium">
                Tambahkan bahan, pilih kondisi penyimpanan, dan sistem akan menghitung estimasi kadaluarsa secara otomatis.
              </p>
            </div>

            <motion.div
              whileHover={{ scale: 1.04 }}
              className="bg-white/12 border border-white/20 rounded-2xl p-5 md:min-w-44 text-center md:text-left flex-shrink-0"
            >
              <p className="text-green-100/80 text-sm font-semibold">Total Inventory</p>
              <p className="text-4xl font-black mt-1">{items.length}</p>
              <p className="text-green-100/70 text-xs mt-1 font-medium">bahan tersimpan</p>
            </motion.div>
          </div>
        </motion.section>

        {/* ── Add form ── */}
        <motion.section
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.25, delay: 0.08 }}
          className="bg-white rounded-3xl shadow-sm border border-slate-100/80 p-5 md:p-6"
        >
          <div className="flex items-start gap-3 mb-6">
            <div className="bg-gradient-to-br from-green-700 to-green-600 text-white p-3 rounded-2xl shadow-md shadow-green-700/20 flex-shrink-0">
              <Plus size={20} />
            </div>
            <div>
              <h2 className="font-bold text-lg text-slate-900 tracking-tight">Tambah Bahan</h2>
              <p className="text-sm text-slate-400 mt-0.5">
                Cari bahan dari data master, pilih storage, lalu sistem menghitung expired otomatis.
              </p>
            </div>
          </div>

          <form onSubmit={handleAdd} className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Search with dropdown */}
            <div className="relative md:col-span-2">
              <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
              <input
                value={search}
                onChange={(e) => handleSearch(e.target.value)}
                placeholder="Cari bahan, contoh: telur"
                className={`${inputCls} pl-11`}
                required
              />

              {suggestions.length > 0 && (
                <motion.div
                  initial={{ opacity: 0, y: -6 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="absolute z-20 bg-white border border-slate-200 rounded-2xl shadow-xl w-full mt-2 max-h-56 overflow-y-auto"
                >
                  {suggestions.map((item) => (
                    <button
                      type="button"
                      key={item.ingredient_id}
                      onClick={() => handleSelectIngredient(item)}
                      className="w-full text-left px-4 py-3 hover:bg-green-50/60 transition-colors duration-150 first:rounded-t-2xl last:rounded-b-2xl"
                    >
                      <p className="font-semibold text-green-950 text-sm">{item.item}</p>
                      <p className="text-xs text-slate-500 mt-0.5">{item.category}</p>
                    </button>
                  ))}
                </motion.div>
              )}
            </div>

            {/* Selected ingredient badge */}
            {selectedIngredient && (
              <div className="md:col-span-2 bg-green-50 border border-green-200/60 text-green-800 font-medium rounded-2xl px-4 py-3 text-sm flex items-center gap-2">
                <CheckCircle size={16} className="text-green-600 flex-shrink-0" />
                <span>
                  Dipilih:{' '}
                  <span className="font-extrabold text-green-900">{selectedIngredient.item}</span>
                  {' '}— {selectedIngredient.category}
                </span>
              </div>
            )}

            <input name="quantity"      value={form.quantity}      onChange={handleChange} placeholder="Jumlah" type="number" className={inputCls} required />
            <input name="unit"          value={form.unit}          onChange={handleChange} placeholder="Satuan, contoh: butir" className={inputCls} />

            <select name="storage" value={form.storage} onChange={handleChange} className={`${inputCls}`} required disabled={!selectedIngredient}>
              <option value="">{selectedIngredient ? 'Pilih kondisi penyimpanan' : 'Pilih bahan terlebih dahulu'}</option>
              {selectedStorageRules.map((rule) => (
                <option key={rule.storage} value={rule.storage}>
                  {rule.storage} — {rule.days} hari
                </option>
              ))}
            </select>

            <input name="purchase_date" value={form.purchase_date} onChange={handleChange} type="date" className={inputCls} required />

            <button className="md:col-span-2 bg-[#FFA02E] hover:bg-[#e08316] active:scale-[0.99] transition-all duration-200 text-white py-3.5 rounded-2xl font-bold shadow-md shadow-orange-400/20 hover:shadow-lg hover:shadow-orange-400/25 hover:-translate-y-0.5 cursor-pointer">
              Tambah ke Inventory
            </button>
          </form>
        </motion.section>

        {/* ── Inventory list ── */}
        <motion.section
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.25, delay: 0.14 }}
          className="bg-white rounded-3xl shadow-sm border border-slate-100/80 p-5 md:p-6"
        >
          {/* List header */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-5">
            <div className="flex items-start gap-3">
              <div className="bg-green-100 text-green-700 p-3 rounded-2xl flex-shrink-0">
                <Package size={20} />
              </div>
              <div>
                <h2 className="font-bold text-lg text-slate-900 tracking-tight">Daftar Inventory</h2>
                <p className="text-sm text-slate-400">Menampilkan {filteredItems.length} dari {items.length} bahan.</p>
              </div>
            </div>
            <span className="bg-green-100 text-green-800 px-4 py-1.5 rounded-full text-sm font-bold shadow-sm">
              {filteredItems.length} hasil
            </span>
          </div>

          {/* Search + Filter */}
          <div className="flex flex-col sm:flex-row gap-3 mb-5">
            <div className="relative flex-1">
              <Search size={17} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
              <input
                value={inventorySearch}
                onChange={(e) => setInventorySearch(e.target.value)}
                placeholder="Cari inventory..."
                className="w-full border border-slate-200 rounded-2xl pl-11 pr-4 py-3 outline-none focus:border-green-600 focus:ring-2 focus:ring-green-500/15 transition-all duration-200 text-sm"
              />
            </div>

            {/* Filter pills */}
            <div className="flex flex-wrap gap-2">
              {filterOptions.map((opt) => (
                <button
                  key={opt.value}
                  onClick={() => setFilter(opt.value)}
                  className={`px-4 py-2 rounded-xl text-xs font-bold transition-all duration-200 cursor-pointer ${
                    filter === opt.value
                      ? 'bg-green-700 text-white shadow-sm'
                      : 'bg-slate-100 text-slate-600 hover:bg-green-100 hover:text-green-800'
                  }`}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </div>

          {/* Item cards */}
          <div className="space-y-3">
            {filteredItems.map((item, index) => {
              const status     = getExpiryStatus(item.expired_at);
              const StatusIcon = status.icon;

              return (
                <motion.div
                  key={item.id}
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.2, delay: index * 0.04 }}
                  whileHover={{ y: -3 }}
                  className="border border-slate-100 rounded-3xl p-4 md:p-5 flex flex-col md:flex-row md:items-center md:justify-between gap-4 hover:shadow-md hover:border-green-100/60 transition-all duration-250 bg-white/80"
                >
                  <div className="flex items-start gap-4">
                    <div className="bg-green-50 text-green-700 p-3 rounded-2xl flex-shrink-0 shadow-sm">
                      <Refrigerator size={20} />
                    </div>
                    <div className="min-w-0">
                      <h3 className="font-bold text-base md:text-[1.05rem] capitalize text-green-950 tracking-tight">{item.ingredient_name}</h3>
                      <p className="text-sm text-slate-500 mt-1 font-medium">{item.quantity} {item.unit}</p>
                      {item.storage && (
                        <p className="text-xs text-slate-400 mt-0.5 font-medium">📦 {item.storage}</p>
                      )}
                      <div className="flex items-center gap-1.5 text-xs text-slate-400 mt-1.5 font-medium">
                        <CalendarDays size={13} className="flex-shrink-0" />
                        <span>Expired: {new Date(item.expired_at).toLocaleDateString('id-ID', { day: '2-digit', month: 'long', year: 'numeric' })}</span>
                      </div>
                      <span className={`inline-flex items-center gap-1.5 mt-3 px-3 py-1 rounded-full text-xs font-bold ${status.className}`}>
                        <StatusIcon size={12} />
                        {status.label}
                      </span>
                    </div>
                  </div>

                  <button
                    onClick={() => setDeleteTarget(item)}
                    className="w-full md:w-auto inline-flex items-center justify-center gap-2 bg-orange-50 hover:bg-orange-100 active:scale-[0.98] text-orange-700 px-4 py-2.5 rounded-2xl font-bold transition-all duration-200 cursor-pointer border border-orange-100/60 hover:-translate-y-0.5 text-sm"
                  >
                    <Trash2 size={16} />
                    Hapus
                  </button>
                </motion.div>
              );
            })}

            {filteredItems.length === 0 && (
              <motion.div
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-center py-14 rounded-3xl border border-dashed border-green-200/60 bg-green-50/30"
              >
                <div className="mx-auto bg-green-100 text-green-700 w-16 h-16 rounded-3xl flex items-center justify-center shadow-sm mb-4">
                  <Package size={28} />
                </div>
                <h3 className="font-bold text-green-950">Tidak ada inventory yang cocok</h3>
                <p className="text-slate-400 mt-1.5 text-sm">Coba ubah kata pencarian atau filter yang digunakan.</p>
              </motion.div>
            )}
          </div>
        </motion.section>

        {deleteTarget && (
          <DeleteConfirmModal
            itemName={deleteTarget.ingredient_name}
            onCancel={() => setDeleteTarget(null)}
            onConfirm={handleDelete}
          />
        )}
      </div>
    </UserLayout>
  );
}