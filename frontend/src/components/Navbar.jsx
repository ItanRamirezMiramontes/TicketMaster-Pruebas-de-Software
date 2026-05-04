import { useEffect, useState } from "react";
import { ChevronDown, Menu, X } from "lucide-react";
import { useAuth } from "../context/AuthContext";

const CATEGORY_DOT = {
  Inicio: "bg-slate-200",
  Teatro: "bg-amber-400",
  Cine: "bg-sky-400",
  Musica: "bg-violet-400",
  Museo: "bg-emerald-400",
  Cuenta: "bg-indigo-400",
};

const Navbar = ({ activeTab, onNavigate, onLogin, onRegister, onLogout }) => {
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const { user } = useAuth();

  useEffect(() => {
    const handler = () => setScrolled(window.scrollY > 50);
    window.addEventListener("scroll", handler);
    return () => window.removeEventListener("scroll", handler);
  }, []);

  return (
    <nav className={`fixed top-0 left-0 right-0 z-40 transition-all duration-300 ${scrolled ? "bg-slate-950/95 backdrop-blur-xl shadow-lg shadow-black/50" : "bg-gradient-to-b from-black/80 to-transparent"}`}>
      <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-4 py-4 sm:px-6">
        <button type="button" onClick={() => { onNavigate("Inicio"); setMobileOpen(false); }} className="flex items-center gap-3 text-lg font-semibold text-white">
          <span>🎟</span> TicketMaster
        </button>
        <div className="hidden items-center gap-8 md:flex">
          {Object.keys(CATEGORY_DOT).map((tab) => (
            <button key={tab} type="button" onClick={() => onNavigate(tab)} className="relative text-sm font-medium text-slate-200 transition hover:text-white" aria-label={`Ir a ${tab}`}>
              {tab}
              {activeTab === tab && <span className={`absolute left-1/2 top-full -translate-x-1/2 mt-2 block h-2 w-2 rounded-full ${CATEGORY_DOT[tab]}`} />}
            </button>
          ))}
        </div>
        <div className="hidden items-center gap-3 md:flex">
          {!user ? (
            <>
              <button type="button" onClick={onLogin} className="rounded-2xl border border-white/10 px-4 py-2 text-sm text-slate-200 transition hover:bg-white/5">Login</button>
              <button type="button" onClick={onRegister} className="rounded-2xl bg-indigo-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-indigo-500">Registrarse</button>
            </>
          ) : (
            <div className="relative">
              <button type="button" onClick={() => setMenuOpen((prev) => !prev)} className="inline-flex items-center gap-2 rounded-3xl border border-white/10 bg-slate-900/90 px-4 py-2 text-sm text-slate-100 transition hover:bg-slate-800" aria-label="Abrir menú de usuario">
                <span className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-slate-700 text-sm font-semibold uppercase text-white">{user.usuario?.[0] ?? "U"}</span>
                <span>{user.usuario}</span>
                <ChevronDown className="h-4 w-4" />
              </button>
              {menuOpen && (
                <div className="absolute right-0 mt-3 w-44 overflow-hidden rounded-3xl border border-white/10 bg-slate-950 shadow-2xl shadow-black/40">
                  <button type="button" onClick={() => { onLogout(); setMenuOpen(false); }} className="w-full px-4 py-3 text-left text-sm text-slate-200 transition hover:bg-slate-900">Cerrar sesión</button>
                </div>
              )}
            </div>
          )}
        </div>
        <button type="button" className="inline-flex items-center rounded-2xl border border-white/10 bg-slate-900/90 p-3 text-slate-200 md:hidden" onClick={() => setMobileOpen((prev) => !prev)} aria-label="Abrir menú móvil">
          {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>
      </div>
      {mobileOpen && (
        <div className="border-t border-white/10 bg-slate-950/95 px-4 py-4 md:hidden">
          <div className="space-y-3">
            {Object.keys(CATEGORY_DOT).map((tab) => (
              <button key={tab} type="button" onClick={() => { onNavigate(tab); setMobileOpen(false); }} className="flex w-full items-center justify-between rounded-2xl px-4 py-3 text-left text-sm text-slate-200 transition hover:bg-white/5">{tab}{activeTab === tab && <span className={`h-2 w-2 rounded-full ${CATEGORY_DOT[tab]}`} />}</button>
            ))}
          </div>
          <div className="mt-4 flex flex-col gap-3">
            {!user ? (
              <>
                <button type="button" onClick={onLogin} className="rounded-2xl border border-white/10 px-4 py-3 text-sm text-slate-200 transition hover:bg-white/5">Login</button>
                <button type="button" onClick={onRegister} className="rounded-2xl bg-indigo-600 px-4 py-3 text-sm font-semibold text-white transition hover:bg-indigo-500">Registrarse</button>
              </>
            ) : (
              <button type="button" onClick={() => { onLogout(); setMobileOpen(false); }} className="rounded-2xl border border-white/10 px-4 py-3 text-sm text-slate-200 transition hover:bg-white/5">Cerrar sesión</button>
            )}
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;
