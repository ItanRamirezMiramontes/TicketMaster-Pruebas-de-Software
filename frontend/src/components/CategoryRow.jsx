import { useRef } from "react";
import EventCard from "./EventCard";

const CategoryRow = ({ title, icon: Icon, events, type, onBuyClick, accentColor, onSeeAll }) => {
  const rowRef = useRef(null);
  const handleScroll = (direction) => {
    rowRef.current?.scrollBy({ left: direction * 320, behavior: "smooth" });
  };

  return (
    <section className="space-y-4">
      <div className="flex items-center justify-between gap-4 px-4">
        <div className="flex items-center gap-3 text-slate-100">
          <Icon className={`h-5 w-5 ${accentColor}`} />
          <h2 className="text-lg font-semibold">{title}</h2>
        </div>
        <div className="flex items-center gap-4">
          {onSeeAll ? (
            <button type="button" onClick={() => onSeeAll(type)} className={`text-sm font-medium transition ${accentColor} hover:opacity-80`} aria-label={`Ver todos de ${title}`}>
              Ver todos
            </button>
          ) : null}
          <div className="flex items-center gap-2">
            <button type="button" onClick={() => handleScroll(-1)} className="rounded-full bg-slate-900/90 p-2 text-slate-300 transition hover:bg-slate-800" aria-label="Desplazar fila a la izquierda">‹</button>
            <button type="button" onClick={() => handleScroll(1)} className="rounded-full bg-slate-900/90 p-2 text-slate-300 transition hover:bg-slate-800" aria-label="Desplazar fila a la derecha">›</button>
          </div>
        </div>
      </div>
      <div ref={rowRef} className="scrollbar-hide flex gap-4 overflow-x-auto px-4 pb-2">
        {events.length === 0 ? (
          <div className="flex min-w-[220px] items-center justify-center rounded-3xl border border-dashed border-white/10 bg-slate-900/80 p-8 text-center text-slate-400">
            <div>
              <p className="text-3xl">🎟️</p>
              <p className="mt-4 text-sm font-semibold">Sin eventos disponibles</p>
            </div>
          </div>
        ) : (
          events.map((event) => <EventCard key={event.id} event={event} type={type} onBuyClick={onBuyClick} />)
        )}
      </div>
    </section>
  );
};

export default CategoryRow;
