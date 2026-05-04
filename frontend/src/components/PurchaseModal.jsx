import { useEffect, useMemo, useState } from "react";
import { CheckCircle2, X, Calendar, Ticket } from "lucide-react";
import api from "../api/axios";
import SeatSelector from "./SeatSelector";

const getVenueName = (event) => event.embedded?.venues?.[0]?.name ?? event.name ?? "Venue por confirmar";
const getCityName = (event) => event.embedded?.venues?.[0]?.city?.name ?? event.city?.name ?? "Ciudad por confirmar";
const getImageUrl = (event, type) => {
  if (type === "museo") return "https://placehold.co/1200x800?text=Museo";
  return event.images?.[0]?.url ?? "https://placehold.co/1200x800?text=Evento";
};
const getMinPrice = (event) => event.priceRanges?.[0]?.min ?? null;
const getEventDateLong = (event) => {
  const raw = event.dates?.start?.dateTime;
  if (!raw) return "Fecha por confirmar";
  const d = new Date(raw);
  return d.toLocaleDateString("es-MX", { weekday: "long", day: "numeric", month: "long", year: "numeric" });
};
const getEventTime = (event) => {
  const raw = event.dates?.start?.dateTime;
  if (!raw) return "";
  return new Date(raw).toLocaleTimeString("es-MX", { hour: "2-digit", minute: "2-digit" });
};
const isHoliday = (dateString) => {
  if (!dateString) return false;
  const date = new Date(dateString);
  const month = date.getUTCMonth() + 1;
  const day = date.getUTCDate();
  return (
    (month === 1 && day === 1) ||
    (month === 5 && day === 1) ||
    (month === 9 && day === 16) ||
    (month === 11 && day === 20) ||
    (month === 12 && day === 25)
  );
};

const PurchaseModal = ({ event, type, user, onClose, onSuccess }) => {
  const [method, setMethod] = useState("CREDITO");
  const [tickets, setTickets] = useState(1);
  const [selectedSeats, setSelectedSeats] = useState([]);
  const [date, setDate] = useState(new Date().toISOString().slice(0, 10));
  const [cardName, setCardName] = useState("");
  const [cardNumber, setCardNumber] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [result, setResult] = useState(null);
  const [occupiedSeats, setOccupiedSeats] = useState([]);

  const maxTickets = useMemo(() => {
    if (type === "cine") return 10;
    if (type === "teatro") return 10;
    if (type === "musica") return 12;
    return 5;
  }, [type]);

  const price = type === "museo" ? 220 : getMinPrice(event) ?? 220;
  const subtotal = tickets * price;
  const endpoint = type === "museo" ? "/tickets/museo" : `/tickets/${type}`;

  useEffect(() => {
    const fetchOccupiedSeats = async () => {
      if (type === "museo") return; // No seats for museo
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
    if (isHoliday(date)) {
      setError("No se permiten reservas en días festivos");
      return;
    }
    if (selectedSeats.length !== tickets) {
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
        selected_seats: selectedSeats,
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
  const longDate = type === "museo" ? "Entrada flexible" : `${getEventDateLong(event)} · ${getEventTime(event)}`;

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
            <span className="inline-flex rounded-full bg-white/10 px-3 py-1 text-xs uppercase tracking-[0.35em] text-white/80">{type === "museo" ? "Museo" : type === "musica" ? "Concierto" : type === "teatro" ? "Teatro" : "Cine"}</span>
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
              <div className="grid gap-5 sm:grid-cols-2">
                <label className="block text-sm text-slate-300">Boletos
                  <select value={tickets} onChange={(e) => { setTickets(Number(e.target.value)); setSelectedSeats([]); }} className="mt-2 w-full rounded-2xl border border-slate-800 bg-slate-950 px-4 py-3 text-slate-100">
                    {Array.from({ length: maxTickets }, (_, index) => index + 1).map((value) => (<option key={value} value={value}>{value}</option>))}
                  </select>
                </label>
                <label className="block text-sm text-slate-300">Fecha
                  <div className="mt-2 flex items-center gap-3 rounded-2xl border border-slate-800 bg-slate-950 px-4 py-3">
                    <Calendar className="h-4 w-4 text-slate-400" />
                    <input type="date" min={new Date().toISOString().slice(0, 10)} value={date} onChange={(e) => setDate(e.target.value)} className="w-full bg-transparent text-slate-100" />
                  </div>
                </label>
              </div>
              <SeatSelector eventId={event.id} eventName={event.name} tickets={tickets} selectedSeats={selectedSeats} onSelectedSeatsChange={setSelectedSeats} totalSeats={40} />
              <label className="block text-sm text-slate-300">Método de pago
                <select value={method} onChange={(e) => setMethod(e.target.value)} className="mt-2 w-full rounded-2xl border border-slate-800 bg-slate-950 px-4 py-3 text-slate-100">
                  <option value="CREDITO">CREDITO</option>
                  <option value="DEBITO">DEBITO</option>
                  <option value="PAYPAL">PAYPAL</option>
                </select>
              </label>
              {method !== "PAYPAL" ? (
                <div className="grid gap-5 sm:grid-cols-2">
                  <label className="block text-sm text-slate-300">Nombre en la tarjeta
                    <input value={cardName} onChange={(e) => setCardName(e.target.value)} placeholder="Nombre completo" className="mt-2 w-full rounded-2xl border border-slate-800 bg-slate-950 px-4 py-3 text-slate-100" />
                  </label>
                  <label className="block text-sm text-slate-300">Número de tarjeta
                    <input value={cardNumber} onChange={(e) => setCardNumber(e.target.value.replace(/\D/g, ""))} placeholder="0000000000000000" className="mt-2 w-full rounded-2xl border border-slate-800 bg-slate-950 px-4 py-3 text-slate-100" />
                  </label>
                </div>
              ) : null}
              <div className="rounded-3xl border border-slate-800 bg-slate-950/80 p-5">
                <p className="text-sm uppercase tracking-[0.35em] text-slate-500">Resumen</p>
                <p className="mt-4 text-lg font-semibold text-white">Subtotal</p>
                <p className="text-slate-300">${subtotal.toFixed(2)} MXN</p>
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
