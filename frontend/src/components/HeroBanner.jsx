import { useEffect, useState } from "react";
import { getVenueName, getCityName, getImageUrl, getEventPriceLabel, getEventDateLong, formatEventTime } from "../utils/eventHelpers";

const getCategoryColor = (type) => {
  if (type === "musica") return { badge: "bg-violet-500/20 text-violet-100 border border-violet-500/30" };
  if (type === "teatro") return { badge: "bg-amber-500/20 text-amber-100 border border-amber-500/30" };
  if (type === "cine") return { badge: "bg-sky-500/20 text-sky-100 border border-sky-500/30" };
  return { badge: "bg-emerald-500/20 text-emerald-100 border border-emerald-500/30" };
};
const getTypeLabel = (type) => {
  if (type === "musica") return "Música";
  if (type === "teatro") return "Teatro";
  if (type === "cine") return "Cine";
  return "Museo";
};

const HeroBanner = ({ events, onBuyClick, onCategoryClick }) => {
  const [active, setActive] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => setActive((current) => (current + 1) % events.length), 5000);
    return () => clearInterval(interval);
  }, [events.length]);

  if (!events.length) return null;

  const slide = events[active];
  const colors = getCategoryColor(slide.type);
  const price = getEventPriceLabel(slide, slide.type);

  return (
    <div className="relative w-full overflow-hidden rounded-[2rem] border border-white/10 bg-slate-950 shadow-2xl shadow-black/40">
      {events.map((item, index) => (
        <div key={item.id} className={`absolute inset-0 transition-opacity duration-700 ${index === active ? "opacity-100" : "opacity-0"}`}>
          <img src={getImageUrl(item, item.type)} alt={item.name} className="h-[60vh] min-h-[400px] w-full object-cover" />
          <div className="absolute inset-0 bg-gradient-to-t from-black via-black/70 to-transparent" />
        </div>
      ))}
      <div className="relative z-10 flex h-[60vh] min-h-[400px] flex-col justify-between p-8 md:p-12">
        <div className="max-w-3xl space-y-4">
          <span className={`inline-flex rounded-full px-4 py-2 text-xs font-semibold uppercase tracking-[0.35em] ${colors.badge}`}>
            {getTypeLabel(slide.type)} Destacado
          </span>
          <h1 className="text-4xl font-bold tracking-tight text-white md:text-6xl">{slide.name}</h1>
          <p className="text-sm uppercase tracking-[0.35em] text-slate-400">{getVenueName(slide)} · {getCityName(slide)}</p>
          <p className="max-w-2xl text-base text-slate-200 md:text-lg">{getEventDateLong(slide)} · {formatEventTime(slide)}</p>
          <p className="text-lg font-semibold text-white">{price}</p>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <button type="button" onClick={() => onBuyClick(slide, slide.type)} className="inline-flex items-center justify-center rounded-2xl bg-white px-6 py-3 text-sm font-semibold text-slate-950 transition hover:bg-slate-100" aria-label={`Comprar boletos para ${slide.name}`}>
            Comprar Boletos
          </button>
          <button type="button" onClick={() => onCategoryClick(slide.type)} className="inline-flex items-center justify-center rounded-2xl border border-white/10 bg-white/10 px-6 py-3 text-sm font-semibold text-white transition hover:bg-white/15" aria-label={`Ver categoría ${getTypeLabel(slide.type)}`}>
            Ver categoría
          </button>
        </div>
        <div className="flex items-center gap-2 pt-6">
          {events.map((_, index) => (
            <button key={index} type="button" onClick={() => setActive(index)} aria-label={`Ver slide ${index + 1}`} className={`h-2.5 w-2.5 rounded-full transition ${index === active ? "bg-white" : "bg-white/30"}`} />
          ))}
        </div>
      </div>
    </div>
  );
};

export default HeroBanner;
