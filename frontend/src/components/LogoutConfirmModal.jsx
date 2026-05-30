import { motion } from 'framer-motion';
import { LogOut } from 'lucide-react';

export default function LogoutConfirmModal({
  onCancel,
  onConfirm,
  isAdmin = false,
}) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm flex items-center justify-center px-4"
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.94, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ duration: 0.22 }}
        className="bg-white rounded-3xl shadow-2xl w-full max-w-md p-6"
      >
        <div className="flex justify-between items-start gap-4">
          <motion.div
            initial={{ rotate: -8, scale: 0.9 }}
            animate={{ rotate: 0, scale: 1 }}
            transition={{ duration: 0.25 }}
            className="bg-red-100 text-red-600 p-3 rounded-2xl"
          >
            <LogOut size={24} />
          </motion.div>


        </div>

        <h2 className="text-xl font-bold mt-5 text-green-900">Keluar dari Akun?</h2>

        <p className="text-slate-600 mt-2 leading-relaxed">
          Apakah Anda yakin ingin keluar dari {isAdmin ? 'Panel Admin' : 'aplikasi SisaBisa'}? Anda harus masuk kembali untuk mengakses data Anda.
        </p>

        <div className="grid grid-cols-2 gap-3 mt-6">
          <motion.button
            whileTap={{ scale: 0.97 }}
            onClick={onCancel}
            className="border border-green-700/30 text-green-800 py-3 rounded-2xl font-semibold hover:bg-green-50 transition duration-200"
          >
            Batal
          </motion.button>

          <motion.button
            whileTap={{ scale: 0.97 }}
            onClick={onConfirm}
            className="bg-red-500 text-white py-3 rounded-2xl font-semibold hover:bg-red-600 transition duration-200 shadow-md shadow-red-500/10"
          >
            Keluar
          </motion.button>
        </div>
      </motion.div>
    </motion.div>
  );
}
