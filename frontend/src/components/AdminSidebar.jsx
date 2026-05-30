import { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  LayoutDashboard,
  LogOut,
  X,
  PackageSearch,
  ShieldCheck,
} from 'lucide-react';
import { useAuth } from '../context/auth';
import LogoutConfirmModal from './LogoutConfirmModal';

export default function AdminSidebar({ isOpen = false, onClose }) {
  const location  = useLocation();
  const navigate  = useNavigate();
  const { logout, user } = useAuth();
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);

  const navItems = [
    { label: 'Dashboard Admin',       path: '/admin',             icon: LayoutDashboard },
    { label: 'Ingredient Management', path: '/admin/ingredients', icon: PackageSearch   },
  ];

  const handleLogout = () => {
    setShowLogoutConfirm(true);
  };

  const confirmLogout = () => {
    setShowLogoutConfirm(false);
    logout();
    if (onClose) onClose();
    navigate('/');
  };

  return (
    <>
      <AnimatePresence>
        {isOpen && (
          <motion.button
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            onClick={onClose}
            className="md:hidden fixed inset-0 bg-black/40 backdrop-blur-sm z-40"
            aria-label="Tutup sidebar"
          />
        )}
      </AnimatePresence>

      <aside
        className={`fixed left-0 top-0 h-screen w-72 md:w-64 flex flex-col z-50 transform transition-transform duration-300 ease-out
          bg-gradient-to-b from-white via-[#f6fdf4] to-[#eef9e9]
          border-r border-green-100/70 shadow-2xl md:shadow-none
          ${isOpen ? 'translate-x-0' : '-translate-x-full'} md:translate-x-0`}
      >
        {/* ── Logo header ── */}
        <div className="h-[4.5rem] flex items-center justify-between px-5 border-b border-green-100/50">
          <div className="flex items-center gap-3">
            <motion.div
              whileHover={{ scale: 1.08, rotate: -8 }}
              transition={{ type: 'spring', stiffness: 400, damping: 17 }}
              className="w-11 h-11 flex items-center justify-center cursor-pointer"
            >
              <img src="/logo.png" className="w-full h-full object-contain" alt="SisaBisa Logo" />
            </motion.div>

            <div>
              <h1 className="font-extrabold text-xl tracking-tight text-green-700 leading-none">SisaBisa</h1>
              <div className="flex items-center gap-1.5 mt-1">
                <ShieldCheck size={10} className="text-orange-500" />
                <p className="text-[10px] text-orange-600 font-bold uppercase tracking-widest">Admin Panel</p>
              </div>
            </div>
          </div>

          <button
            onClick={onClose}
            className="md:hidden bg-slate-100 hover:bg-slate-200 p-2 rounded-xl transition-colors"
          >
            <X size={18} />
          </button>
        </div>

        {/* ── Navigation ── */}
        <nav className="flex-1 px-3 py-5 space-y-1 overflow-y-auto">
          <p className="text-[10px] font-extrabold uppercase tracking-widest text-slate-400/80 px-3 mb-4">Admin Menu</p>

          {navItems.map((item, index) => {
            const Icon   = item.icon;
            const active = location.pathname === item.path;

            return (
              <motion.div
                key={item.path}
                initial={{ opacity: 0, x: -14 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.22, delay: index * 0.06 }}
              >
                <Link
                  to={item.path}
                  onClick={onClose}
                  className={`group relative flex items-center gap-3.5 px-4 py-3.5 rounded-2xl font-semibold transition-all duration-200 overflow-hidden ${
                    active
                      ? 'bg-gradient-to-r from-green-700/12 to-lime-500/10 text-green-800 shadow-sm'
                      : 'text-slate-500 hover:text-green-700 hover:bg-green-50/70'
                  }`}
                >
                  {active && (
                    <motion.div
                      layoutId="activeAdminSidebar"
                      className="absolute left-0 top-2.5 bottom-2.5 w-[3px] rounded-r-full bg-gradient-to-b from-orange-500 to-orange-400"
                    />
                  )}

                  <div className={`transition-colors duration-200 ${
                    active ? 'text-green-700' : 'text-slate-400 group-hover:text-green-600'
                  }`}>
                    <Icon size={20} />
                  </div>

                  <span className="text-[14px] font-semibold">{item.label}</span>

                  {active && (
                    <div className="ml-auto w-1.5 h-1.5 rounded-full bg-orange-500 shadow-sm shadow-orange-500/50" />
                  )}
                </Link>
              </motion.div>
            );
          })}
        </nav>

        {/* ── User & Logout ── */}
        <div className="p-3 border-t border-green-100/50 space-y-2">
          {user && (
            <div className="flex items-center gap-3 px-3 py-3 rounded-2xl bg-orange-50/60 border border-orange-100/40">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-orange-500 to-orange-400 text-white flex items-center justify-center text-sm font-extrabold flex-shrink-0 shadow-md shadow-orange-500/20">
                {user.name?.[0]?.toUpperCase() || 'A'}
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-bold text-green-900 text-sm truncate leading-none">{user.name}</p>
                <p className="text-[10px] text-orange-600 font-bold uppercase tracking-wider mt-0.5">Administrator</p>
              </div>
            </div>
          )}

          <button
            onClick={handleLogout}
            className="group w-full flex items-center gap-3 px-4 py-3 rounded-2xl text-slate-500 hover:text-red-600 hover:bg-red-50 font-semibold transition-all duration-200"
          >
            <LogOut size={18} className="group-hover:translate-x-0.5 transition-transform duration-200" />
            <span className="text-sm">Keluar</span>
          </button>
        </div>
      </aside>

      <AnimatePresence>
        {showLogoutConfirm && (
          <LogoutConfirmModal
            onCancel={() => setShowLogoutConfirm(false)}
            onConfirm={confirmLogout}
            isAdmin={true}
          />
        )}
      </AnimatePresence>
    </>
  );
}