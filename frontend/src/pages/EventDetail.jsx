import { ArrowLeft, Calendar, Clock, MapPin, Ticket, AlertCircle, Info, ShieldCheck } from "lucide-react";
import { getCategoryColor, getCategoryLabel, getEventPriceLabel, getImageUrl, getVenueName, getCityName, formatEventDate, formatEventTime, formatDateShort, RESTRICCIONES_POR_TIPO, HORARIOS_POR_TIPO, getCineForEvent, getClasificacionForEvent, TEATRO_SECCIONES, CINES } from "../utils/eventHelpers";

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
      {/* HEADER */}
      <div className="relative h-[50vh] overflow-hidden rounded-[2rem]">
        <img src={imageUrl} alt={event.name} className="h-full w-full object-cover" />
        <div className="absolute inset-0 bg-gradient-to-t from-black via-black/60 to-transparent" />
        <button type="button" onClick={onBack} className="absolute left-6 top-6 inline-flex items-center gap-2 rounded-3xl border border-white/10 bg-slate-950/95 px-4 py-3 text-sm text-slate-200 transition hover:bg-slate-900">
          <ArrowLeft className="h-4 w-4" /> Volver
        </button>
        <div className="absolute inset-x-0 bottom-0 p-8 text-white">
          <span className="inline-flex rounded-full bg-white/10 px-3 py-1 text-xs uppercase tracking-[0.35em] text-white/80">{typeLabel}</span>
          <h1 className="mt-4 text-4xl md:text-5xl font-bold">{event.name}</h1>
          <p className="mt-2 text-lg text-slate-200">{venue} · {city}</p>
          <p className="mt-1 text-sm text-slate-300">{priceLabel}</p>
        </div>
      </div>

      {/* BODY */}
      <div className="grid gap-8 lg:grid-cols-[1.4fr_0.9fr]">
        {/* COLUMNA IZQUIERDA */}
        <div className="space-y-6">
          {/* Card "Detalles del evento" */}
          <div className="rounded-3xl border border-white/10 bg-slate-950/95 p-6">
            <h2 className="text-xl font-semibold text-white mb-4">Detalles del evento</h2>
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="rounded-2xl border border-slate-800 bg-slate-900 p-4">
                <p className="text-xs uppercase tracking-[0.35em] text-slate-500">Fecha completa</p>
                <p className="mt-2 text-white">{eventDate}</p>
              </div>
              <div className="rounded-2xl border border-slate-800 bg-slate-900 p-4">
                <p className="text-xs uppercase tracking-[0.35em] text-slate-500">Hora</p>
                <p className="mt-2 text-white">{eventTime || "Por confirmar"}</p>
              </div>
              <div className="rounded-2xl border border-slate-800 bg-slate-900 p-4">
                <p className="text-xs uppercase tracking-[0.35em] text-slate-500">Lugar</p>
                <p className="mt-2 text-white">{venue}</p>
              </div>
              <div className="rounded-2xl border border-slate-800 bg-slate-900 p-4">
                <p className="text-xs uppercase tracking-[0.35em] text-slate-500">Ciudad</p>
                <p className="mt-2 text-white">{city}</p>
              </div>
            </div>
          </div>

          {/* Card "Restricciones de acceso" */}
          <div className="rounded-3xl border border-white/10 bg-slate-950/95 p-6">
            <div className="flex items-center gap-3 mb-4">
              <AlertCircle className="h-5 w-5 text-amber-400" />
              <h2 className="text-xl font-semibold text-white">Restricciones de acceso</h2>
            </div>
            <p className="text-slate-300 leading-6">{RESTRICCIONES_POR_TIPO[type]}</p>
            {type === "cine" && (
              <p className="mt-3 text-sm text-slate-400">
                Clasificación: {getClasificacionForEvent(event.id)}<br />
                No se permiten: mascotas, armas, alimentos externos
              </p>
            )}
            {type === "teatro" && (
              <p className="mt-3 text-sm text-slate-400">
                Vestimenta: Formal en Luneta y Palco, Semi-formal en Galería<br />
                No se permiten: alimentos, grabaciones
              </p>
            )}
          </div>

          {/* Card "Horarios de servicio" */}
          <div className="rounded-3xl border border-white/10 bg-slate-950/95 p-6">
            <div className="flex items-center gap-3 mb-4">
              <Clock className="h-5 w-5 text-blue-400" />
              <h2 className="text-xl font-semibold text-white">Horarios de servicio</h2>
            </div>
            <p className="text-slate-300 leading-6">{HORARIOS_POR_TIPO[type]}</p>
            {type === "cine" && (() => {
              const cineInfo = getCineForEvent(event.id);
              return cineInfo ? (
                <div className="mt-4">
                  <p className="text-sm font-semibold text-white mb-2">Servicios de {cineInfo.name}:</p>
                  <div className="flex flex-wrap gap-2">
                    {cineInfo.servicios.map(s => (
                      <span key={s} className="rounded-full bg-slate-800 px-3 py-1 text-xs text-slate-300">
                        {s}
                      </span>
                    ))}
                  </div>
                </div>
              ) : null;
            })()}
          </div>

          {/* Card "Secciones y precios" for teatro */}
          {type === "teatro" && (
            <div className="rounded-3xl border border-white/10 bg-slate-950/95 p-6">
              <div className="flex items-center gap-3 mb-4">
                <Info className="h-5 w-5 text-purple-400" />
                <h2 className="text-xl font-semibold text-white">Secciones y precios</h2>
              </div>
              <div className="space-y-3">
                {TEATRO_SECCIONES.map(sec => {
                  const precioBase = event.priceRanges?.[0]?.min ?? 500;
                  return (
                    <div key={sec.id} className="rounded-2xl border border-slate-800 bg-slate-900 p-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <strong className="text-white">{sec.label}</strong>
                          <p className="text-sm text-slate-400 mt-1">{sec.descripcion}</p>
                          <p className="text-xs text-slate-500 mt-1">Vestimenta: {sec.vestimenta}</p>
                        </div>
                        <div className="text-right">
                          <p className="text-white font-semibold">${precioBase + sec.precioExtra} MXN</p>
                          <p className="text-xs text-slate-400">+${sec.precioExtra} extra</p>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Card "Salas disponibles" for cine */}
          {type === "cine" && (
            <div className="rounded-3xl border border-white/10 bg-slate-950/95 p-6">
              <div className="flex items-center gap-3 mb-4">
                <ShieldCheck className="h-5 w-5 text-green-400" />
                <h2 className="text-xl font-semibold text-white">Salas disponibles</h2>
              </div>
              <div className="space-y-3">
                {[
                  { id: "estandar", label: "Estándar", icon: "🎬", description: "Pantalla convencional", multiplier: 1.0 },
                  { id: "imax", label: "IMAX", icon: "🌐", description: "Pantalla gigante", multiplier: 1.5 },
                  { id: "4dx", label: "4DX", icon: "💺", description: "Asientos móviles", multiplier: 1.8 },
                  { id: "3d", label: "3D", icon: "🥽", description: "Proyección 3D", multiplier: 1.2 },
                  { id: "espanol", label: "Español", icon: "🌎", description: "Doblada al español", multiplier: 1.0 },
                  { id: "subtitulada", label: "Subtitulada", icon: "📝", description: "Original con subtítulos", multiplier: 1.0 },
                ].map(sala => (
                  <div key={sala.id} className="flex items-center justify-between rounded-2xl border border-slate-800 bg-slate-900 p-4">
                    <div className="flex items-center gap-3">
                      <span className="text-lg">{sala.icon}</span>
                      <div>
                        <p className="text-white font-semibold">{sala.label}</p>
                        <p className="text-sm text-slate-400">{sala.description}</p>
                      </div>
                    </div>
                    <span className="text-slate-300">×{sala.multiplier}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* COLUMNA DERECHA */}
        <aside className="space-y-6">
          {/* Card de compra rápida */}
          <div className="rounded-3xl border border-white/10 bg-slate-950/95 p-6 sticky top-6">
            <p className="text-sm uppercase tracking-[0.35em] text-slate-400 mb-4">Compra rápida</p>
            <div className="space-y-4">
              <div className="rounded-2xl border border-slate-800 bg-slate-900 p-4">
                <p className="text-xs text-slate-500">Precio desde</p>
                <p className="text-2xl font-bold text-white">{priceLabel}</p>
              </div>
              <p className="text-sm text-slate-300 leading-6">{description}</p>
              <button type="button" onClick={() => openModal(event, type)} className="w-full inline-flex items-center justify-center gap-2 rounded-2xl bg-indigo-600 px-6 py-3 text-sm font-semibold text-white transition hover:bg-indigo-500">
                <Ticket className="h-4 w-4" /> Comprar boletos
              </button>
              {type === "cine" && (
                <p className="text-xs text-slate-400 text-center">Elige tu sala al comprar</p>
              )}
              {type === "teatro" && (
                <p className="text-xs text-slate-400 text-center">Vestimenta formal requerida</p>
              )}
            </div>
          </div>

          {/* Card "Capacidad y disponibilidad" */}
          <div className="rounded-3xl border border-white/10 bg-slate-950/95 p-6">
            <p className="text-sm uppercase tracking-[0.35em] text-slate-400 mb-4">Capacidad y disponibilidad</p>
            <div className="space-y-3">
              <div className="rounded-2xl border border-slate-800 bg-slate-900 p-4">
                <p className="text-xs text-slate-500">Capacidad aproximada</p>
                <p className="text-white">
                  {type === "teatro" ? "Hasta 1,500 asientos" :
                   type === "cine" ? "Sala para 80-400 personas según tipo" :
                   type === "musica" ? "Según venue" :
                   "Hasta 2,000 visitantes por turno"}
                </p>
              </div>
              <div className="rounded-2xl border border-slate-800 bg-slate-900 p-4">
                <p className="text-xs text-slate-500">Compra máxima</p>
                <p className="text-white">{type === "teatro" ? 10 : type === "cine" ? 10 : type === "musica" ? 12 : 5} boletos por usuario</p>
              </div>
            </div>
          </div>
        </aside>
      </div>
    </section>
  );
};

export default EventDetail;
