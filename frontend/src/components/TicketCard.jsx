import { Calendar, Ticket, MapPin, CheckCircle2 } from "lucide-react";
import { formatCurrency } from "../utils/eventHelpers";

const TicketCard = ({ order }) => {
  const statusStyles = order.status === "Reservado"
    ? "bg-amber-500/15 text-amber-300"
    : "bg-emerald-500/15 text-emerald-300";

  return (
    <article className="rounded-[2rem] border border-white/10 bg-slate-950/95 p-6 shadow-2xl shadow-black/30">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <p className="text-xs uppercase tracking-[0.35em] text-slate-500">{order.category?.toUpperCase() || "Evento"}</p>
          <h3 className="mt-3 text-2xl font-semibold text-white">{order.event_name}</h3>
          <p className="mt-2 text-sm text-slate-400">{order.venue || "Lugar no disponible"}</p>
        </div>
        <span className={`inline-flex items-center gap-2 rounded-full px-4 py-2 text-xs font-semibold ${statusStyles}`}>
          <CheckCircle2 className="h-4 w-4" />
          {order.status}
        </span>
      </div>

      <div className="mt-6 grid gap-4 sm:grid-cols-2">
        <div className="rounded-3xl bg-slate-900 p-4">
          <div className="flex items-center gap-2 text-slate-500"><Calendar className="h-4 w-4" /> Fecha</div>
          <p className="mt-3 text-sm text-white">{new Date(order.fecha).toLocaleDateString("es-MX", { weekday: "long", day: "numeric", month: "long", year: "numeric" })}</p>
        </div>
        <div className="rounded-3xl bg-slate-900 p-4">
          <div className="flex items-center gap-2 text-slate-500"><Ticket className="h-4 w-4" /> Boletos</div>
          <p className="mt-3 text-sm text-white">{order.boletos} boleto{order.boletos === 1 ? "" : "s"}</p>
        </div>
        <div className="rounded-3xl bg-slate-900 p-4">
          <div className="flex items-center gap-2 text-slate-500"><MapPin className="h-4 w-4" /> Ubicación</div>
          <p className="mt-3 text-sm text-white">{order.venue || "No disponible"}</p>
        </div>
        <div className="rounded-3xl bg-slate-900 p-4">
          <div className="flex items-center gap-2 text-slate-500"><CheckCircle2 className="h-4 w-4" /> Total</div>
          <p className="mt-3 text-sm text-white">{formatCurrency(order.total)}</p>
        </div>
      </div>

      {order.selected_seats?.length ? (
        <div className="mt-6 rounded-3xl border border-slate-800 bg-slate-900 p-4 text-sm text-slate-300">
          <p className="text-slate-400">Asientos</p>
          <p className="mt-2 text-white">{order.selected_seats.join(", ")}</p>
        </div>
      ) : null}
    </article>
  );
};

export default TicketCard;
