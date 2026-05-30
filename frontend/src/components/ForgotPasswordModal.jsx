import { useState } from 'react';
import {
  X,
  Mail,
  Lock,
  KeyRound,
  LoaderCircle,
} from 'lucide-react';
import api from '../api/axios';

export default function ForgotPasswordModal({
  onClose,
}) {
  const [step, setStep] = useState(1);

  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState('');
  const [newPassword, setNewPassword] =
    useState('');

  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');

  const handleSendOtp = async (e) => {
    e.preventDefault();

    try {
      setLoading(true);
      setMessage('');

      const response = await api.post(
        '/auth/forgot-password',
        {
          email,
        }
      );

      setMessage(response.data.message);
      setStep(2);
    } catch (error) {
      setMessage(
        error.response?.data?.message ||
          'Gagal mengirim OTP'
      );
    } finally {
      setLoading(false);
    }
  };

  const handleResetPassword = async (e) => {
    e.preventDefault();

    try {
      setLoading(true);
      setMessage('');

      const response = await api.post(
        '/auth/reset-password',
        {
          email,
          otp,
          new_password: newPassword,
        }
      );

      setMessage(response.data.message);

      setTimeout(() => {
        onClose();
      }, 1500);
    } catch (error) {
      setMessage(
        error.response?.data?.message ||
          'Reset password gagal'
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[60] bg-black/50 flex items-center justify-center px-4 backdrop-blur-sm">
      <div className="relative w-full max-w-md bg-white rounded-3xl shadow-xl p-6">
        <button
          onClick={onClose}
          className="absolute right-4 top-4 text-slate-500 hover:text-slate-800 hover:bg-slate-100 p-2.5 rounded-full transition-all duration-200"
        >
          <X size={18} />
        </button>

        <div className="flex items-center gap-3">
          <div className="bg-green-100 text-green-700 p-3 rounded-2xl">
            <KeyRound size={22} />
          </div>

          <div>
            <h1 className="text-2xl font-bold text-green-900 tracking-tight">
              Lupa Password
            </h1>

            <p className="text-sm text-slate-500 font-medium">
              {step === 1
                ? 'Kirim OTP reset password'
                : 'Masukkan OTP dan password baru'}
            </p>
          </div>
        </div>

        {step === 1 ? (
          <form
            onSubmit={handleSendOtp}
            className="mt-6 space-y-4"
          >
            <div className="relative">
              <Mail
                size={18}
                className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
              />

              <input
                type="email"
                placeholder="Masukkan email"
                value={email}
                onChange={(e) =>
                  setEmail(e.target.value)
                }
                className="w-full border border-slate-200 rounded-2xl py-3 pl-11 pr-4 outline-none focus:border-green-600 focus:ring-2 focus:ring-green-500/20 transition-all duration-200"
                required
              />
            </div>

            <button
              disabled={loading}
              className="w-full bg-orange-500 hover:bg-orange-600 text-white py-3 rounded-2xl font-bold disabled:bg-slate-400 flex items-center justify-center gap-2 transition duration-200 shadow-md shadow-orange-500/10 cursor-pointer"
            >
              {loading && (
                <LoaderCircle
                  size={18}
                  className="animate-spin"
                />
              )}

              Kirim OTP
            </button>
          </form>
        ) : (
          <form
            onSubmit={handleResetPassword}
            className="mt-6 space-y-4"
          >
            <input
              type="text"
              placeholder="Kode OTP"
              value={otp}
              onChange={(e) =>
                setOtp(e.target.value)
              }
              className="w-full border border-slate-200 rounded-2xl py-3 px-4 outline-none focus:border-green-600 focus:ring-2 focus:ring-green-500/20 transition-all duration-200"
              required
            />

            <div className="relative">
              <Lock
                size={18}
                className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
              />

              <input
                type="password"
                placeholder="Password baru"
                value={newPassword}
                onChange={(e) =>
                  setNewPassword(e.target.value)
                }
                className="w-full border border-slate-200 rounded-2xl py-3 pl-11 pr-4 outline-none focus:border-green-600 focus:ring-2 focus:ring-green-500/20 transition-all duration-200"
                required
              />
            </div>

            <button
              disabled={loading}
              className="w-full bg-orange-500 hover:bg-orange-600 text-white py-3 rounded-2xl font-bold disabled:bg-slate-400 flex items-center justify-center gap-2 transition duration-200 shadow-md shadow-orange-500/10 cursor-pointer"
            >
              {loading && (
                <LoaderCircle
                  size={18}
                  className="animate-spin"
                />
              )}

              Reset Password
            </button>
          </form>
        )}

        {message && (
          <p className="mt-4 text-sm text-center text-green-700 font-semibold bg-green-50 py-2.5 rounded-2xl border border-green-100">
            {message}
          </p>
        )}
      </div>
    </div>
  );
}