import { useMemo } from "react";

const ROW_LETTERS = ["A", "B", "C", "D", "E", "F", "G", "H"];
const SEATS_PER_ROW = 10;

const buildSeatId = (row, col) => `${ROW_LETTERS[row]}${col + 1}`;

const CineSeatSelector = ({ eventName, tickets, selectedSeats, onSelectedSeatsChange, occupiedSeats = [] }) => {
  const rows = useMemo(() => {
    const occupiedSet = new Set(occupiedSeats);
    return ROW_LETTERS.map((letter, rowIndex) => ({
      letter,
      seats: Array.from({ length: SEATS_PER_ROW }, (_, colIndex) => {
        const id = buildSeatId(rowIndex, colIndex);
        return { id, available: !occupiedSet.has(id) };
      }),
    }));
  }, [occupiedSeats]);

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
          <h3 className="text-lg font-semibold text-white">Selecciona tus asientos</h3>
          <p className="mt-2 text-sm text-slate-400">Sala de cine para {eventName}. Selecciona hasta {tickets} asiento{tickets !== 1 ? "s" : ""}.</p>
        </div>
        <div className="rounded-2xl bg-slate-900 px-4 py-2 text-sm text-slate-200">Seleccionados: {selectedSeats.length}/{tickets}</div>
      </div>
      <div className="mt-5 rounded-3xl bg-slate-900 p-5">
        <div className="mx-auto mb-6 h-12 w-4/5 rounded-full bg-slate-700 text-center text-sm font-semibold uppercase tracking-[0.25em] text-slate-300">PANTALLA</div>
        <div className="space-y-3">
          {rows.map((row) => (
            <div key={row.letter} className="flex items-center gap-3">
              <span className="w-6 text-right text-xs font-semibold uppercase text-slate-500">{row.letter}</span>
              <div className="grid grid-cols-10 gap-2">
                {row.seats.map((seat) => {
                  const selected = selectedSeats.includes(seat.id);
                  return (
                    <button
                      key={seat.id}
                      type="button"
                      onClick={() => handleSeatClick(seat.id, seat.available)}
                      className={`h-10 rounded-xl border text-xs font-semibold transition focus:outline-none ${seat.available ? "border-slate-700 bg-slate-950 text-slate-100 hover:border-indigo-500 hover:bg-slate-800" : "cursor-not-allowed border-slate-700 bg-slate-800 text-slate-500"} ${selected ? "border-emerald-400 bg-emerald-500/20 text-emerald-200" : ""}`}
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
      </div>
      <div className="mt-4 grid gap-2 sm:grid-cols-3 text-sm text-slate-400">
        <p><span className="font-semibold text-white">Asientos ocupados</span> no pueden seleccionarse.</p>
        <p><span className="font-semibold text-white">Haz clic</span> para seleccionar o quitar.</p>
        <p><span className="font-semibold text-white">Máximo</span> {tickets} por compra.</p>
      </div>
      <div className="mt-3 flex flex-wrap gap-3 text-xs text-slate-500">
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

export default CineSeatSelector;
