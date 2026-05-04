import { ArrowRight } from "lucide-react";

const getVenueName = (event) =>
  event.embedded?.venues?.[0]?.name ?? "Venue por confirmar";
const getCityName = (event) =>
  event.embedded?.venues?.[0]?.city?.name ?? "Ciudad por confirmar";
const getImageUrl = (event, type) => {
  if (type === "museo") return "https://placehold.co/400x600?text=Museo";
  return event.images?.[0]?.url ?? "https://placehold.co/600x400?text=Evento";
};
const getMinPrice = (event) => event.priceRanges?.[0]?.min ?? null;
const getEventDate = (event) => {
  const raw = event.dates?.start?.dateTime;
  if (!raw) return "Fecha por confirmar";
  const d = new Date(raw);
  return d.toLocaleDateString("es-MX", { day: "2-digit", month: "short", year: "numeric" });
};
const getEventTime = (event) => {
  const raw = event.dates?.start?.dateTime;
  if (!raw) return "";
  return new Date(raw).toLocaleTimeString("es-MX", { hour: "2-digit", minute: "2-digit" });
};
const getCategoryColor = (type) => {
  if (type === "musica") return { border: "border-violet-500/40", badge: "bg-violet-500/20 text-violet-200 border border-violet-500/30" };
  if (type === "teatro") return { border: "border-amber-500/30", badge: "bg-amber-500/20 text-amber-200 border border-amber-500/30" };
  if (type === "cine") return { border: "border-sky-500/30", badge: "bg-sky-500/20 text-sky-200 border border-sky-500/30" };
  return { border: "border-emerald-500/30", badge: "bg-emerald-500/20 text-emerald-200 border border-emerald-500/30" };
};

const EventCard = ({ event, type, onBuyClick }) => {
  const imageUrl = getImageUrl(event, type);
  const price = type === "museo" ? "$220 MXN" : getMinPrice(event) ? `Desde $${getMinPrice(event)} MXN` : "Ver precio";
  const title = event.name;
  const subtitle = type === "museo" ? `${event.city?.name ?? "Ciudad por confirmar"}` : `${getVenueName(event)} · ${getCityName(event)}`;
  const extra = type === "museo" ? event.country?.name ?? "País por confirmar" : getEventTime(event);
  const typeLabel = type === "museo" ? "Museo" : type === "musica" ? "Concierto" : type === "teatro" ? "Teatro" : "Cine";
  const colors = getCategoryColor(type);

  return (
    <div
      role="button"
      tabIndex={0}
      onClick={() => onBuyClick(event, type)}
      onKeyDown={(e) => e.key === "Enter" && onBuyClick(event, type)}
      className={`group relative w-48 md:w-56 shrink-0 overflow-hidden rounded-3xl border ${colors.border} bg-slate-950 shadow-xl shadow-black/30 transition-transform duration-300 hover:-translate-y-1 hover:scale-105`}
      aria-label={`Comprar boletos para ${title}`}
    >
      <div className="relative aspect-[2/3] overflow-hidden">
        <img src={imageUrl} alt={title} className="h-full w-full object-cover" />
        <div className="absolute inset-x-0 bottom-0 h-3/5 bg-gradient-to-t from-black via-black/70 to-transparent" />
        <span className={`absolute left-3 top-3 rounded-full px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.25em] ${colors.badge}`}>
          {typeLabel}
        </span>
        <div className="absolute inset-x-0 bottom-0 p-4 opacity-100">
          <p className="text-sm font-semibold text-slate-100 line-clamp-2">{title}</p>
          <p className="mt-2 text-[11px] text-slate-400">{subtitle}</p>
          <div className="mt-3 flex items-center justify-between text-[11px] text-slate-300">
            <span>{type === "museo" ? extra : getEventDate(event)}</span>
            <span>{extra}</span>
          </div>
          <p className="mt-3 text-sm font-semibold text-slate-100">{price}</p>
        </div>
        <button
          type="button"
          aria-label={`Comprar boletos para ${title}`}
          className="absolute inset-x-0 top-1/2 mx-4 flex h-11 items-center justify-center rounded-2xl bg-black/70 text-sm font-semibold text-white opacity-0 transition-opacity duration-300 group-hover:opacity-100"
        >
          Comprar
          <ArrowRight className="ml-2 h-4 w-4" />
        </button>
      </div>
    </div>
  );
};

export default EventCard;
