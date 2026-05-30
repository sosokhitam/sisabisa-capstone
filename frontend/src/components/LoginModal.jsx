import { X, Eye, EyeOff, Mail, LockKeyhole, Loader2 } from 'lucide-react';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api/axios';
import { useAuth } from '../context/AuthContext';
import ForgotPasswordModal from './ForgotPasswordModal';

export default function LoginModal({ onClose, onSwitchToRegister }) {
  const navigate = useNavigate();
  const { login } = useAuth();

  const [showPassword, setShowPassword]           = useState(false);
  const [showForgotPassword, setShowForgotPassword] = useState(false);
  const [form, setForm]                           = useState({ email: '', password: '' });
  const [message, setMessage]                     = useState('');
  const [loading, setLoading]                     = useState(false);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
    if (message) setMessage('');
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage('');
    try {
      const response = await api.post('/auth/login', form);
      login(response.data.user, response.data.token);
      onClose();
      navigate(response.data.user.role === 'admin' ? '/admin' : '/dashboard');
    } catch (error) {
      setMessage(error.response?.data?.message || 'Login gagal. Periksa email dan password kamu.');
    } finally {
      setLoading(false);
    }
  };

  const inputCls = 'w-full rounded-2xl border border-slate-200 py-3.5 pl-11 pr-4 outline-none focus:border-green-600 focus:ring-2 focus:ring-green-500/15 transition-all duration-200 text-sm bg-slate-50/50 placeholder:text-slate-400';

  return (
    <>
      <div className="fixed inset-0 z-50 flex items-center justify-center px-4 py-6 overflow-y-auto bg-slate-950/60 backdrop-blur-md">
        <div className="relative my-auto w-full max-w-[420px] overflow-hidden rounded-[2rem] bg-white shadow-2xl shadow-green-950/15 border border-white/60">

          {/* Close button */}
          <button
            type="button"
            onClick={onClose}
            className="absolute right-4 top-4 z-10 rounded-full bg-white/90 p-2 text-slate-400 shadow-sm hover:bg-slate-100 hover:text-slate-700 transition-all duration-200"
          >
            <X size={17} />
          </button>

          {/* Header */}
          <div className="relative overflow-hidden bg-gradient-to-br from-[#4A7C2F] via-[#3e6827] to-[#2d4e1c] px-6 pt-7 pb-7 text-white">
            <div className="absolute -right-10 -top-10 w-40 h-40 rounded-full bg-white/8" />
            <div className="absolute -bottom-14 -left-4 w-36 h-36 rounded-full bg-lime-400/12" />

            <div className="relative flex items-center gap-3">
              <div className="flex h-12 w-12 items-center justify-center">
                <img src="/logo.png" className="w-full h-full object-contain" alt="SisaBisa Logo" />
              </div>
              <div>
                <h1 className="text-xl font-extrabold tracking-tight leading-none">Masuk ke SisaBisa</h1>
                <p className="text-sm text-green-100/85 font-medium mt-1">Kelola inventory makananmu.</p>
              </div>
            </div>
          </div>

          {/* Form */}
          <div className="px-6 py-6">
            <form onSubmit={handleLogin} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-600 mb-2 uppercase tracking-wider">Email</label>
                <div className="relative">
                  <Mail size={17} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
                  <input type="email" name="email" placeholder="nama@email.com" value={form.email} onChange={handleChange} className={inputCls} required />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-600 mb-2 uppercase tracking-wider">Password</label>
                <div className="relative">
                  <LockKeyhole size={17} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    name="password"
                    placeholder="Masukkan password"
                    value={form.password}
                    onChange={handleChange}
                    className={`${inputCls} pr-12`}
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 rounded-xl p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-700 transition-colors"
                  >
                    {showPassword ? <EyeOff size={17} /> : <Eye size={17} />}
                  </button>
                </div>
                <div className="mt-2 flex justify-end">
                  <button
                    type="button"
                    onClick={() => setShowForgotPassword(true)}
                    className="text-xs font-bold text-green-700 hover:underline"
                  >
                    Lupa Password?
                  </button>
                </div>
              </div>

              {message && (
                <div className="rounded-2xl border border-red-100 bg-red-50 px-4 py-3 text-sm font-medium text-red-700">
                  {message}
                </div>
              )}

              <button
                type="submit"
                disabled={loading}
                className="inline-flex w-full items-center justify-center gap-2 rounded-2xl bg-[#FFA02E] hover:bg-[#e08316] py-3.5 font-bold text-white disabled:bg-slate-300 disabled:cursor-not-allowed transition-all duration-200 shadow-md shadow-orange-400/20 hover:-translate-y-0.5 hover:shadow-lg cursor-pointer text-sm"
              >
                {loading && <Loader2 size={17} className="animate-spin" />}
                {loading ? 'Masuk...' : 'Masuk ke Akun'}
              </button>

              <div className="mt-5 text-center text-xs text-slate-500 font-medium">
                Belum punya akun?{' '}
                <button
                  type="button"
                  onClick={onSwitchToRegister}
                  className="font-bold text-green-700 hover:underline cursor-pointer"
                >
                  Register
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>

      {showForgotPassword && (
        <ForgotPasswordModal onClose={() => setShowForgotPassword(false)} />
      )}
    </>
  );
}