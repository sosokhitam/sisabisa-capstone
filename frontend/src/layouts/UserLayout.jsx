import { useState } from 'react';
import { Menu } from 'lucide-react';
import Sidebar from '../components/Sidebar';

export default function UserLayout({ children }) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  return (
    <div className="min-h-screen bg-[#f8fdf5]">
      <Sidebar
        isOpen={isSidebarOpen}
        onClose={() => setIsSidebarOpen(false)}
      />

      {/* Mobile topbar */}
      <header className="md:hidden fixed top-0 left-0 right-0 z-30 bg-white/85 backdrop-blur-xl border-b border-green-100/50 shadow-sm">
        <div className="h-16 px-4 flex items-center justify-between">
          <button
            onClick={() => setIsSidebarOpen(true)}
            className="bg-white hover:bg-green-50 border border-green-100/60 p-2.5 rounded-2xl transition-all duration-200 shadow-sm"
            aria-label="Buka menu"
          >
            <Menu size={21} className="text-green-700" />
          </button>

          <div className="flex items-center gap-2">
            <div className="h-9 w-9 flex items-center justify-center">
              <img src="/logo.png" className="w-full h-full object-contain" alt="SisaBisa Logo" />
            </div>
            <span className="font-extrabold text-green-700 tracking-tight">SisaBisa</span>
          </div>

          <div className="w-10" />
        </div>
      </header>

      <div className="md:ml-64">
        <main className="p-4 pt-20 md:p-6 lg:p-8 min-h-screen">
          {children}
        </main>
      </div>
    </div>
  );
}