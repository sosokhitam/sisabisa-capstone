import { useState, useEffect } from 'react';
import {
  Leaf,
  Bell,
  ChefHat,
  Sparkles,
  PackageCheck,
  Recycle,
  Clock,
  MailCheck,
  ShieldCheck,
  TrendingDown,
} from 'lucide-react';
import RegisterModal from '../../components/RegisterModal';
import LoginModal from '../../components/LoginModal';
import ExpiryChecker from './ExpiryChecker';

export default function Home() {
  const [showRegister, setShowRegister] = useState(false);
  const [showLogin, setShowLogin] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  return (
    <div className="min-h-screen bg-[#f8fdf5] text-slate-800 overflow-x-hidden">

      {/* ── NAVBAR ─────────────────────────────── */}
      <header
        className={`fixed top-0 left-0 right-0 z-40 transition-[background-color,border-color,box-shadow] duration-300 ${scrolled
            ? 'bg-white/85 backdrop-blur-xl border-b border-green-100/50 shadow-sm'
            : 'bg-white/50 backdrop-blur-md border-b border-transparent'
        }`}
      >
        <div className="max-w-7xl mx-auto px-4 md:px-8 h-16 sm:h-20 flex items-center justify-between">
          <button
            onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
            className="flex items-center gap-2.5 sm:gap-3 group outline-none"
          >
            <div className="h-10 w-10 sm:h-11 sm:w-11 flex items-center justify-center group-hover:scale-105 transition-all duration-300">
              <img src="/logo.png" className="w-full h-full object-contain" alt="SisaBisa Logo" />
            </div>
            <div className="text-left">
              <h1 className="font-extrabold text-xl sm:text-[1.35rem] text-green-700 tracking-tight leading-none">
                SisaBisa
              </h1>
              <p className="hidden sm:block text-[10px] text-slate-400 font-bold mt-0.5 tracking-widest uppercase">
                AI Food Intelligence
              </p>
            </div>
          </button>

          <nav className="flex items-center gap-2 sm:gap-3">
            <button
              onClick={() => setShowLogin(true)}
              className="px-4 py-2 rounded-xl font-semibold text-slate-600 hover:text-green-700 hover:bg-green-50 transition-all duration-200 text-sm sm:text-[15px] cursor-pointer"
            >
              Masuk
            </button>
            <button
              onClick={() => setShowRegister(true)}
              className="bg-[#FFA02E] hover:bg-[#e08316] active:scale-[0.97] text-white px-4 sm:px-5 py-2.5 rounded-xl font-bold transition-all duration-200 shadow-md shadow-orange-400/20 hover:shadow-lg hover:shadow-orange-400/25 hover:-translate-y-0.5 text-sm sm:text-[15px] cursor-pointer"
            >
              Mulai Gratis
            </button>
          </nav>
        </div>
      </header>

      <main className="pt-16 sm:pt-20">
        {/* ── HERO ───────────────────────────────── */}
        <section className="relative overflow-hidden min-h-[90vh] flex items-center">
          {/* Decorative blobs */}
          <div className="pointer-events-none absolute inset-0 -z-10">
            <div className="absolute -top-32 -left-32 w-[600px] h-[600px] rounded-full bg-[radial-gradient(circle,rgba(154,216,114,0.22),transparent_65%)]" />
            <div className="absolute -bottom-24 -right-24 w-[700px] h-[700px] rounded-full bg-[radial-gradient(circle,rgba(255,239,145,0.28),transparent_60%)]" />
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[400px] h-[400px] rounded-full bg-[radial-gradient(circle,rgba(74,124,47,0.06),transparent_70%)]" />
          </div>

          <div className="max-w-7xl mx-auto px-4 md:px-8 py-16 md:py-20 grid grid-cols-1 lg:grid-cols-2 gap-14 lg:gap-20 items-center w-full">

            {/* Left */}
            <div className="space-y-7">
              {/* Floating badge */}
              <div className="inline-flex items-center gap-2 bg-green-100/90 text-green-800 px-4 py-2 rounded-full text-sm font-bold border border-green-200/60 shadow-sm backdrop-blur-sm animate-fade-up">
                <Sparkles size={14} className="text-green-600 animate-pulse" />
                AI-Powered Food Intelligence
              </div>

              {/* Headline */}
              <div className="animate-fade-up" style={{ animationDelay: '80ms' }}>
                <h2 className="text-[2.6rem] sm:text-5xl md:text-[3.5rem] font-extrabold leading-[1.1] tracking-tight text-[#1a2d11]">
                  Kelola bahan makanan{' '}
                  <span className="bg-gradient-to-r from-green-700 to-lime-500 bg-clip-text text-transparent">
                    sebelum
                  </span>{' '}
                  terbuang sia-sia.
                </h2>
              </div>

              {/* Subtitle */}
              <p className="text-base md:text-[1.1rem] leading-relaxed text-slate-500 max-w-xl font-medium animate-fade-up" style={{ animationDelay: '160ms' }}>
                SisaBisa membantu mencatat bahan, memantau masa kedaluwarsa,
                mengirim pengingat email, dan merekomendasikan resep dari AI
                berdasarkan bahan yang hampir expired.
              </p>

              {/* CTAs */}
              <div className="flex flex-col sm:flex-row gap-3 animate-fade-up" style={{ animationDelay: '240ms' }}>
                <button
                  onClick={() => setShowRegister(true)}
                  className="group inline-flex items-center justify-center gap-2.5 bg-[#FFA02E] hover:bg-[#e08316] text-white px-7 py-4 rounded-2xl font-bold transition-all duration-300 shadow-lg shadow-orange-400/25 hover:shadow-xl hover:shadow-orange-400/30 hover:-translate-y-1.5 cursor-pointer"
                >
                  Mulai Sekarang
                </button>

                <button
                  onClick={() => setShowLogin(true)}
                  className="inline-flex items-center justify-center gap-2 bg-white/90 border border-green-700/20 text-green-800 hover:bg-green-50 hover:border-green-700/40 px-7 py-4 rounded-2xl font-bold transition-all duration-300 hover:-translate-y-0.5 shadow-sm cursor-pointer"
                >
                  Masuk ke Akun
                </button>
              </div>

              {/* Stats row */}
              <div className="flex flex-wrap gap-3 animate-fade-up" style={{ animationDelay: '320ms' }}>
                <HeroBadge value="3" label="Mode Penyimpanan" />
                <HeroBadge value="AI" label="Resep Cerdas" />
                <HeroBadge value="Email" label="Reminder Otomatis" />
              </div>
            </div>

            {/* Right — ExpiryChecker card */}
            <div className="relative animate-fade-up" style={{ animationDelay: '200ms' }}>
              {/* Ambient glow */}
              <div className="absolute -inset-8 rounded-[3rem] bg-gradient-to-br from-green-300/18 via-lime-200/10 to-yellow-200/14 blur-3xl" />

              {/* Glass card */}
              <div className="relative glass-card rounded-[2rem] shadow-2xl shadow-green-900/8 p-6 md:p-8 overflow-hidden">
                {/* Inner gradient accent */}
                <div className="absolute -top-12 -right-12 w-40 h-40 rounded-full bg-lime-400/15 blur-2xl" />

                <div className="relative">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="inline-block w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                    <span className="text-[10px] font-extrabold text-green-600 uppercase tracking-widest">Live Demo</span>
                  </div>
                  <h3 className="text-2xl md:text-3xl font-extrabold text-green-950 mt-1 mb-1 tracking-tight">
                    Cek Estimasi Kedaluwarsa
                  </h3>
                  <p className="text-slate-500 text-sm mb-6 font-medium">
                    Cari bahan, pilih penyimpanan, lihat estimasi expired.
                  </p>
                  <ExpiryChecker compact />
                </div>
              </div>

              {/* Floating badge */}
              <div className="absolute -top-5 -right-3 sm:-right-6 bg-white rounded-2xl px-4 py-2.5 shadow-xl border border-green-100 flex items-center gap-2 animate-float">
                <span className="inline-block w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                <span className="text-xs font-bold text-green-700">AI Aktif</span>
              </div>

              {/* Floating eco badge */}
              <div className="absolute -bottom-5 -left-3 sm:-left-6 bg-white rounded-2xl px-4 py-2.5 shadow-xl border border-yellow-100 flex items-center gap-2 animate-float-slow">
                <span className="text-base">🌱</span>
                <span className="text-xs font-bold text-green-700">Eco-Friendly</span>
              </div>
            </div>
          </div>
        </section>

        {/* ── HOW IT WORKS ───────────────────────── */}
        <section className="bg-[#FFEF91]/20 py-16 md:py-24 border-y border-yellow-200/40 overflow-hidden">
          <div className="max-w-7xl mx-auto px-4 md:px-8">
            <div className="text-center mb-14">
              <p className="text-green-700 font-extrabold text-xs uppercase tracking-widest mb-3">Cara Kerja</p>
              <h2 className="text-3xl md:text-4xl font-extrabold text-[#1a2d11] tracking-tight">
                Dari pantau ke aksi, dalam 4 langkah.
              </h2>
              <p className="mt-4 text-slate-500 text-base max-w-xl mx-auto leading-relaxed">
                Alur kerja SisaBisa dirancang sesederhana mungkin agar kamu langsung bisa mulai.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
              <StepCard step="01" icon={PackageCheck} iconBg="bg-green-700" title="Track" subtitle="Catat Bahan" description="Tambahkan bahan makanan dengan jumlah, satuan, dan mode penyimpanan." />
              <StepCard step="02" icon={Clock} iconBg="bg-yellow-500" title="Predict" subtitle="Estimasi Expired" description="Sistem menghitung otomatis kapan bahan kamu akan kedaluwarsa berdasarkan storage rules." />
              <StepCard step="03" icon={ChefHat} iconBg="bg-orange-500" title="Recommend" subtitle="Resep dari AI" description="AI merekomendasikan resep terbaik berdasarkan bahan yang hampir expired." />
              <StepCard step="04" icon={TrendingDown} iconBg="bg-green-600" title="Reduce" subtitle="Kurangi Waste" description="Bahan terpakai tepat waktu. Food waste berkurang dan dompet lebih hemat." />
            </div>
          </div>
        </section>

        {/* ── FEATURES SECTION ───────────────────── */}
        <section className="max-w-7xl mx-auto px-4 md:px-8 py-16 md:py-24">
          <div className="text-center max-w-2xl mx-auto mb-14">
            <p className="text-green-700 font-extrabold text-xs uppercase tracking-widest mb-3">Fitur Unggulan</p>
            <h2 className="text-3xl md:text-4xl font-extrabold text-[#1a2d11] tracking-tight mb-4">
              Satu platform, semua yang kamu butuhkan.
            </h2>
            <p className="text-slate-500 leading-relaxed">
              Dirancang untuk membantu kamu mengelola bahan makanan secara cerdas, mencegah pemborosan, dan memasak lebih efisien.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-5 md:gap-6">
            <FeatureCard
              icon={PackageCheck}
              badge="Inventory"
              title="Smart Food Inventory"
              description="Simpan bahan makanan berdasarkan jumlah, satuan, storage, dan tanggal pembelian. Semua terorganisir dalam satu dashboard bersih."
            />
            <FeatureCard
              icon={Bell}
              badge="Notifikasi"
              title="Email Reminder Otomatis"
              description="Dapatkan notifikasi email sebelum bahan kedaluwarsa. Tidak ada lagi bahan yang terbuang karena lupa."
              featured
            />
            <FeatureCard
              icon={ChefHat}
              badge="AI"
              title="Rekomendasi Resep AI"
              description="AI menganalisis inventory kamu dan merekomendasikan resep paling tepat berdasarkan bahan yang ada."
            />
          </div>
        </section>

        {/* ── STATS STRIP ────────────────────────── */}
        <section className="bg-gradient-to-r from-green-700 via-green-600 to-green-700 py-14 md:py-18 overflow-hidden relative">
          <div className="absolute inset-0 opacity-10">
            <div className="absolute top-0 left-1/4 w-64 h-64 rounded-full bg-lime-400 blur-3xl" />
            <div className="absolute bottom-0 right-1/4 w-64 h-64 rounded-full bg-yellow-400 blur-3xl" />
          </div>
          <div className="relative max-w-7xl mx-auto px-4 md:px-8">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-10 text-white text-center divide-y sm:divide-y-0 sm:divide-x divide-white/20">
              <StatItem value="3" label="Mode Penyimpanan" sub="Kulkas, Freezer & Suhu Ruang" />
              <StatItem value="AI" label="Rekomendasi Resep" sub="Powered by Google Gemini" />
              <StatItem value="100%" label="Gratis Digunakan" sub="Tanpa biaya tersembunyi apapun" />
            </div>
          </div>
        </section>

        {/* ── BENEFITS + CTA ─────────────────────── */}
        <section className="max-w-7xl mx-auto px-4 md:px-8 py-16 md:py-24">
          <div className="grid grid-cols-1 lg:grid-cols-[1fr_1.05fr] gap-6 items-stretch">

            {/* Left — Green CTA card */}
            <div className="rounded-[2rem] bg-gradient-to-br from-[#4A7C2F] via-[#3a6024] to-[#253818] text-white p-8 md:p-10 relative overflow-hidden">
              <div className="absolute -right-20 -top-20 w-64 h-64 rounded-full bg-white/7" />
              <div className="absolute -bottom-28 right-10 w-72 h-72 rounded-full bg-white/5" />
              <div className="absolute top-1/2 -left-10 w-40 h-40 rounded-full bg-lime-400/12" />

              <div className="relative">
                <div className="inline-flex items-center gap-2 text-lime-300 font-bold text-sm mb-6">
                  <Recycle size={16} />
                  Reduce Food Waste
                </div>

                <h3 className="text-3xl md:text-[2.2rem] font-extrabold leading-tight tracking-tight mb-5">
                  Bahan lebih terpantau, makanan tidak mudah terbuang.
                </h3>

                <p className="text-green-100/85 leading-relaxed text-sm md:text-base mb-8 font-medium">
                  SisaBisa membantu membangun kebiasaan menyimpan dan memakai
                  bahan makanan secara bijak, sehingga kamu bisa menghemat sekaligus
                  berkontribusi pada lingkungan yang lebih bersih.
                </p>


              </div>
            </div>

            {/* Right — Benefit cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <BenefitCard icon={ShieldCheck} title="Data Bahan Terkontrol" text="Ingredient master dikelola admin agar data penyimpanan lebih konsisten dan akurat." />
              <BenefitCard icon={MailCheck} title="Reminder Otomatis" text="Pengguna bisa segera tahu bahan mana yang perlu diprioritaskan sebelum terbuang." />
              <BenefitCard icon={Leaf} title="Ramah Lingkungan" text="Setiap bahan yang tidak terbuang adalah langkah nyata mengurangi limbah makanan." />
              <BenefitCard icon={ChefHat} title="Lebih Praktis" text="Rekomendasi resep AI membantu pengguna memanfaatkan bahan yang tersedia dengan mudah." />
            </div>
          </div>
        </section>

        {/* ── BOTTOM CTA ─────────────────────────── */}
        <section className="relative overflow-hidden bg-gradient-to-br from-[#151f0d] via-[#1a2d11] to-[#1f3614] py-20 md:py-28">
          <div className="pointer-events-none absolute inset-0">
            <div className="absolute top-[-30%] left-[15%] w-[500px] h-[500px] rounded-full bg-green-800/25 blur-3xl" />
            <div className="absolute bottom-[-20%] right-[10%] w-[400px] h-[400px] rounded-full bg-lime-900/20 blur-3xl" />
            <div className="absolute top-1/2 left-[60%] w-[300px] h-[300px] rounded-full bg-yellow-900/10 blur-3xl" />
          </div>
          <div className="relative z-10 max-w-2xl mx-auto px-4 md:px-8 text-center text-white">
            <div className="inline-flex items-center gap-2 bg-white/10 border border-white/15 text-green-200 px-5 py-2.5 rounded-full text-sm font-bold mb-8">
              <Sparkles size={14} className="animate-pulse" />
              Mulai hari ini, gratis selamanya
            </div>
            <h2 className="text-4xl md:text-5xl font-extrabold leading-tight tracking-tight mb-6">
              Kurangi food waste, mulai dari dapur kamu.
            </h2>
            <p className="text-green-200/75 text-base md:text-lg leading-relaxed mb-10 font-medium">
              Bergabunglah dan mulai kelola bahan makanan secara lebih cerdas dengan bantuan AI.
            </p>

          </div>
        </section>

        {/* ── FOOTER ─────────────────────────────── */}
        <footer className="bg-[#111910] border-t border-green-950/50 py-8">
          <div className="max-w-7xl mx-auto px-4 md:px-8 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-2.5">
              <div className="h-8 w-8 flex items-center justify-center">
                <img src="/logo.png" className="w-full h-full object-contain" alt="SisaBisa Logo" />
              </div>
              <div>
                <p className="font-bold text-white text-sm leading-none">SisaBisa</p>
                <p className="text-green-500/60 text-[10px] mt-0.5">Smart Food Intelligence</p>
              </div>
            </div>
            <p className="text-green-700/60 text-xs text-center">
              © 2025 SisaBisa · AI-Powered Food Waste Reduction Platform
            </p>
          </div>
        </footer>
      </main>

      {showLogin && (
        <LoginModal
          onClose={() => setShowLogin(false)}
          onSwitchToRegister={() => {
            setShowLogin(false);
            setShowRegister(true);
          }}
        />
      )}
      {showRegister && (
        <RegisterModal
          onClose={() => setShowRegister(false)}
          onSwitchToLogin={() => {
            setShowRegister(false);
            setShowLogin(true);
          }}
        />
      )}
    </div>
  );
}

/* ── Sub-components ─────────────────────────── */

function HeroBadge({ value, label }) {
  return (
    <div className="inline-flex items-center gap-2 bg-white/85 border border-green-100/70 rounded-xl px-3.5 py-2 shadow-sm backdrop-blur-sm">
      <span className="font-extrabold text-green-700 text-sm">{value}</span>
      <span className="text-slate-500 text-xs font-semibold">{label}</span>
    </div>
  );
}

function StepCard({ step, icon: Icon, iconBg, title, subtitle, description }) {
  return (
    <div className="group bg-white rounded-3xl border border-green-50/90 p-6 shadow-sm hover:shadow-lg hover:shadow-green-700/6 hover:-translate-y-2 transition-all duration-300">
      <div className="flex items-center justify-between mb-6">
        <div className={`${iconBg} text-white w-12 h-12 rounded-2xl flex items-center justify-center shadow-md`}>
          <Icon size={20} />
        </div>
        <span className="text-5xl font-black text-green-100 group-hover:text-green-200 transition-colors">{step}</span>
      </div>
      <p className="text-[10px] font-extrabold text-slate-400 uppercase tracking-widest mb-1">{title}</p>
      <h3 className="font-extrabold text-green-950 text-[1.05rem] mb-3 tracking-tight">{subtitle}</h3>
      <p className="text-slate-500 text-sm leading-relaxed">{description}</p>
    </div>
  );
}

function FeatureCard({ icon: Icon, badge, title, description, featured = false }) {
  return (
    <div className={`group rounded-3xl p-7 border transition-all duration-300 hover:-translate-y-2 ${featured
        ? 'bg-gradient-to-br from-green-700 to-green-600 text-white border-green-600 shadow-xl shadow-green-700/20'
        : 'bg-white border-green-50/90 shadow-sm hover:shadow-lg hover:shadow-green-700/6'
      }`}>
      <div className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-bold mb-5 ${featured ? 'bg-white/15 text-lime-200 border border-white/20' : 'bg-green-100 text-green-700'
        }`}>
        {badge}
      </div>
      <div className={`w-12 h-12 rounded-2xl flex items-center justify-center mb-5 transition-all duration-300 ${featured
          ? 'bg-white/20 text-white'
          : 'bg-green-100 text-green-700 group-hover:bg-green-700 group-hover:text-white'
        }`}>
        <Icon size={22} />
      </div>
      <h3 className={`font-extrabold text-lg mb-3 tracking-tight ${featured ? 'text-white' : 'text-green-950'}`}>
        {title}
      </h3>
      <p className={`leading-relaxed text-sm ${featured ? 'text-green-100/90' : 'text-slate-500'}`}>
        {description}
      </p>
    </div>
  );
}

function StatItem({ value, label, sub }) {
  return (
    <div className="py-4 sm:py-0">
      <p className="text-4xl md:text-5xl font-black text-white mb-2 tracking-tight">{value}</p>
      <p className="font-bold text-lime-300 text-sm mb-1">{label}</p>
      <p className="text-green-200/65 text-xs">{sub}</p>
    </div>
  );
}

function BenefitCard({ icon: Icon, title, text }) {
  return (
    <div className="group bg-white hover:bg-green-50/40 rounded-3xl border border-green-50/80 p-6 shadow-sm hover:shadow-md hover:-translate-y-1 transition-all duration-300">
      <div className="w-11 h-11 rounded-2xl bg-green-100 group-hover:bg-green-700 text-green-700 group-hover:text-white flex items-center justify-center mb-4 transition-all duration-300 shadow-sm">
        <Icon size={20} />
      </div>
      <h3 className="font-extrabold text-green-950 mb-2 tracking-tight">{title}</h3>
      <p className="text-slate-500 text-sm leading-relaxed">{text}</p>
    </div>
  );
}