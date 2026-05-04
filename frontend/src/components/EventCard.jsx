import { ArrowRight } from "lucide-react";
import { getCategoryColor, getEventPriceLabel, getImageUrl, getVenueName, getCityName, formatDateShort, formatEventTime, getCategoryLabel } from "../utils/eventHelpers";

const EventCard = ({ event, type, onBuyClick, onDetailClick }) => {
  const imageUrl = getImageUrl(event, type, "600x800");
  const price = getEventPriceLabel(event, type);
  const title = event.name;
  const subtitle = type === "museo" ? `${event.city?.name ?? "Ciudad por confirmar"}` : `${getVenueName(event)} · ${getCityName(event)}`;
  const extra = type === "museo" ? event.country?.name ?? "País por confirmar" : formatEventTime(event);
  const typeLabel = type === "museo" ? "Museo" : getCategoryLabel(type);
  const colors = getCategoryColor(type);

  const handleCardClick = () => {
    if (onDetailClick) {
      onDetailClick(event, type);
    } else if (onBuyClick) {
      onBuyClick(event, type);
    }
  };

  return (
    <div
      role="button"
      tabIndex={0}
      onClick={handleCardClick}
      onKeyDown={(e) => e.key === "Enter" && handleCardClick()}
      className={`group relative w-48 md:w-56 shrink-0 cursor-pointer overflow-hidden rounded-3xl border ${colors.border} bg-slate-950 shadow-xl shadow-black/30 transition-transform duration-300 hover:-translate-y-1 hover:scale-105`}
      aria-label={`Ver detalles de ${title}`}
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
            <span>{type === "museo" ? extra : formatDateShort(event)}</span>
            <span>{extra}</span>
          </div>
          <p className="mt-3 text-sm font-semibold text-slate-100">{price}</p>
        </div>
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            onBuyClick?.(event, type);
          }}
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
