import { useMemo } from "react";
import { ShieldCheck, Clock3, Wallet } from "lucide-react";
import { useAuth } from "../context/AuthContext";
import useOrders from "../hooks/useOrders";
import TicketCard from "../components/TicketCard";

const formatDate = (value) => {
  const date = new Date(value);
  return isNaN(date.getTime()) ? "Fecha no disponible" : date.toLocaleDateString("es-MX", { weekday: "long", day: "numeric", month: "long", year: "numeric" });
};

const Account = () => {
  const { user } = useAuth();
  const { orders, loading, error, refresh } = useOrders();

  const stats = useMemo(() => {
    const totalBoletos = orders.reduce((sum, order) => sum + (order.boletos || 0), 0);
    const totalGastado = orders.reduce((sum, order) => sum + (order.total || 0), 0);
    const próximasReservas = orders.filter((order) => order.status === "Reservado").length;
    return {
      totalBoletos,
      totalGastado,
      totalCompras: orders.length,
      próximasReservas,
    };
  }, [orders]);

  if (!user) {
    return (
      <section className="min-h-[calc(100vh-4rem)] py-16">
        <div className="mx-auto max-w-3xl rounded-[2rem] border border-white/10 bg-slate-950/95 p-10 text-center shadow-2xl shadow-black/40">
          <h2 className="text-3xl font-bold text-white">Accede a tu cuenta</h2>
          <p className="mt-4 text-slate-400">Inicia sesión para ver tu historial de compras, boletos y próximas reservas.</p>
        </div>
      </section>
    );
  }

  return (
    <section className="min-h-[calc(100vh-4rem)] space-y-10 py-10">
      <div className="grid gap-6 lg:grid-cols-[1.2fr_0.8fr]">
        <div className="rounded-[2rem] border border-white/10 bg-slate-950/95 p-8 shadow-2xl shadow-black/40">
          <div className="flex items-center gap-4">
            <div className="flex h-16 w-16 items-center justify-center rounded-3xl bg-indigo-600 text-white">{user.usuario[0]}</div>
            <div>
              <p className="text-sm uppercase tracking-[0.35em] text-slate-400">Cuenta profesional</p>
              <h1 className="mt-2 text-3xl font-semibold text-white">{user.usuario}</h1>
            </div>
          </div>
          <div className="mt-8 grid gap-4 sm:grid-cols-2">
            <div className="rounded-3xl border border-white/10 bg-slate-900 p-5">
              <p className="text-xs uppercase tracking-[0.35em] text-slate-500">Total de compras</p>
              <p className="mt-3 text-3xl font-semibold text-white">{stats.totalCompras}</p>
            </div>
            <div className="rounded-3xl border border-white/10 bg-slate-900 p-5">
              <p className="text-xs uppercase tracking-[0.35em] text-slate-500">Boletos comprados</p>
              <p className="mt-3 text-3xl font-semibold text-white">{stats.totalBoletos}</p>
            </div>
            <div className="rounded-3xl border border-white/10 bg-slate-900 p-5">
              <p className="text-xs uppercase tracking-[0.35em] text-slate-500">Gasto total</p>
              <p className="mt-3 text-3xl font-semibold text-white">${stats.totalGastado.toFixed(2)} MXN</p>
            </div>
            <div className="rounded-3xl border border-white/10 bg-slate-900 p-5">
              <p className="text-xs uppercase tracking-[0.35em] text-slate-500">Reservas próximas</p>
              <p className="mt-3 text-3xl font-semibold text-white">{stats.próximasReservas}</p>
            </div>
          </div>
        </div>
        <div className="rounded-[2rem] border border-white/10 bg-slate-950/95 p-8 shadow-2xl shadow-black/40">
          <p className="text-sm uppercase tracking-[0.35em] text-slate-400">Perfil</p>
          <h2 className="mt-3 text-2xl font-semibold text-white">Detalles de la cuenta</h2>
          <div className="mt-6 space-y-4 text-sm text-slate-300">
            <div className="flex items-center justify-between gap-4 rounded-3xl border border-slate-800 bg-slate-900 p-4">
              <div>
                <p className="text-slate-400">Usuario</p>
                <p className="mt-1 font-semibold text-white">{user.usuario}</p>
              </div>
              <Wallet className="h-6 w-6 text-indigo-300" />
            </div>
            <div className="flex items-center justify-between gap-4 rounded-3xl border border-slate-800 bg-slate-900 p-4">
              <div>
                <p className="text-slate-400">Seguridad</p>
                <p className="mt-1 font-semibold text-white">Acceso protegido</p>
              </div>
              <ShieldCheck className="h-6 w-6 text-emerald-300" />
            </div>
            <div className="flex items-center justify-between gap-4 rounded-3xl border border-slate-800 bg-slate-900 p-4">
              <div>
                <p className="text-slate-400">Última actualización</p>
                <p className="mt-1 font-semibold text-white">Auto guardado en sesión</p>
              </div>
              <Clock3 className="h-6 w-6 text-slate-400" />
            </div>
          </div>
        </div>
      </div>

      <div className="space-y-6">
        <div className="flex items-center justify-between gap-4">
          <div>
            <p className="text-sm uppercase tracking-[0.35em] text-slate-500">Historial de pedidos</p>
            <h2 className="mt-2 text-3xl font-semibold text-white">Boletos comprados y reservados</h2>
          </div>
          <button type="button" onClick={refresh} className="rounded-2xl border border-white/10 bg-slate-900 px-4 py-3 text-sm text-slate-200 transition hover:bg-slate-800">Actualizar historial</button>
        </div>

        {loading ? (
          <div className="space-y-4 rounded-[2rem] border border-white/10 bg-slate-950/95 p-8 text-slate-400">
            <p>Cargando historial...</p>
          </div>
        ) : error ? (
          <div className="rounded-[2rem] border border-red-600/20 bg-red-600/10 p-8 text-red-200">{error}</div>
        ) : orders.length === 0 ? (
          <div className="rounded-[2rem] border border-dashed border-white/10 bg-slate-950/95 p-8 text-slate-300">No hay historial de compras todavía. Busca un evento y haz tu primera compra.</div>
        ) : (
          <div className="grid gap-5 xl:grid-cols-2">
            {orders.map((order) => (
              <TicketCard key={order.id} order={order} />
            ))}
          </div>
        )}
      </div>
    </section>
  );
};

export default Account;
