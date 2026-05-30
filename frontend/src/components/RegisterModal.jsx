import {
  X,
  Eye,
  EyeOff,
  User,
  Mail,
  LockKeyhole,
  ShieldCheck,
  Loader2,
  ArrowLeft,
} from 'lucide-react';
import { useState } from 'react';
import api from '../api/axios';

const inputCls = 'w-full rounded-2xl border border-slate-200 py-3.5 pl-11 pr-12 outline-none focus:border-green-600 focus:ring-2 focus:ring-green-500/15 transition-all duration-200 text-sm bg-slate-50/50 placeholder:text-slate-400';

export default function RegisterModal({ onClose, onSwitchToLogin }) {
  const [step, setStep] = useState(1);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [message, setMessage] = useState('');
  const [messageType, setMessageType] = useState('info');
  const [loading, setLoading] = useState(false);

  const [form, setForm] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    otp: '',
  });

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
    if (message) setMessage('');
  };

  const showMessage = (text, type = 'error') => {
    setMessage(text);
    setMessageType(type);
  };

  const validateEmail = (email) => {
    const regex = /^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$/;
    if (!regex.test(email.trim())) return 'Format email tidak valid';
    return null;
  };

  const validatePassword = (password) => {
    if (password.length < 8) return 'Password minimal 8 karakter';
    if (!/[A-Za-z]/.test(password)) return 'Password harus mengandung huruf';
    if (!/[0-9]/.test(password)) return 'Password harus mengandung angka';
    return null;
  };

  const handleContinue = (e) => {
    e.preventDefault();

    const emailError = validateEmail(form.email);
    if (emailError) return showMessage(emailError);

    const passwordError = validatePassword(form.password);
    if (passwordError) return showMessage(passwordError);

    if (form.password !== form.confirmPassword) {
      return showMessage('Password dan konfirmasi password tidak sama.');
    }

    setStep(2);
    setMessage('');
  };

  const handleSendOtp = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage('');

    try {
      await api.post('/auth/send-otp', { email: form.email });
      setStep(3);
      showMessage('OTP berhasil dikirim ke email kamu.', 'success');
    } catch (error) {
      showMessage(error.response?.data?.message || 'Gagal mengirim OTP');
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyRegister = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage('');

    try {
      await api.post('/auth/verify-register', {
        name: form.name,
        email: form.email,
        password: form.password,
        otp: form.otp,
      });

      showMessage('Registrasi berhasil. Silakan login.', 'success');
      setTimeout(onClose, 1200);
    } catch (error) {
      showMessage(error.response?.data?.message || 'Registrasi gagal');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 px-4 py-6 backdrop-blur-md overflow-y-auto">
      <div className="relative my-auto w-full max-w-lg overflow-hidden rounded-[2rem] bg-white shadow-2xl shadow-green-950/15 border border-white/60">
        <button
          type="button"
          onClick={onClose}
          className="absolute right-4 top-4 z-10 rounded-full bg-white/90 p-2 text-slate-500 shadow-sm hover:bg-slate-100 hover:text-slate-800 transition"
        >
          <X size={18} />
        </button>

        <div className="relative overflow-hidden bg-gradient-to-br from-[#4A7C2F] via-[#3e6827] to-[#2d4e1c] px-6 pt-7 pb-7 text-white">
          <div className="absolute -right-10 -top-10 w-40 h-40 rounded-full bg-white/8" />
          <div className="absolute -bottom-14 -left-4 w-36 h-36 rounded-full bg-lime-400/12" />

          <div className="relative flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center">
              <img src="/logo.png" className="w-full h-full object-contain" alt="SisaBisa Logo" />
            </div>
            <div>
              <h1 className="text-xl font-extrabold tracking-tight leading-none">Buat Akun SisaBisa</h1>
              <p className="text-sm text-green-100/85 font-medium mt-1">Mulai kelola inventory makananmu.</p>
            </div>
          </div>

          <div className="relative mt-5 grid grid-cols-3 gap-2">
            <StepBadge step={1} current={step} label="Akun" />
            <StepBadge step={2} current={step} label="OTP" />
            <StepBadge step={3} current={step} label="Verifikasi" />
          </div>
        </div>

        <div className="px-6 py-6 max-h-[68vh] overflow-y-auto">
          {step === 1 && (
            <form onSubmit={handleContinue} className="space-y-4">
              <FieldWrapper label="Nama Lengkap" icon={User}>
                <input name="name" placeholder="Nama lengkap" value={form.name} onChange={handleChange} className={inputCls} required />
              </FieldWrapper>

              <FieldWrapper label="Email Aktif" icon={Mail}>
                <input name="email" type="email" placeholder="nama@email.com" value={form.email} onChange={handleChange} className={inputCls} required />
              </FieldWrapper>

              <PasswordField label="Password" name="password" value={form.password} placeholder="Minimal 8 karakter" show={showPassword} onToggle={() => setShowPassword(!showPassword)} onChange={handleChange} />
              <PasswordField label="Konfirmasi Password" name="confirmPassword" value={form.confirmPassword} placeholder="Ulangi password" show={showConfirmPassword} onToggle={() => setShowConfirmPassword(!showConfirmPassword)} onChange={handleChange} />

              <MessageBox message={message} type={messageType} />

              <button className="w-full rounded-2xl bg-[#FFA02E] hover:bg-[#e08316] py-3.5 font-bold text-white transition-all duration-200 shadow-md shadow-orange-400/20 hover:-translate-y-0.5 hover:shadow-lg cursor-pointer text-sm">
                Lanjutkan
              </button>

              <div className="mt-5 text-center text-xs text-slate-500 font-medium">
                Sudah punya akun?{' '}
                <button
                  type="button"
                  onClick={onSwitchToLogin}
                  className="font-bold text-green-700 hover:underline cursor-pointer"
                >
                  Masuk
                </button>
              </div>
            </form>
          )}

          {step === 2 && (
            <form onSubmit={handleSendOtp} className="space-y-4">
              <div className="rounded-2xl bg-green-50 border border-green-100/60 p-5">
                <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">Kode OTP dikirim ke:</p>
                <p className="font-bold text-green-700 break-all text-sm">{form.email}</p>
              </div>

              <MessageBox message={message} type={messageType} />

              <button disabled={loading} className="inline-flex w-full items-center justify-center gap-2 rounded-2xl bg-[#FFA02E] hover:bg-[#e08316] py-3.5 font-bold text-white disabled:bg-slate-300 disabled:cursor-not-allowed transition-all duration-200 shadow-md shadow-orange-400/20 hover:-translate-y-0.5 cursor-pointer text-sm">
                {loading && <Loader2 size={17} className="animate-spin" />}
                {loading ? 'Mengirim OTP...' : 'Kirim OTP'}
              </button>

              <button type="button" onClick={() => setStep(1)} className="inline-flex w-full items-center justify-center gap-2 rounded-2xl border border-green-700/25 py-3 font-bold text-green-800 hover:bg-green-50 transition-all duration-200 cursor-pointer text-sm">
                <ArrowLeft size={17} />
                Ubah Data
              </button>
            </form>
          )}

          {step === 3 && (
            <form onSubmit={handleVerifyRegister} className="space-y-4">
              <FieldWrapper label="Kode OTP" icon={ShieldCheck}>
                <input name="otp" placeholder="Masukkan kode OTP" value={form.otp} onChange={handleChange} className={inputCls} required />
              </FieldWrapper>

              <MessageBox message={message} type={messageType} />

              <button disabled={loading} className="inline-flex w-full items-center justify-center gap-2 rounded-2xl bg-[#FFA02E] hover:bg-[#e08316] py-3.5 font-bold text-white disabled:bg-slate-300 disabled:cursor-not-allowed transition-all duration-200 shadow-md shadow-orange-400/20 hover:-translate-y-0.5 cursor-pointer text-sm">
                {loading && <Loader2 size={17} className="animate-spin" />}
                {loading ? 'Memverifikasi...' : 'Verifikasi & Daftar'}
              </button>

              <button type="button" onClick={() => setStep(2)} className="inline-flex w-full items-center justify-center gap-2 rounded-2xl border border-green-700/25 py-3 font-bold text-green-800 hover:bg-green-50 transition-all duration-200 cursor-pointer text-sm">
                <ArrowLeft size={17} />
                Kembali
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}

function StepBadge({ step, current, label }) {
  const isDone   = current > step;
  const isActive = current === step;
  return (
    <div className={`rounded-xl px-3 py-2 text-center text-xs font-bold transition-all duration-300 flex items-center justify-center gap-1.5 ${
      isActive ? 'bg-white text-green-800 shadow-sm' :
      isDone   ? 'bg-white/30 text-white border border-white/30' :
                 'bg-white/10 text-green-200/60 border border-white/10'
    }`}>
      {isDone && <span>✓</span>}
      {label}
    </div>
  );
}

function FieldWrapper({ label, icon: Icon, children }) {
  return (
    <div>
      <label className="block text-xs font-bold text-slate-600 mb-2 uppercase tracking-wider">{label}</label>
      <div className="relative">
        <Icon size={17} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
        {children}
      </div>
    </div>
  );
}

function PasswordField({ label, name, value, placeholder, show, onToggle, onChange }) {
  return (
    <div>
      <label className="block text-xs font-bold text-slate-600 mb-2 uppercase tracking-wider">{label}</label>
      <div className="relative">
        <LockKeyhole size={17} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
        <input name={name} type={show ? 'text' : 'password'} placeholder={placeholder} value={value} onChange={onChange} className={inputCls} required />
        <button type="button" onClick={onToggle} className="absolute right-3 top-1/2 -translate-y-1/2 rounded-xl p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-700 transition-colors">
          {show ? <EyeOff size={17} /> : <Eye size={17} />}
        </button>
      </div>
    </div>
  );
}

function MessageBox({ message, type }) {
  if (!message) return null;

  return (
    <div
      className={`rounded-2xl border px-4 py-3 text-sm font-medium ${
        type === 'success'
          ? 'border-green-100 bg-green-50 text-green-700'
          : 'border-red-100 bg-red-50 text-red-700'
      }`}
    >
      {message}
    </div>
  );
}