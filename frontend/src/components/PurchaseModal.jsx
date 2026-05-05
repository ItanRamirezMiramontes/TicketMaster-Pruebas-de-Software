import { useEffect, useMemo, useState } from "react";
import { CheckCircle2, X, Calendar, Ticket } from "lucide-react";
import api from "../api/axios";
import SeatSelector from "./SeatSelector";
import CineSeatSelector, { ROOM_TYPES } from "./CineSeatSelector";
import { getCategoryLabel, getCityName, getEventPriceLabel, formatEventTime, getImageUrl, getVenueName, getEventDateLong, isHoliday as checkHoliday, getCineForEvent, getClasificacionForEvent, RESTRICCIONES_POR_TIPO, HORARIOS_POR_TIPO, MAX_TICKETS, DEFAULT_PRICE } from "../utils/eventHelpers";

const getMinPrice = (event) => event.priceRanges?.[0]?.min ?? null;

const PurchaseModal = ({ event, type, user, onClose, onSuccess }) => {
  const [method, setMethod] = useState("CREDITO");
  const [tickets, setTickets] = useState(1);
  const [selectedSeats, setSelectedSeats] = useState([]);
  const [roomType, setRoomType] = useState(type === "cine" ? ROOM_TYPES[0] : null);
  const [date, setDate] = useState(new Date().toISOString().slice(0, 10));
  const [cardName, setCardName] = useState("");
  const [cardNumber, setCardNumber] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [result, setResult] = useState(null);
  const [occupiedSeats, setOccupiedSeats] = useState([]);

  const maxTickets = MAX_TICKETS[type] ?? 10;

  const basePrice = DEFAULT_PRICE[type] ?? 500;
  const price = type === "museo" ? basePrice : getMinPrice(event) ?? basePrice;
  const priceMultiplier = type === "cine" && roomType ? roomType.priceMultiplier : 1;
  const subtotal = tickets * price * priceMultiplier;
  const endpoint = type === "museo" ? "/tickets/museo" : `/tickets/${type}`;

  useEffect(() => {
    if (type === "cine") {
      setRoomType(ROOM_TYPES[0]);
    } else {
      setRoomType(null);
    }
    setSelectedSeats([]);
  }, [type, event.id]);

  useEffect(() => {
    const fetchOccupiedSeats = async () => {
      if (type === "museo") return;
      try {
        const response = await api.get(`/seats/${type}/${event.id}`);
        setOccupiedSeats(response.data);
      } catch (err) {
        console.error("Error fetching occupied seats:", err);
        setOccupiedSeats([]);
      }
    };
    fetchOccupiedSeats();
  }, [event.id, type]);

  useEffect(() => {
    const handleEsc = (e) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handleEsc);
    return () => window.removeEventListener("keydown", handleEsc);
  }, [onClose]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    if (!user) {
      setError("Inicia sesión para continuar con la compra.");
      return;
    }
    if (!date) {
      setError("Selecciona una fecha válida.");
      return;
    }
    if (checkHoliday(date)) {
      setError("No se permiten reservas en días festivos.");
      return;
    }
    if (type !== "museo" && selectedSeats.length !== tickets) {
      setError(`Selecciona ${tickets} asiento${tickets !== 1 ? "s" : ""} antes de continuar.`);
      return;
    }
    if (method !== "PAYPAL") {
      if (!cardName.trim()) {
        setError("El nombre del titular es obligatorio.");
        return;
      }
      if (!/^[A-Za-zÁÉÍÓÚÜÑáéíóúüñ ]+$/.test(cardName.trim())) {
        setError("El nombre del titular solo puede contener letras y espacios.");
        return;
      }
      if (!cardNumber || !/^\d{8,19}$/.test(cardNumber)) {
        setError("El número de tarjeta debe tener entre 8 y 19 dígitos.");
        return;
      }
    }
    setLoading(true);
    try {
      const payload = {
        usuario: user.usuario,
        contrasena: user.contrasena,
        boletos: tickets,
        fecha: date,
        pago: {
          metodo: method,
          nombre_tarjeta: method === "PAYPAL" ? null : cardName,
          numero_tarjeta: method === "PAYPAL" ? null : cardNumber,
        },
        selected_seats: type === "museo" ? [] : selectedSeats,
        ...(type === "museo" ? { venue_id: event.id } : { event_id: event.id }),
      };
      const response = await api.post(endpoint, payload);
      setResult(response.data);
    } catch (err) {
      setError(err?.response?.data?.detail || "No se pudo completar la compra. Verifica los datos.");
    } finally {
      setLoading(false);
    }
  };

  const title = event.name;
  const subtitle = type === "museo" ? `${getCityName(event)} · ${event.address?.line1 ?? "Dirección por confirmar"}` : `${getVenueName(event)} · ${getCityName(event)}`;
  const longDate = type === "museo" ? "Entrada flexible" : `${getEventDateLong(event)} · ${formatEventTime(event)}`;
  const categoryLabel = getCategoryLabel(type);

  const cineInfo = type === "cine" ? getCineForEvent(event.id) : null;
  const clasificacion = type === "cine" ? getClasificacionForEvent(event.id) : null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto bg-black/80 p-4 backdrop-blur-sm"
      role="dialog"
      aria-modal="true"
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-2xl max-h-[calc(100vh-4rem)] overflow-y-auto rounded-[2rem] bg-slate-900 shadow-2xl shadow-black/50"
        onClick={(e) => e.stopPropagation()}
      >
        <button type="button" onClick={onClose} aria-label="Cerrar modal" className="absolute right-4 top-4 rounded-full bg-slate-950/80 p-2 text-slate-200 transition hover:bg-slate-900">
          <X className="h-4 w-4" />
        </button>
        <div className="relative h-56 overflow-hidden">
          <img src={getImageUrl(event, type)} alt={title} className="h-full w-full object-cover" />
          <div className="absolute inset-0 bg-gradient-to-t from-black via-black/60 to-transparent" />
          <div className="absolute inset-x-0 bottom-0 p-6 text-white">
            <span className="inline-flex rounded-full bg-white/10 px-3 py-1 text-xs uppercase tracking-[0.35em] text-white/80">{categoryLabel}</span>
            <h2 className="mt-4 text-3xl font-bold">{title}</h2>
            <p className="mt-2 text-sm text-slate-200">{subtitle}</p>
            <p className="mt-1 text-sm text-slate-300">{longDate}</p>
          </div>
        </div>
        <div className="space-y-6 p-6">
          {!user ? (
            <div className="rounded-3xl border border-white/10 bg-slate-950 p-6 text-center text-slate-200">
              <Ticket className="mx-auto h-12 w-12 text-slate-100" />
              <h3 className="mt-4 text-2xl font-semibold">Inicia sesión para continuar</h3>
              <p className="mt-2 text-slate-400">Accede con tu cuenta y completa la compra en segundos.</p>
              <button type="button" onClick={onClose} className="mt-6 inline-flex items-center justify-center rounded-2xl bg-indigo-600 px-6 py-3 text-sm font-semibold text-white transition hover:bg-indigo-500">Cerrar</button>
            </div>
          ) : result ? (
            <div className="space-y-5 rounded-3xl border border-emerald-500/30 bg-emerald-500/10 p-6 text-slate-100">
              <div className="flex items-center gap-3 text-emerald-300">
                <CheckCircle2 className="h-6 w-6" />
                <h3 className="text-xl font-semibold">¡Compra exitosa!</h3>
              </div>
              <p>ID de compra: <span className="font-semibold text-white">{result.purchase_id}</span></p>
              <p>Total pagado: <span className="font-semibold text-white">${result.total?.toFixed(2) ?? subtotal.toFixed(2)} MXN</span></p>
              <p className="text-slate-300">{result.detalles?.restricciones}</p>
              <button type="button" onClick={() => { onSuccess(); onClose(); }} className="mt-4 inline-flex w-full items-center justify-center rounded-2xl bg-white px-6 py-3 text-sm font-semibold text-slate-950 transition hover:bg-slate-100">Cerrar</button>
            </div>
          ) : (
            <form className="space-y-6" onSubmit={handleSubmit}>
              {/* ── SECCIÓN 1: Información del evento (read-only) ────── */}
              <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-4">
                <div className="flex items-center gap-4">
                  <img src={getImageUrl(event, type)} alt={event.name}
                    className="h-16 w-12 rounded-xl object-cover" />
                  <div className="flex-1 min-w-0">
                    <p className="truncate font-semibold text-white">{event.name}</p>
                    <p className="mt-1 text-xs text-slate-400">
                      {type === "museo"
                        ? `📍 ${getCityName(event)}`
                        : `📍 ${getVenueName(event)} · ${getCityName(event)}`}
                    </p>
                    {type === "cine" && cineInfo && (
                      <p className="mt-1 text-xs text-sky-300">
                        🎬 {cineInfo.name} · Clasificación: {clasificacion}
                      </p>
                    )}
                    {type === "teatro" && (
                      <p className="mt-1 text-xs text-amber-300">
                        👔 Vestimenta: Formal / Semi-formal
                      </p>
                    )}
                    {type === "museo" && (
                      <p className="mt-1 text-xs text-emerald-300">
                        🕐 {HORARIOS_POR_TIPO.museo}
                      </p>
                    )}
                  </div>
                </div>
                <div className="mt-3 rounded-xl bg-slate-950/60 px-3 py-2 text-xs text-slate-400">
                  ⚠ {RESTRICCIONES_POR_TIPO[type]}
                </div>
              </div>

              {/* ── SECCIÓN 2: Boletos y fecha ──────────────────────── */}
              <div className="grid gap-4 sm:grid-cols-2">
                <label className="block text-sm text-slate-300">
                  Boletos
                  <select value={tickets} onChange={(e) => { setTickets(Number(e.target.value)); setSelectedSeats([]); }} className="mt-2 w-full rounded-2xl border border-slate-800 bg-slate-950 px-4 py-3 text-slate-100">
                    {Array.from({ length: maxTickets }, (_, index) => index + 1).map((value) => (<option key={value} value={value}>{value}</option>))}
                  </select>
                </label>
                <label className="block text-sm text-slate-300">
                  Fecha
                  <div className="mt-2 flex items-center gap-3 rounded-2xl border border-slate-800 bg-slate-950 px-4 py-3">
                    <Calendar className="h-4 w-4 text-slate-400" />
                    <input type="date" min={new Date().toISOString().slice(0, 10)} value={date} onChange={(e) => setDate(e.target.value)} className="w-full bg-transparent text-slate-100" />
                  </div>
                </label>
              </div>

              {/* ── SECCIÓN 3: Selector de asientos ────────────────── */}
              {type !== "museo" ? (
                type === "cine" ? (
                  <CineSeatSelector
                    eventId={event.id}
                    eventName={event.name}
                    tickets={tickets}
                    selectedSeats={selectedSeats}
                    onSelectedSeatsChange={setSelectedSeats}
                    onRoomTypeChange={setRoomType}
                    occupiedSeats={occupiedSeats}
                  />
                ) : (
                  <SeatSelector eventId={event.id} eventName={event.name} tickets={tickets} selectedSeats={selectedSeats} onSelectedSeatsChange={setSelectedSeats} totalSeats={40} occupiedSeats={occupiedSeats} />
                )
              ) : (
                <div className="rounded-3xl border border-slate-800 bg-slate-950/80 p-5 text-slate-200">
                  <p className="text-sm font-semibold text-white">Entrada flexible</p>
                  <p className="mt-2 text-sm text-slate-400">Este tipo de pase no requiere selección de asiento.</p>
                </div>
              )}

              {/* ── SECCIÓN 4: Método de pago ───────────────────────── */}
              <label className="block text-sm text-slate-300">
                Método de pago
                <select value={method} onChange={(e) => setMethod(e.target.value)} className="mt-2 w-full rounded-2xl border border-slate-800 bg-slate-950 px-4 py-3 text-slate-100">
                  <option value="CREDITO">CREDITO</option>
                  <option value="DEBITO">DEBITO</option>
                  <option value="PAYPAL">PAYPAL</option>
                </select>
              </label>
              {method !== "PAYPAL" && (
                <div className="space-y-4">
                  <label className="block text-sm text-slate-300">
                    Nombre del titular
                    <input value={cardName} onChange={(e) => setCardName(e.target.value)} placeholder="Nombre completo" className="mt-2 w-full rounded-2xl border border-slate-800 bg-slate-950 px-4 py-3 text-slate-100" />
                  </label>
                  <label className="block text-sm text-slate-300">
                    Número de tarjeta
                    <input value={cardNumber} onChange={(e) => setCardNumber(e.target.value.replace(/\D/g, ""))} placeholder="0000000000000000" className="mt-2 w-full rounded-2xl border border-slate-800 bg-slate-950 px-4 py-3 text-slate-100" />
                  </label>
                </div>
              )}

              {/* ── SECCIÓN 5: Resumen de compra ───────────────────── */}
              <div className="rounded-2xl border border-indigo-500/20 bg-indigo-500/5 p-4">
                <p className="text-xs uppercase tracking-[0.35em] text-slate-500 mb-3">
                  Resumen
                </p>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-slate-400">{tickets} boleto{tickets>1?"s":""}</span>
                    <span className="text-white">${basePrice} MXN c/u</span>
                  </div>
                  {type === "cine" && roomType && roomType.priceMultiplier !== 1 && (
                    <div className="flex justify-between">
                      <span className="text-slate-400">Sala {roomType.icon} {roomType.label}</span>
                      <span className="text-white">×{roomType.priceMultiplier}</span>
                    </div>
                  )}
                  <div className="flex justify-between border-t border-white/10 pt-2 font-semibold">
                    <span className="text-white">Total</span>
                    <span className="text-white text-lg">${subtotal.toFixed(2)} MXN</span>
                  </div>
                </div>
                {selectedSeats.length > 0 && (
                  <div className="mt-3 border-t border-white/10 pt-3">
                    <p className="text-xs text-slate-500 mb-2">Asientos:</p>
                    <div className="flex flex-wrap gap-1">
                      {selectedSeats.map((s) => (
                        <span key={s}
                          className="rounded-full bg-white/10 px-2 py-0.5 text-xs text-slate-200">
                          {s}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
              {error && (<p className="rounded-2xl border border-red-600 bg-red-600/10 px-4 py-3 text-sm text-red-200">{error}</p>)}
              <button type="submit" disabled={loading} className="inline-flex w-full items-center justify-center rounded-2xl bg-indigo-600 px-6 py-3 text-sm font-semibold text-white transition hover:bg-indigo-500 disabled:opacity-60 disabled:cursor-not-allowed">{loading ? "Procesando..." : "Confirmar compra"}</button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};

export default PurchaseModal;
