
import React from 'react';
import { Link, useLocation } from 'react-router-dom';

interface LayoutProps {
  children: React.ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
  const location = useLocation();

  const navLinks = [
    { path: '/tutela', label: 'Tutela', icon: 'gavel' },
    { path: '/tutela-integral', label: 'Tutela Integral', icon: 'auto_fix_high' },
    { path: '/habeas-corpus', label: 'Hábeas Corpus', icon: 'balance' },
    { path: '/habeas-corpus-inteligente', label: 'Hábeas Corpus Int.', icon: 'verified_user' },
    { path: '/desacatos', label: 'Desacato', icon: 'warning' },
    { path: '/desacato-inteligente', label: 'Desacato Int.', icon: 'notification_important' },
    { path: '/corte-constitucional', label: 'Corte Constitucional', icon: 'account_balance' },
    { path: '/apoyo-judicial', label: 'Apoyo Judicial', icon: 'psychology' },
  ];

  return (
    <div className="relative flex h-screen w-full flex-row overflow-hidden bg-background-light dark:bg-background-dark">
      {/* Side Navigation */}
      <aside className="hidden lg:flex w-72 flex-col border-r border-[#293038] bg-background-dark">
        <div className="flex h-full flex-col justify-between p-4">
          <div className="flex flex-col gap-4">
            {/* User Profile / App Header */}
            <div className="flex gap-3 items-center pb-4 border-b border-[#293038]">
              <div
                className="bg-center bg-no-repeat aspect-square bg-cover rounded-full size-12 shadow-inner"
                style={{ backgroundImage: 'url("https://picsum.photos/seed/legal/200")' }}
              />
              <div className="flex flex-col">
                <h1 className="text-white text-lg font-bold leading-tight">Justicia AI</h1>
                <p className="text-[#9dabb9] text-xs font-normal">Asistente Judicial</p>
              </div>
            </div>
            {/* Navigation Links */}
            <nav className="flex flex-col gap-2 mt-2">
              <Link
                className={`flex items-center gap-3 px-3 py-3 rounded-lg transition-colors group ${location.pathname === '/' || location.pathname === '/inicio' ? 'bg-[#283039] text-white' : 'text-[#9dabb9] hover:bg-[#283039] hover:text-white'}`}
                to="/"
              >
                <span className="material-symbols-outlined">home</span>
                <p className="text-sm font-medium">Inicio</p>
              </Link>
              {navLinks.map((link) => (
                <Link
                  key={link.path}
                  className={`flex items-center gap-3 px-3 py-3 rounded-lg transition-colors group ${location.pathname.startsWith(link.path) ? 'bg-primary/20 border-l-4 border-primary text-white' : 'text-[#9dabb9] hover:bg-[#283039] hover:text-white'}`}
                  to={link.path}
                >
                  <span className={`material-symbols-outlined ${location.pathname.startsWith(link.path) ? 'text-primary' : ''}`} data-weight={location.pathname.startsWith(link.path) ? 'fill' : 'normal'}>
                    {link.icon}
                  </span>
                  <p className="text-sm font-medium">{link.label}</p>
                </Link>
              ))}
            </nav>
          </div>
          {/* Bottom Links */}
          <div className="flex flex-col gap-2">
            <a className="flex items-center gap-3 px-3 py-3 rounded-lg hover:bg-[#283039] transition-colors group text-[#9dabb9] hover:text-white" href="#">
              <span className="material-symbols-outlined">settings</span>
              <p className="text-sm font-medium">Configuración</p>
            </a>
            <a className="flex items-center gap-3 px-3 py-3 rounded-lg hover:bg-[#283039] transition-colors group text-red-400" href="#">
              <span className="material-symbols-outlined">logout</span>
              <p className="text-sm font-medium">Cerrar Sesión</p>
            </a>
          </div>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col h-full relative overflow-hidden bg-background-dark">
        {/* Security Banner */}
        <div className="bg-[#2b1f11] border-b border-[#4d361c] px-6 py-2 flex items-center justify-center gap-2">
          <span className="material-symbols-outlined text-amber-500 text-sm">lock</span>
          <p className="text-amber-500 text-[10px] md:text-xs font-medium uppercase tracking-wide">Información Confidencial - Uso exclusivo Rama Judicial</p>
        </div>
        {children}
      </main>
    </div>
  );
};

export default Layout;
