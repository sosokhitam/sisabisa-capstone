import { useState } from 'react';
import toast from 'react-hot-toast';
import { Mail, KeyRound, Lock, LoaderCircle } from 'lucide-react';
import api from '../../api/axios';

export default function ForgotPassword() {
  const [step, setStep] = useState(1);

  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState('');
  const [newPassword, setNewPassword] = useState('');

  const [loading, setLoading] = useState(false);

  const handleSendOtp = async (e) => {
    e.preventDefault();

    try {
      setLoading(true);

      const response = await api.post(
        '/auth/forgot-password',
        {
          email,
        }
      );

      toast.success(response.data.message);

      setStep(2);
    } catch (error) {
      toast.error(
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

      const response = await api.post(
        '/auth/reset-password',
        {
          email,
          otp,
          new_password: newPassword,
        }
      );

      toast.success(response.data.message);

      setEmail('');
      setOtp('');
      setNewPassword('');

      setStep(1);
    } catch (error) {
      toast.error(
        error.response?.data?.message ||
          'Gagal reset password'
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-yellow-50/20 flex items-center justify-center px-4">
      <div className="bg-white w-full max-w-md rounded-3xl shadow-sm border border-green-100/30 p-6 md:p-8">
        <div className="text-center">
          <div className="bg-green-100 text-green-700 w-16 h-16 rounded-2xl flex items-center justify-center mx-auto shadow-sm shadow-green-700/5">
            <KeyRound size={30} />
          </div>

          <h1 className="text-2xl font-bold mt-4 text-green-900 tracking-tight">
            Lupa Password
          </h1>

          <p className="text-slate-500 mt-2 font-medium">
            {step === 1
              ? 'Masukkan email untuk menerima kode OTP.'
              : 'Masukkan OTP dan password baru.'}
          </p>
        </div>

        {step === 1 ? (
          <form
            onSubmit={handleSendOtp}
            className="space-y-4 mt-6"
          >
            <div>
              <label className="text-sm font-semibold text-slate-600">
                Email
              </label>

              <div className="relative mt-2">
                <Mail
                  size={18}
                  className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
                />

                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) =>
                    setEmail(e.target.value)
                  }
                  placeholder="Masukkan email"
                  className="w-full border border-slate-200 rounded-2xl pl-11 pr-4 py-3 outline-none focus:border-green-600 focus:ring-2 focus:ring-green-500/20 transition duration-200"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-orange-500 hover:bg-orange-600 disabled:bg-slate-400 text-white py-3 rounded-2xl font-bold flex items-center justify-center gap-2 transition duration-200 shadow-md shadow-orange-500/10 cursor-pointer"
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
            className="space-y-4 mt-6"
          >
            <div>
              <label className="text-sm font-semibold text-slate-600">
                OTP
              </label>

              <input
                type="text"
                required
                value={otp}
                onChange={(e) => setOtp(e.target.value)}
                placeholder="Masukkan kode OTP"
                className="w-full border border-slate-200 rounded-2xl px-4 py-3 mt-2 outline-none focus:border-green-600 focus:ring-2 focus:ring-green-500/20 transition duration-200"
              />
            </div>

            <div>
              <label className="text-sm font-semibold text-slate-600">
                Password Baru
              </label>

              <div className="relative mt-2">
                <Lock
                  size={18}
                  className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
                />

                <input
                  type="password"
                  required
                  value={newPassword}
                  onChange={(e) =>
                    setNewPassword(e.target.value)
                  }
                  placeholder="Masukkan password baru"
                  className="w-full border border-slate-200 rounded-2xl pl-11 pr-4 py-3 outline-none focus:border-green-600 focus:ring-2 focus:ring-green-500/20 transition duration-200"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-orange-500 hover:bg-orange-600 disabled:bg-slate-400 text-white py-3 rounded-2xl font-bold flex items-center justify-center gap-2 transition duration-200 shadow-md shadow-orange-500/10 cursor-pointer"
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
      </div>
    </div>
  );
}