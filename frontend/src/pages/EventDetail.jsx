import { ArrowLeft, Calendar, Clock, MapPin, Ticket, Star } from "lucide-react";
import { getCategoryColor, getCategoryLabel, getEventPriceLabel, getImageUrl, getVenueName, getCityName, formatEventDate, formatEventTime, formatDateShort } from "../utils/eventHelpers";

const EventDetail = ({ event, type, onBack, openModal }) => {
  const colors = getCategoryColor(type);
  const priceLabel = getEventPriceLabel(event, type);
  const eventDate = formatEventDate(event);
  const eventTime = formatEventTime(event);
  const imageUrl = getImageUrl(event, type, "1200x900");
  const venue = getVenueName(event);
  const city = getCityName(event);
  const typeLabel = getCategoryLabel(type);
  const description = event.info || event.description || "Disfruta esta experiencia con asiento reservado y confirmación inmediata al completar tu compra.";

  return (
    <section className="space-y-8 py-6">
      <button type="button" onClick={onBack} className="inline-flex items-center gap-2 rounded-3xl border border-white/10 bg-slate-950/95 px-4 py-3 text-sm text-slate-200 transition hover:bg-slate-900">
        <ArrowLeft className="h-4 w-4" /> Volver a la cartelera
      </button>
      <div className="grid gap-8 lg:grid-cols-[1.3fr_0.9fr]">
        <div className="space-y-6">
          <div className="overflow-hidden rounded-[2rem] bg-slate-950/95 shadow-2xl shadow-black/40">
            <img src={imageUrl} alt={event.name} className="h-[32rem] w-full object-cover" />
          </div>
          <div className="rounded-[2rem] border border-white/10 bg-slate-950/95 p-8 shadow-2xl shadow-black/40">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <p className="text-sm uppercase tracking-[0.35em] text-slate-400">{typeLabel}</p>
                <h1 className="mt-3 text-4xl font-semibold text-white">{event.name}</h1>
              </div>
              <div className={`rounded-3xl px-4 py-2 text-sm font-semibold ${colors.badge}`}>
                {priceLabel}
              </div>
            </div>
            <div className="mt-6 grid gap-4 sm:grid-cols-2">
              <div className="rounded-3xl border border-slate-800 bg-slate-900 p-5">
                <p className="text-xs uppercase tracking-[0.35em] text-slate-500">Fecha</p>
                <p className="mt-3 text-white">{eventDate}</p>
                <p className="text-sm text-slate-400">{eventTime}</p>
              </div>
              <div className="rounded-3xl border border-slate-800 bg-slate-900 p-5">
                <p className="text-xs uppercase tracking-[0.35em] text-slate-500">Lugar</p>
                <p className="mt-3 text-white">{venue}</p>
                <p className="text-sm text-slate-400">{city}</p>
              </div>
            </div>
            <div className="mt-6 rounded-3xl border border-slate-800 bg-slate-900 p-6 text-slate-300">
              <p className="text-sm uppercase tracking-[0.35em] text-slate-500">Descripción</p>
              <p className="mt-3 leading-7 text-slate-200">{description}</p>
            </div>
          </div>
        </div>

        <aside className="space-y-6">
          <div className="rounded-[2rem] border border-white/10 bg-slate-950/95 p-8 shadow-2xl shadow-black/40">
            <p className="text-sm uppercase tracking-[0.35em] text-slate-400">Datos rápidos</p>
            <div className="mt-6 space-y-4">
              <div className="flex items-center gap-3 rounded-3xl border border-slate-800 bg-slate-900 p-4">
                <Calendar className="h-5 w-5 text-slate-300" />
                <div>
                  <p className="text-sm text-slate-400">Fecha</p>
                  <p className="text-sm text-white">{formatDateShort(event)}</p>
                </div>
              </div>
              <div className="flex items-center gap-3 rounded-3xl border border-slate-800 bg-slate-900 p-4">
                <Clock className="h-5 w-5 text-slate-300" />
                <div>
                  <p className="text-sm text-slate-400">Hora</p>
                  <p className="text-sm text-white">{eventTime || "Por confirmar"}</p>
                </div>
              </div>
              <div className="flex items-center gap-3 rounded-3xl border border-slate-800 bg-slate-900 p-4">
                <MapPin className="h-5 w-5 text-slate-300" />
                <div>
                  <p className="text-sm text-slate-400">Ciudad</p>
                  <p className="text-sm text-white">{city}</p>
                </div>
              </div>
              <div className="flex items-center gap-3 rounded-3xl border border-slate-800 bg-slate-900 p-4">
                <Star className="h-5 w-5 text-slate-300" />
                <div>
                  <p className="text-sm text-slate-400">Popularidad</p>
                  <p className="text-sm text-white">Alta demanda</p>
                </div>
              </div>
            </div>
            <button type="button" onClick={() => openModal(event, type)} className="mt-8 inline-flex w-full items-center justify-center gap-2 rounded-3xl bg-indigo-600 px-6 py-4 text-sm font-semibold text-white transition hover:bg-indigo-500">
              <Ticket className="h-4 w-4" /> Comprar boletos
            </button>
          </div>
          <div className="rounded-[2rem] border border-white/10 bg-slate-950/95 p-8 shadow-2xl shadow-black/40">
            <p className="text-sm uppercase tracking-[0.35em] text-slate-400">Recomendaciones</p>
            <ul className="mt-6 space-y-3 text-sm text-slate-300">
              <li className="rounded-3xl border border-slate-800 bg-slate-900 p-4">Compra segura con confirmación instantánea.</li>
              <li className="rounded-3xl border border-slate-800 bg-slate-900 p-4">Asientos reservados según disponibilidad real.</li>
              <li className="rounded-3xl border border-slate-800 bg-slate-900 p-4">Acceso rápido al historial de pedidos en tu cuenta.</li>
            </ul>
          </div>
        </aside>
      </div>
    </section>
  );
};

export default EventDetail;
