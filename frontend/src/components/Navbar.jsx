import { Home, Theater, Film, Music, BookOpen, LogOut } from "lucide-react";
import { useAuth } from "../context/AuthContext";

const ICONS = {
  Inicio: Home,
  Teatro: Theater,
  Cine: Film,
  Musica: Music,
  Museo: BookOpen,
};

const Navbar = ({ activeTab, setActiveTab, tabs, setAuthMode }) => {
  const { user, logout } = useAuth();

  return (
    <header className="border-b border-slate-800 bg-slate-950/95 backdrop-blur-xl">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-4">
        <div className="flex items-center gap-8">
          {tabs.map((tab) => {
            const Icon = ICONS[tab];
            const active = activeTab === tab;
            return (
              <button
                key={tab}
                type="button"
                onClick={() => setActiveTab(tab)}
                className={`inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm font-medium transition ${
                  active
                    ? "bg-indigo-600 text-white shadow-lg shadow-indigo-500/20"
                    : "text-slate-300 hover:bg-slate-900 hover:text-white"
                }`}
              >
                <Icon className="h-4 w-4" />
                {tab}
              </button>
            );
          })}
        </div>

        <div className="flex items-center gap-4 text-sm text-slate-300">
          <div className="rounded-2xl border border-slate-800 bg-slate-900/80 px-4 py-3">
            <p className="font-semibold text-slate-100">Estudiante: Itan Ramírez</p>
            <p>Código: 12345678</p>
          </div>
          {user ? (
            <button
              onClick={logout}
              className="inline-flex items-center gap-2 rounded-full bg-slate-800 px-4 py-2 text-slate-200 transition hover:bg-slate-700"
              type="button"
            >
              <LogOut className="h-4 w-4" />
              Salir
            </button>
          ) : (
            <div className="flex items-center gap-2">
              <button
                onClick={() => setAuthMode("login")}
                className="inline-flex items-center gap-2 rounded-full bg-slate-800 px-4 py-2 text-slate-200 transition hover:bg-slate-700"
                type="button"
              >
                Iniciar Sesión
              </button>
              <button
                onClick={() => setAuthMode("register")}
                className="inline-flex items-center gap-2 rounded-full bg-indigo-600 px-4 py-2 text-white transition hover:bg-indigo-500"
                type="button"
              >
                Registrarse
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};

export default Navbar;
