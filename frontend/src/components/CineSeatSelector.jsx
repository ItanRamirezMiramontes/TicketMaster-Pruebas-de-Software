import { useEffect, useMemo, useState } from "react";

export const ROOM_TYPES = [
  {
    id: "standard",
    label: "Estándar",
    icon: "🎬",
    rows: 8,
    cols: 10,
    description: "Pantalla convencional · Sonido Dolby Digital",
    priceMultiplier: 1.0,
    accentClass: "border-sky-500 bg-sky-500/20 text-sky-200",
    hoverClass: "hover:border-sky-500 hover:bg-slate-800",
    selectedClass: "border-sky-400 bg-sky-500/20 text-sky-100",
  },
  {
    id: "imax",
    label: "IMAX",
    icon: "🌐",
    rows: 10,
    cols: 12,
    description: "Pantalla gigante · Sonido 12.1 canales",
    priceMultiplier: 1.5,
    accentClass: "border-violet-500 bg-violet-500/20 text-violet-200",
    hoverClass: "hover:border-violet-500 hover:bg-slate-800",
    selectedClass: "border-violet-400 bg-violet-500/20 text-violet-100",
  },
  {
    id: "4dx",
    label: "4DX",
    icon: "💺",
    rows: 6,
    cols: 8,
    description: "Asientos móviles · Efectos ambientales",
    priceMultiplier: 1.8,
    accentClass: "border-amber-500 bg-amber-500/20 text-amber-200",
    hoverClass: "hover:border-amber-500 hover:bg-slate-800",
    selectedClass: "border-amber-400 bg-amber-500/20 text-amber-100",
  },
  {
    id: "3d",
    label: "3D",
    icon: "🥽",
    rows: 8,
    cols: 10,
    description: "Proyección 3D · Lentes incluidos",
    priceMultiplier: 1.2,
    accentClass: "border-emerald-500 bg-emerald-500/20 text-emerald-200",
    hoverClass: "hover:border-emerald-500 hover:bg-slate-800",
    selectedClass: "border-emerald-400 bg-emerald-500/20 text-emerald-100",
  },
  {
    id: "espanol",
    label: "Español",
    icon: "🌎",
    rows: 8,
    cols: 10,
    description: "Versión doblada al español latino",
    priceMultiplier: 1.0,
    accentClass: "border-rose-500 bg-rose-500/20 text-rose-200",
    hoverClass: "hover:border-rose-500 hover:bg-slate-800",
    selectedClass: "border-rose-400 bg-rose-500/20 text-rose-100",
  },
  {
    id: "subtitulada",
    label: "Subtitulada",
    icon: "📝",
    rows: 8,
    cols: 10,
    description: "Versión original · Subtítulos en español",
    priceMultiplier: 1.0,
    accentClass: "border-indigo-500 bg-indigo-500/20 text-indigo-200",
    hoverClass: "hover:border-indigo-500 hover:bg-slate-800",
    selectedClass: "border-indigo-400 bg-indigo-500/20 text-indigo-100",
  },
];

const ROW_LETTERS = ["A", "B", "C", "D", "E", "F", "G", "H", "I", "J", "K", "L"];

const hashId = (str) => {
  let h = 0;
  for (let i = 0; i < str.length; i += 1) {
    h = (h * 31 + str.charCodeAt(i)) >>> 0;
  }
  return h;
};

const buildSeatId = (row, col) => `${ROW_LETTERS[row]}${col + 1}`;

const CineSeatSelector = ({ eventId, eventName, tickets, selectedSeats, onSelectedSeatsChange, onRoomTypeChange, occupiedSeats = [] }) => {
  const defaultRoomIndex = useMemo(
    () => (eventId ? hashId(String(eventId)) % ROOM_TYPES.length : 0),
    [eventId]
  );
  const [activeRoomIdx, setActiveRoomIdx] = useState(defaultRoomIndex);
  const room = ROOM_TYPES[activeRoomIdx];

  useEffect(() => {
    onRoomTypeChange?.(room);
  }, [room, onRoomTypeChange]);

  const rows = useMemo(() => {
    const occupiedSet = new Set(occupiedSeats);
    return Array.from({ length: room.rows }, (_, rowIndex) => ({
      letter: ROW_LETTERS[rowIndex],
      seats: Array.from({ length: room.cols }, (_, colIndex) => {
        const id = buildSeatId(rowIndex, colIndex);
        return { id, available: !occupiedSet.has(id) };
      }),
    }));
  }, [room, occupiedSeats]);

  const handleRoomChange = (index) => {
    setActiveRoomIdx(index);
    onSelectedSeatsChange([]);
  };

  const handleSeatClick = (seatId, available) => {
    if (!available) return;
    if (selectedSeats.includes(seatId)) {
      onSelectedSeatsChange(selectedSeats.filter((seat) => seat !== seatId));
      return;
    }
    if (selectedSeats.length >= tickets) return;
    onSelectedSeatsChange([...selectedSeats, seatId]);
  };

  return (
    <div className="rounded-3xl border border-slate-800 bg-slate-950/80 p-5">
      <div className="flex flex-col gap-4">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h3 className="text-lg font-semibold text-white">Selecciona tus asientos</h3>
            <p className="mt-2 text-sm text-slate-400">Sala de cine para {eventName}. Selecciona hasta {tickets} asiento{tickets !== 1 ? "s" : ""}.</p>
          </div>
          <div className={`rounded-2xl px-4 py-2 text-sm font-semibold transition
            ${selectedSeats.length === tickets
              ? "bg-emerald-500/20 text-emerald-200 border border-emerald-500/30"
              : "bg-slate-900 text-slate-200"}`}>
            {selectedSeats.length === tickets
              ? `✓ ${selectedSeats.length}/${tickets} seleccionados`
              : `${selectedSeats.length}/${tickets} seleccionados`}
          </div>
        </div>
        <div className="scrollbar-hide flex gap-2 overflow-x-auto pb-2">
          {ROOM_TYPES.map((option, index) => {
            const active = index === activeRoomIdx;
            return (
              <button
                key={option.id}
                type="button"
                onClick={() => handleRoomChange(index)}
                className={`shrink-0 rounded-3xl border px-4 py-3 text-left text-sm font-semibold transition ${active ? option.selectedClass : `border border-white/10 bg-slate-900 text-slate-300 ${option.hoverClass}`}`}
              >
                <div className="flex items-center gap-2">
                  <span>{option.icon}</span>
                  <span>{option.label}</span>
                </div>
                <p className="mt-1 text-[11px] text-slate-400">×{option.priceMultiplier}</p>
              </button>
            );
          })}
        </div>
        <div className="rounded-3xl border border-slate-800 bg-slate-900 p-4 text-slate-200">
          <div className="flex items-center justify-between gap-4">
            <div>
              <p className="text-sm font-semibold text-white">{room.icon} {room.label}</p>
              <p className="mt-1 text-sm text-slate-400">{room.description}</p>
            </div>
            <span className="rounded-full border border-slate-700 bg-slate-950 px-3 py-1 text-xs font-semibold text-slate-200">×{room.priceMultiplier}</span>
          </div>
        </div>
      </div>

      <div className="mt-5 flex justify-center">
        <div className="mx-auto mb-6 h-3 w-4/5 rounded-full bg-gradient-to-r from-transparent via-white/40 to-transparent shadow-[0_0_20px_4px_rgba(255,255,255,0.12)]" />
      </div>
      <div className="text-center text-xs uppercase tracking-[0.35em] text-slate-500">PANTALLA</div>

      <div className="mt-4 rounded-3xl bg-slate-900 p-4">
        <div className="flex items-center gap-1 mb-1">
          <span className="w-6" />
          <div className="grid w-full gap-2"
            style={{ gridTemplateColumns: `repeat(${room.cols}, minmax(0, 1fr))` }}>
            {Array.from({ length: room.cols }, (_, i) => (
              <span key={i} className="text-center text-[9px] text-slate-600 font-medium">
                {i + 1}
              </span>
            ))}
          </div>
        </div>
        {rows.map((row) => (
          <div key={row.letter} className="mb-3 flex items-center gap-3 last:mb-0">
            <span className="w-6 text-right text-xs font-semibold uppercase text-slate-500">{row.letter}</span>
            <div className="grid w-full gap-2" style={{ gridTemplateColumns: `repeat(${row.seats.length}, minmax(0, 1fr))` }}>
              {row.seats.map((seat) => {
                const selected = selectedSeats.includes(seat.id);
                return (
                  <button
                    key={seat.id}
                    type="button"
                    onClick={() => handleSeatClick(seat.id, seat.available)}
                    className={`aspect-square min-h-[2.4rem] rounded-2xl border text-[10px] font-semibold transition focus:outline-none ${
                      seat.available
                        ? "border-slate-700 bg-slate-950 text-slate-100 hover:border-sky-400 hover:bg-slate-800"
                        : "cursor-not-allowed border-slate-700 bg-slate-800 text-slate-500"
                    } ${selected ? room.selectedClass : ""}`}
                    title={seat.available
                      ? selectedSeats.includes(seat.id)
                        ? `Quitar asiento ${seat.id}`
                        : `Seleccionar asiento ${seat.id}`
                      : `Asiento ${seat.id} — No disponible`}
                  >
                    {seat.id.slice(1)}
                  </button>
                );
              })}
            </div>
          </div>
        ))}
      </div>

      {selectedSeats.length > 0 && (
        <div className="mt-4 rounded-2xl border border-slate-700 bg-slate-900 p-4">
          <p className="text-xs uppercase tracking-[0.35em] text-slate-500 mb-3">
            Asientos seleccionados
          </p>
          <div className="flex flex-wrap gap-2">
            {selectedSeats.map((seat) => (
              <button
                key={seat}
                type="button"
                onClick={() => onSelectedSeatsChange(selectedSeats.filter((s) => s !== seat))}
                className={`inline-flex items-center gap-1 rounded-full border px-3 py-1
                  text-xs font-semibold transition hover:opacity-80 ${room.accentClass}`}
                title={`Quitar asiento ${seat}`}
              >
                {seat} <span className="text-[10px] opacity-70">✕</span>
              </button>
            ))}
          </div>
          <p className="mt-3 text-xs text-slate-500">
            Haz clic en un asiento seleccionado para quitarlo.
          </p>
        </div>
      )}

      <div className="mt-4 grid gap-3 sm:grid-cols-3 text-sm text-slate-400">
        <p><span className="font-semibold text-white">Disponible</span> para seleccionar.</p>
        <p><span className="font-semibold text-white">Ocupado</span> no puede usarse.</p>
        <p><span className="font-semibold text-white">Seleccionado</span> refleja su compra.</p>
      </div>
    </div>
  );
};

export default CineSeatSelector;
