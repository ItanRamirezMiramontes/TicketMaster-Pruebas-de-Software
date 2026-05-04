import { MapPin } from "lucide-react";

const RegionFilter = ({ territories, selectedTerritory, onSelect, loading }) => {
  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2 text-slate-300">
        <MapPin className="h-4 w-4 text-sky-400" />
        <span className="text-sm font-medium">Filtrar por región</span>
      </div>
      <div className="scrollbar-hide flex gap-2 overflow-x-auto pb-1">
        {loading ? (
          Array.from({ length: 6 }, (_, index) => (
            <div key={index} className="h-9 w-24 shrink-0 animate-pulse rounded-full bg-slate-800" />
          ))
        ) : (
          <>
            <button
              type="button"
              onClick={() => onSelect(null)}
              className={`shrink-0 rounded-full px-4 py-2 text-sm font-medium transition ${
                selectedTerritory === null
                  ? "bg-sky-600 text-white"
                  : "border border-white/10 bg-slate-900 text-slate-300 hover:bg-slate-800"
              }`}
            >
              Todas
            </button>
            {territories.map((territory) => (
              <button
                key={territory.code ?? territory.name}
                type="button"
                onClick={() => onSelect(territory.code ?? territory.name)}
                className={`shrink-0 rounded-full px-4 py-2 text-sm font-medium transition ${
                  selectedTerritory === (territory.code ?? territory.name)
                    ? "bg-sky-600 text-white"
                    : "border border-white/10 bg-slate-900 text-slate-300 hover:bg-slate-800"
                }`}
              >
                {territory.name ?? territory.code}
              </button>
            ))}
          </>
        )}
      </div>
    </div>
  );
};

export default RegionFilter;
