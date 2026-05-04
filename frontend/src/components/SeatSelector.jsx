import { useMemo } from "react";

const ROW_LETTERS = ["A", "B", "C", "D", "E", "F", "G", "H", "I", "J"];

const buildSeatId = (row, col) => `${ROW_LETTERS[row]}${col + 1}`;

const getBlockedSeatIds = (eventId, totalSeats) => {
  const blocked = new Set();
  let hash = 0;
  for (let i = 0; i < eventId.length; i += 1) {
    hash = (hash * 31 + eventId.charCodeAt(i)) % 1000;
  }

  const blockedCount = Math.min(12, Math.max(6, Math.floor(totalSeats * 0.2)));
  for (let i = 0; i < blockedCount; i += 1) {
    blocked.add(buildSeatId((hash + i) % ROW_LETTERS.length, ((hash + i) % 10)));
  }
  return blocked;
};

const SeatSelector = ({ eventId, eventName, tickets, selectedSeats, onSelectedSeatsChange, totalSeats = 80, occupiedSeats = [] }) => {
  const seats = useMemo(() => {
    const columns = 10;
    const rows = Math.min(ROW_LETTERS.length, Math.ceil(totalSeats / columns));
    const occupiedSet = new Set(occupiedSeats);
    const items = [];
    for (let row = 0; row < rows; row += 1) {
      const rowSeats = [];
      for (let col = 0; col < columns; col += 1) {
        const id = buildSeatId(row, col);
        if (items.length >= totalSeats) break;
        rowSeats.push({ id, available: !occupiedSet.has(id) });
      }
      items.push(rowSeats);
    }
    return items;
  }, [eventId, totalSeats, occupiedSeats]);

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
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h3 className="text-lg font-semibold text-white">Selección de asientos</h3>
          <p className="mt-2 text-sm text-slate-400">Elige hasta {tickets} asiento{tickets !== 1 ? "s" : ""} para {eventName}.</p>
        </div>
        <div className="rounded-2xl bg-slate-900 px-4 py-2 text-sm text-slate-200">Seleccionados: {selectedSeats.length}/{tickets}</div>
      </div>
      {/* Stage */}
      <div className="mt-5 flex justify-center">
        <div className="rounded-t-3xl bg-slate-800 px-8 py-3 text-center text-sm font-semibold text-slate-300">ESCENARIO</div>
      </div>
      <div className="mt-2 space-y-2 rounded-3xl bg-slate-900 p-4">
        {seats.map((rowSeats, rowIndex) => (
          <div key={ROW_LETTERS[rowIndex]} className="flex items-center gap-1">
            <span className="w-6 text-center text-xs font-semibold text-slate-500">{ROW_LETTERS[rowIndex]}</span>
            <div className="flex gap-1">
              {rowSeats.map((seat) => {
                const selected = selectedSeats.includes(seat.id);
                return (
                  <button
                    key={seat.id}
                    type="button"
                    onClick={() => handleSeatClick(seat.id, seat.available)}
                    className={`h-8 w-8 rounded border text-xs font-semibold transition focus:outline-none ${
                      seat.available
                        ? "border-slate-700 bg-slate-950 text-slate-100 hover:border-indigo-500 hover:bg-slate-800"
                        : "cursor-not-allowed border-slate-700 bg-slate-800 text-slate-500"
                    } ${selected ? "border-emerald-400 bg-emerald-500/20 text-emerald-200" : ""}`}
                    title={seat.available ? `Asiento ${seat.id}` : "No disponible"}
                  >
                    {seat.id.slice(1)}
                  </button>
                );
              })}
            </div>
          </div>
        ))}
      </div>
      <div className="mt-4 grid gap-2 sm:grid-cols-3 text-sm text-slate-400">
        <p><span className="font-semibold text-white">Asientos ocupados</span> no están disponibles.</p>
        <p><span className="font-semibold text-white">Haz clic</span> para seleccionar o quitar.</p>
        <p><span className="font-semibold text-white">Máximo</span> {tickets} por compra.</p>
      </div>
      <div className="mt-3 flex justify-center gap-4 text-xs text-slate-500">
        <div className="flex items-center gap-2">
          <div className="h-4 w-4 rounded border border-slate-700 bg-slate-950"></div>
          <span>Disponible</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="h-4 w-4 rounded border border-slate-700 bg-slate-800"></div>
          <span>Ocupado</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="h-4 w-4 rounded border border-emerald-400 bg-emerald-500/20"></div>
          <span>Seleccionado</span>
        </div>
      </div>
    </div>
  );
};

export default SeatSelector;
