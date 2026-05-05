import { useMemo } from "react";

const ROW_LETTERS = ["A", "B", "C", "D", "E", "F", "G", "H", "I", "J"];

const buildSeatId = (row, col) => `${ROW_LETTERS[row]}${col + 1}`;

const SeatSelector = ({ eventId, eventName, tickets, selectedSeats, onSelectedSeatsChange, totalSeats = 80, occupiedSeats = [] }) => {
  const seats = useMemo(() => {
    const columns = 10;
    const rows = Math.min(ROW_LETTERS.length, Math.ceil(totalSeats / columns));
    const occupiedSet = new Set(occupiedSeats);
    const items = [];

    for (let row = 0; row < rows; row += 1) {
      const rowSeats = [];
      for (let col = 0; col < columns; col += 1) {
        if (rowSeats.length >= columns || items.flat().length >= totalSeats) break;
        const id = buildSeatId(row, col);
        rowSeats.push({ id, available: !occupiedSet.has(id) });
      }
      items.push(rowSeats);
    }
    return items;
  }, [totalSeats, occupiedSeats]);

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
        <div className={`rounded-2xl px-4 py-2 text-sm font-semibold transition
          ${selectedSeats.length === tickets
            ? "bg-emerald-500/20 text-emerald-200 border border-emerald-500/30"
            : "bg-slate-900 text-slate-200"}`}>
          {selectedSeats.length === tickets
            ? `✓ ${selectedSeats.length}/${tickets} completos`
            : `${selectedSeats.length}/${tickets} seleccionados`}
        </div>
      </div>
      <div className="mt-5 flex justify-center">
        <div className="rounded-t-3xl bg-slate-800 px-8 py-3 text-center text-sm font-semibold text-slate-300">ESCENARIO</div>
      </div>
      <div className="mt-2 space-y-2 rounded-3xl bg-slate-900 p-4">
        <div className="flex items-center gap-1 mb-1">
          <span className="w-6" />
          <div className="grid w-full gap-2"
            style={{ gridTemplateColumns: `repeat(10, minmax(0, 1fr))` }}>
            {Array.from({ length: 10 }, (_, i) => (
              <span key={i} className="text-center text-[9px] text-slate-600 font-medium">
                {i + 1}
              </span>
            ))}
          </div>
        </div>
        {seats.map((rowSeats, rowIndex) => (
          <div key={ROW_LETTERS[rowIndex]} className="flex items-center gap-1 overflow-hidden">
            <span className="w-6 text-center text-xs font-semibold text-slate-500">{ROW_LETTERS[rowIndex]}</span>
            <div className="grid w-full gap-2" style={{ gridTemplateColumns: `repeat(${rowSeats.length}, minmax(0, 1fr))` }}>
              {rowSeats.map((seat) => {
                const selected = selectedSeats.includes(seat.id);
                return (
                  <button
                    key={seat.id}
                    type="button"
                    onClick={() => handleSeatClick(seat.id, seat.available)}
                    className={`aspect-square min-h-[2rem] rounded-xl border text-[10px] font-semibold transition focus:outline-none ${
                      seat.available
                        ? "border-slate-700 bg-slate-950 text-slate-100 hover:border-indigo-500 hover:bg-slate-800"
                        : "cursor-not-allowed border-slate-700 bg-slate-800 text-slate-500"
                    } ${selected ? "border-emerald-400 bg-emerald-500/20 text-emerald-200" : ""}`}
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
                className="inline-flex items-center gap-1 rounded-full border border-emerald-500/30
                  bg-emerald-500/20 px-3 py-1 text-xs font-semibold text-emerald-200
                  transition hover:opacity-80"
                title={`Quitar asiento ${seat}`}
              >
                {seat} <span className="text-[10px] opacity-70">✕</span>
              </button>
            ))}
          </div>
          <p className="mt-3 text-xs text-slate-500">Haz clic en un asiento para quitarlo.</p>
        </div>
      )}

      <div className="mt-4 grid gap-2 sm:grid-cols-3 text-sm text-slate-400">
        <p><span className="font-semibold text-white">Asientos ocupados</span> no están disponibles.</p>
        <p><span className="font-semibold text-white">Haz clic</span> para seleccionar o quitar.</p>
        <p><span className="font-semibold text-white">Máximo</span> {tickets} por compra.</p>
      </div>
      <div className="mt-3 flex flex-wrap gap-4 text-xs text-slate-500">
        <div className="flex items-center gap-2">
          <div className="h-4 w-4 rounded border border-slate-700 bg-slate-950" /> Disponible
        </div>
        <div className="flex items-center gap-2">
          <div className="h-4 w-4 rounded border border-slate-700 bg-slate-800" /> Ocupado
        </div>
        <div className="flex items-center gap-2">
          <div className="h-4 w-4 rounded border border-emerald-400 bg-emerald-500/20" /> Seleccionado
        </div>
      </div>
    </div>
  );
};

export default SeatSelector;
