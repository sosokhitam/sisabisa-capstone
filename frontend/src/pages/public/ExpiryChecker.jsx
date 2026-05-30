import { useState } from 'react';
import {
  Search,
  CalendarDays,
  Refrigerator,
  CheckCircle,
  AlertCircle,
  Loader2,
  PackageCheck,
} from 'lucide-react';
import api from '../../api/axios';

export default function ExpiryChecker({ compact = false }) {
  const [search, setSearch] = useState('');
  const [suggestions, setSuggestions] = useState([]);
  const [selectedIngredient, setSelectedIngredient] = useState(null);
  const [storage, setStorage] = useState('');
  const [purchaseDate, setPurchaseDate] = useState('');
  const [result, setResult] = useState(null);
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSearch = async (value) => {
    setSearch(value);
    setSelectedIngredient(null);
    setStorage('');
    setResult(null);
    setMessage('');

    if (value.length < 2) {
      setSuggestions([]);
      return;
    }

    try {
      const response = await api.get('/public/ingredients', {
        params: { search: value },
      });

      setSuggestions(response.data.data || []);
    } catch {
      setSuggestions([]);
    }
  };

  const handleSelectIngredient = (ingredient) => {
    setSelectedIngredient(ingredient);
    setSearch(ingredient.item);
    setSuggestions([]);
    setStorage('');
    setResult(null);
    setMessage('');
  };

  const handleCheckExpiry = async (e) => {
    e.preventDefault();
    setMessage('');
    setResult(null);

    if (!selectedIngredient || !storage || !purchaseDate) {
      setMessage('Lengkapi bahan, tempat penyimpanan, dan tanggal beli.');
      return;
    }

    try {
      setLoading(true);

      const response = await api.post('/public/check-expiry', {
        ingredient_id: selectedIngredient.ingredient_id,
        storage,
        purchase_date: purchaseDate,
      });

      setResult(response.data.data);
    } catch (error) {
      setMessage(
        error.response?.data?.message || 'Gagal mengecek expired bahan.'
      );
    } finally {
      setLoading(false);
    }
  };

  const handleReset = () => {
    setSearch('');
    setSuggestions([]);
    setSelectedIngredient(null);
    setStorage('');
    setPurchaseDate('');
    setResult(null);
    setMessage('');
  };

  const storageRules = selectedIngredient?.storage_rules || [];

  return (
    <div
      className={
        compact
          ? 'w-full'
          : 'min-h-screen bg-slate-100 flex items-center justify-center px-4 py-10'
      }
    >
      <div
        className={
          compact
            ? 'w-full'
            : 'w-full max-w-xl bg-white rounded-3xl shadow-sm border border-slate-100 p-5 md:p-6'
        }
      >
        {!compact && (
          <div className="flex items-start gap-3 mb-5">
            <div className="bg-green-100 text-green-700 p-3 rounded-2xl">
              <PackageCheck size={24} />
            </div>

            <div>
              <h1 className="text-2xl font-bold text-slate-900">
                Cek Estimasi Kadaluarsa
              </h1>

              <p className="text-slate-500 mt-1">
                Cari bahan, pilih penyimpanan, lalu sistem menghitung estimasi
                expired otomatis.
              </p>
            </div>
          </div>
        )}

        <form onSubmit={handleCheckExpiry} className="space-y-4">
          <div className="relative">
            <label className="block mb-1 text-sm font-semibold text-slate-700">
              Nama Bahan
            </label>

            <div className="relative">
              <Search
                size={18}
                className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
              />

              <input
                type="text"
                value={search}
                onChange={(e) => handleSearch(e.target.value)}
                placeholder="Contoh: telur"
                className="w-full border border-slate-200 rounded-2xl pl-11 pr-4 py-3 outline-none focus:ring-2 focus:ring-green-500"
              />
            </div>

            {suggestions.length > 0 && (
              <div className="absolute z-20 bg-white border border-slate-200 rounded-2xl shadow-lg w-full mt-2 max-h-56 overflow-y-auto">
                {suggestions.map((item) => (
                  <button
                    type="button"
                    key={item.ingredient_id}
                    onClick={() => handleSelectIngredient(item)}
                    className="w-full text-left px-4 py-3 hover:bg-green-50 transition"
                  >
                    <div className="font-semibold text-slate-800 capitalize">
                      {item.item}
                    </div>

                    <div className="text-sm text-slate-500">
                      {item.category}
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>

          {selectedIngredient && (
            <div className="rounded-2xl bg-green-50 border border-green-100 p-4">
              <p className="text-sm text-green-700">
                Bahan dipilih:{' '}
                <span className="font-bold capitalize">
                  {selectedIngredient.item}
                </span>
              </p>

              <p className="text-xs text-green-600 mt-1">
                {selectedIngredient.category}
              </p>
            </div>
          )}

          <div>
            <label className="block mb-1 text-sm font-semibold text-slate-700">
              Tempat Penyimpanan
            </label>

            <div className="relative">
              <Refrigerator
                size={18}
                className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
              />

              <select
                value={storage}
                onChange={(e) => setStorage(e.target.value)}
                disabled={!selectedIngredient}
                className="w-full border border-slate-200 rounded-2xl pl-11 pr-4 py-3 outline-none focus:ring-2 focus:ring-green-500 disabled:bg-slate-100 disabled:text-slate-400"
              >
                <option value="">
                  {selectedIngredient
                    ? 'Pilih tempat penyimpanan'
                    : 'Pilih bahan terlebih dahulu'}
                </option>

                {storageRules.map((rule) => (
                  <option key={rule.storage} value={rule.storage}>
                    {rule.storage}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label className="block mb-1 text-sm font-semibold text-slate-700">
              Tanggal Beli
            </label>

            <div className="relative">
              <CalendarDays
                size={18}
                className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
              />

              <input
                type="date"
                value={purchaseDate}
                onChange={(e) => setPurchaseDate(e.target.value)}
                className="w-full border border-slate-200 rounded-2xl pl-11 pr-4 py-3 outline-none focus:ring-2 focus:ring-green-500"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full inline-flex items-center justify-center gap-2 bg-green-600 hover:bg-green-700 disabled:bg-green-400 text-white py-3 rounded-2xl font-bold transition"
          >
            {loading && <Loader2 size={18} className="animate-spin" />}
            {loading ? 'Mengecek...' : 'Cek Kadaluarsa'}
          </button>
        </form>

        {message && (
          <div className="mt-5 flex items-start gap-3 bg-red-50 border border-red-100 text-red-700 px-4 py-3 rounded-2xl">
            <AlertCircle size={20} className="shrink-0 mt-0.5" />
            <p className="text-sm font-medium">{message}</p>
          </div>
        )}

        {result && (
          <div className="mt-6 bg-green-50 border border-green-100 rounded-3xl p-5">
            <div className="flex items-start gap-3">
              <div className="bg-green-100 text-green-700 p-3 rounded-2xl">
                <CheckCircle size={24} />
              </div>

              <div>
                <h2 className="font-bold text-green-800 text-lg">
                  Hasil Estimasi
                </h2>

                <p className="text-sm text-green-700 mt-1">
                  Bahan ini diperkirakan aman selama {result.shelf_life_days}{' '}
                  hari dalam penyimpanan {result.storage}.
                </p>
              </div>
            </div>

            <div className="mt-5 grid grid-cols-1 sm:grid-cols-2 gap-3">
              <InfoCard label="Bahan" value={result.item} />
              <InfoCard label="Kategori" value={result.category} />
              <InfoCard label="Storage" value={result.storage} />
              <InfoCard
                label="Estimasi Expired"
                value={new Date(
                  result.estimated_expired_at
                ).toLocaleDateString('id-ID', {
                  day: '2-digit',
                  month: 'long',
                  year: 'numeric',
                })}
              />
            </div>

            <div className="mt-5 flex justify-end">
              <button
                type="button"
                onClick={handleReset}
                className="w-full sm:w-auto bg-green-600 hover:bg-green-700 active:scale-[0.98] text-white font-bold px-6 py-3 rounded-2xl transition duration-150 text-sm cursor-pointer shadow-sm shadow-green-600/10 flex items-center justify-center gap-1.5"
              >
                Cek Bahan Lain
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function InfoCard({ label, value }) {
  return (
    <div className="bg-white border border-green-100 rounded-2xl p-4">
      <p className="text-xs font-semibold text-slate-500">{label}</p>
      <p className="font-bold text-slate-800 mt-1 capitalize">{value}</p>
    </div>
  );
}