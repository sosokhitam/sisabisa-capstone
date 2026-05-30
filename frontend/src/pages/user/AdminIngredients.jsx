import { useState } from 'react';
import toast from 'react-hot-toast';
import {
  Search,
  Plus,
  Pencil,
  Archive,
  RotateCcw,
  PackageSearch,
  Leaf,
  X,
} from 'lucide-react';
import {
  getAdminIngredients,
  createIngredient,
  updateIngredient,
  updateIngredientStatus,
} from '../../services/ingredientService';

const defaultStorageRules = [
  { storage: 'Suhu Ruangan', days: '' },
  { storage: 'Kulkas', days: '' },
  { storage: 'Freezer', days: '' },
];

export default function AdminIngredients() {
  const [ingredients, setIngredients] = useState([]);
  const [hasSearched, setHasSearched] = useState(false);
  const [search, setSearch] = useState('');
  const [editingIngredient, setEditingIngredient] = useState(null);

  const [form, setForm] = useState({
    name: '',
    category: '',
    storage_rules: defaultStorageRules,
  });

  const [editForm, setEditForm] = useState({
    name: '',
    category: '',
    storage_rules: defaultStorageRules,
  });

  const fetchIngredients = async (keyword) => {
    if (!keyword.trim()) {
      setIngredients([]);
      setHasSearched(false);
      return;
    }

    const result = await getAdminIngredients(keyword);
    setIngredients(result.data || []);
    setHasSearched(true);
  };

  const handleSearchChange = async (e) => {
    const value = e.target.value;
    setSearch(value);
    await fetchIngredients(value);
  };

  const handleCreate = async (e) => {
    e.preventDefault();

    try {
      const payload = {
        ...form,
        storage_rules: form.storage_rules.map((rule) => ({
          ...rule,
          days: Number(rule.days),
        })),
      };

      const result = await createIngredient(payload);

      if (result.status === 'success') {
        toast.success('Bahan berhasil ditambahkan');

        setForm({
          name: '',
          category: '',
          storage_rules: defaultStorageRules,
        });

        if (search.trim()) await fetchIngredients(search);
      }
    } catch {
      toast.error('Gagal menambahkan bahan');
    }
  };

  const handleEditOpen = (item) => {
    setEditingIngredient(item);
    setEditForm({
      name: item.name || '',
      category: item.category || '',
      storage_rules:
        item.storage_rules?.map((rule) => ({
          storage: rule.storage,
          days: rule.days,
        })) || defaultStorageRules,
    });
  };

  const handleEditClose = () => {
    setEditingIngredient(null);
    setEditForm({
      name: '',
      category: '',
      storage_rules: defaultStorageRules,
    });
  };

  const handleUpdate = async (e) => {
    e.preventDefault();

    try {
      if (!editingIngredient) return;

      const payload = {
        ...editForm,
        storage_rules: editForm.storage_rules.map((rule) => ({
          ...rule,
          days: Number(rule.days),
        })),
      };

      const result = await updateIngredient(editingIngredient.id, payload);

      if (result.status === 'success') {
        toast.success('Bahan berhasil diperbarui');
        handleEditClose();
        if (search.trim()) await fetchIngredients(search);
      }
    } catch {
      toast.error('Gagal memperbarui bahan');
    }
  };

  const handleStatusChange = async (id, currentStatus) => {
    try {
      await updateIngredientStatus(id, !currentStatus);

      toast.success(
        currentStatus
          ? 'Bahan berhasil diarsipkan'
          : 'Bahan berhasil dipulihkan'
      );

      if (search.trim()) await fetchIngredients(search);
    } catch {
      toast.error('Gagal mengubah status bahan');
    }
  };

  return (
    <div className="w-full max-w-full overflow-hidden space-y-6">
      <section className="rounded-3xl bg-gradient-to-br from-green-700 to-lime-500 p-6 md:p-8 text-white shadow-md shadow-green-700/5">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
          <div>
            <div className="inline-flex items-center gap-2 rounded-full bg-white/10 px-3 py-1 text-sm font-semibold border border-white/5">
              <Leaf size={16} />
              Master Data
            </div>

            <h1 className="mt-4 text-3xl md:text-4xl font-bold tracking-tight">
              Ingredient Management
            </h1>

            <p className="mt-3 max-w-2xl text-green-50/95 font-medium leading-relaxed">
              Kelola data bahan, kategori, dan aturan penyimpanan untuk fitur
              inventory user.
            </p>
          </div>

          <div className="rounded-2xl bg-white/10 border border-white/10 p-4 w-full lg:w-48">
            <p className="text-sm text-green-50 font-medium">Hasil pencarian</p>
            <p className="text-3xl font-bold mt-1">{ingredients.length}</p>
            <p className="text-sm text-green-50 font-medium">bahan ditemukan</p>
          </div>
        </div>
      </section>

      <div className="grid grid-cols-1 xl:grid-cols-[380px_minmax(0,1fr)] gap-6 items-start min-w-0">
        <section className="bg-white rounded-3xl shadow-sm border border-green-100/30 p-5 md:p-6">
          <div className="flex items-start gap-3 mb-6">
            <div className="rounded-2xl bg-green-100 text-green-700 p-3">
              <Plus size={22} />
            </div>

            <div>
              <h2 className="text-xl font-bold text-green-950">
                Tambah Bahan
              </h2>
              <p className="text-sm text-slate-500 mt-1 font-semibold">
                Tambahkan bahan baru agar bisa dipilih user.
              </p>
            </div>
          </div>

          <form onSubmit={handleCreate} className="space-y-4">
            <input
              type="text"
              placeholder="Nama bahan"
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              className="w-full border border-slate-200 rounded-2xl px-4 py-3 outline-none focus:border-green-600 focus:ring-2 focus:ring-green-500/20 transition duration-200"
              required
            />

            <input
              type="text"
              placeholder="Kategori"
              value={form.category}
              onChange={(e) => setForm({ ...form, category: e.target.value })}
              className="w-full border border-slate-200 rounded-2xl px-4 py-3 outline-none focus:border-green-600 focus:ring-2 focus:ring-green-500/20 transition duration-200"
              required
            />

            <div className="rounded-2xl bg-yellow-100/35 border border-yellow-200/20 p-4 space-y-4">
              <p className="text-sm font-bold text-green-900">
                Aturan penyimpanan
              </p>

              {form.storage_rules.map((rule, index) => (
                <div key={rule.storage}>
                  <label className="text-sm font-semibold text-slate-600">
                    {rule.storage}
                  </label>

                  <input
                    type="number"
                    placeholder="Jumlah hari"
                    value={rule.days}
                    onChange={(e) => {
                      const updated = form.storage_rules.map((item, i) =>
                        i === index ? { ...item, days: e.target.value } : item
                      );
                      setForm({ ...form, storage_rules: updated });
                    }}
                    className="mt-1 w-full border border-slate-200 rounded-2xl px-4 py-3 bg-white outline-none focus:border-green-600 focus:ring-2 focus:ring-green-500/20 transition duration-200"
                    required
                  />
                </div>
              ))}
            </div>

            <button
              type="submit"
              className="w-full bg-orange-500 hover:bg-orange-600 text-white rounded-2xl py-3.5 font-bold transition shadow-md shadow-orange-500/10 cursor-pointer"
            >
              Simpan Bahan
            </button>
          </form>
        </section>

        <section className="bg-white rounded-3xl shadow-sm border border-green-100/30 p-5 md:p-6 h-[680px] flex flex-col min-w-0">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 mb-5">
            <div>
              <div className="flex items-center gap-2">
                <PackageSearch size={22} className="text-green-700" />
                <h2 className="text-xl font-bold text-green-955">
                  Daftar Bahan
                </h2>
              </div>

              <p className="text-sm text-slate-500 mt-1 font-semibold">
                {hasSearched
                  ? `Total ${ingredients.length} bahan ditemukan`
                  : 'Cari bahan untuk menampilkan data'}
              </p>
            </div>

            <div className="relative w-full lg:w-80">
              <Search
                size={18}
                className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
              />

              <input
                type="text"
                placeholder="Cari nama/kategori bahan..."
                value={search}
                onChange={handleSearchChange}
                className="w-full border border-slate-200 rounded-2xl pl-11 pr-4 py-3 outline-none focus:border-green-600 focus:ring-2 focus:ring-green-500/20 transition duration-200"
              />
            </div>
          </div>

          <div className="flex-1 overflow-auto rounded-2xl border border-slate-100">
            <table className="w-full min-w-[720px] text-sm">
              <thead className="sticky top-0 z-10 bg-slate-50">
                <tr className="text-left text-slate-500 border-b border-slate-200">
                  <th className="px-4 py-4 font-bold">Nama</th>
                  <th className="px-4 py-4 font-bold">Kategori</th>
                  <th className="px-4 py-4 font-bold">Storage</th>
                  <th className="px-4 py-4 font-bold">Status</th>
                  <th className="px-4 py-4 font-bold text-right">Aksi</th>
                </tr>
              </thead>

              <tbody className="divide-y divide-slate-100">
                {!hasSearched ? (
                  <tr>
                    <td colSpan="5" className="py-20 text-center">
                      <div className="mx-auto w-16 h-16 rounded-2xl bg-slate-100 text-slate-500 flex items-center justify-center">
                        <Search size={28} />
                      </div>
                      <p className="mt-4 font-bold text-slate-700">
                        Mulai cari bahan
                      </p>
                      <p className="text-sm text-slate-500 mt-1">
                        Data tidak ditampilkan sebelum admin melakukan
                        pencarian.
                      </p>
                    </td>
                  </tr>
                ) : ingredients.length === 0 ? (
                  <tr>
                    <td colSpan="5" className="py-20 text-center">
                      <p className="font-bold text-slate-700">
                        Bahan tidak ditemukan
                      </p>
                    </td>
                  </tr>
                ) : (
                  ingredients.map((item) => (
                    <tr
                      key={item.id}
                      className={`transition duration-200 ${
                        item.is_active ? 'hover:bg-yellow-50/20' : 'bg-orange-50/20'
                      }`}
                    >
                      <td className="px-4 py-4 font-bold capitalize text-green-955">
                        {item.name}
                      </td>

                      <td className="px-4 py-4">
                        <span className="rounded-full bg-yellow-100 text-green-800 px-3 py-1 text-xs font-bold border border-yellow-200/30 shadow-sm shadow-green-700/5">
                          {item.category}
                        </span>
                      </td>

                      <td className="px-4 py-4">
                        <div className="flex flex-wrap gap-2">
                          {item.storage_rules?.map((rule) => (
                            <span
                              key={`${item.id}-${rule.storage}`}
                              className="rounded-full bg-green-50 px-3 py-1 text-xs font-bold text-green-800 border border-green-100/30"
                            >
                              {rule.storage}: {rule.days} hari
                            </span>
                          ))}
                        </div>
                      </td>

                      <td className="px-4 py-4">
                        <span
                          className={`rounded-full px-3 py-1 text-xs font-bold ${
                            item.is_active
                              ? 'bg-green-100 text-green-800'
                              : 'bg-orange-100 text-orange-800'
                          }`}
                        >
                          {item.is_active ? 'Aktif' : 'Diarsipkan'}
                        </span>
                      </td>

                      <td className="px-4 py-4">
                        <div className="flex justify-end gap-2">
                          <button
                            type="button"
                            onClick={() => handleEditOpen(item)}
                            className="inline-flex items-center gap-1 rounded-xl px-3 py-2 text-xs font-bold bg-yellow-100 text-green-800 hover:bg-yellow-250/50 cursor-pointer border border-yellow-200/30 transition duration-200 shadow-sm"
                          >
                            <Pencil size={14} />
                            Edit
                          </button>

                          <button
                            type="button"
                            onClick={() =>
                              handleStatusChange(item.id, item.is_active)
                            }
                            className={`inline-flex items-center gap-1 rounded-xl px-3 py-2 text-xs font-bold transition duration-200 cursor-pointer shadow-sm ${
                              item.is_active
                                ? 'bg-orange-50 text-orange-700 hover:bg-orange-100 border border-orange-150/30'
                                : 'bg-green-50 text-green-800 hover:bg-green-100 border border-green-150/30'
                            }`}
                          >
                            {item.is_active ? (
                              <>
                                <Archive size={14} />
                                Arsipkan
                              </>
                            ) : (
                              <>
                                <RotateCcw size={14} />
                                Pulihkan
                              </>
                            )}
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </section>
      </div>

      {editingIngredient && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4 backdrop-blur-sm">
          <div className="w-full max-w-xl bg-white rounded-3xl shadow-xl p-5 md:p-6 max-h-[90vh] overflow-y-auto border border-green-100/20">
            <div className="flex justify-between gap-4 mb-5">
              <div>
                <h2 className="text-xl font-bold text-green-950">
                  Edit Bahan
                </h2>
                <p className="text-sm text-slate-500 mt-1 font-semibold">
                  Perubahan akan langsung digunakan fitur user.
                </p>
              </div>

              <button
                type="button"
                onClick={handleEditClose}
                className="rounded-full p-2 text-slate-500 hover:text-slate-800 hover:bg-slate-100 transition-colors duration-200"
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleUpdate} className="space-y-4">
              <input
                type="text"
                value={editForm.name}
                onChange={(e) =>
                  setEditForm({ ...editForm, name: e.target.value })
                }
                className="w-full border border-slate-200 rounded-2xl px-4 py-3 outline-none focus:border-green-600 focus:ring-2 focus:ring-green-500/20 transition duration-200"
                required
              />

              <input
                type="text"
                value={editForm.category}
                onChange={(e) =>
                  setEditForm({ ...editForm, category: e.target.value })
                }
                className="w-full border border-slate-200 rounded-2xl px-4 py-3 outline-none focus:border-green-600 focus:ring-2 focus:ring-green-500/20 transition duration-200"
                required
              />

              {editForm.storage_rules.map((rule, index) => (
                <input
                  key={rule.storage}
                  type="number"
                  value={rule.days}
                  onChange={(e) => {
                    const updated = editForm.storage_rules.map((item, i) =>
                      i === index ? { ...item, days: e.target.value } : item
                    );
                    setEditForm({ ...editForm, storage_rules: updated });
                  }}
                  className="w-full border border-slate-200 rounded-2xl px-4 py-3 outline-none focus:border-green-600 focus:ring-2 focus:ring-green-500/20 transition duration-200"
                  required
                />
              ))}

              <div className="flex justify-end gap-3">
                <button
                  type="button"
                  onClick={handleEditClose}
                  className="px-5 py-3 rounded-2xl border border-green-700/30 text-green-800 hover:bg-green-50 font-bold transition duration-200 cursor-pointer bg-white"
                >
                  Batal
                </button>

                <button
                  type="submit"
                  className="px-5 py-3 rounded-2xl bg-orange-500 hover:bg-orange-600 text-white font-bold transition shadow-md shadow-orange-500/10 cursor-pointer"
                >
                  Simpan Perubahan
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}