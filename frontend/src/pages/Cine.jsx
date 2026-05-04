import EventCard from "../components/EventCard";
import RegionFilter from "../components/RegionFilter";
import useEvents from "../hooks/useEvents";
import useMovieglu from "../hooks/useMovieglu";

const getImageUrl = (event) => event.images?.[0]?.url ?? "https://placehold.co/1200x800?text=Cine";
const getFilmPoster = (film) => film.poster?.thumb || film.poster?.medium || film.images?.poster?.thumb || "https://placehold.co/400x600?text=Pel%C3%ADcula";

const Cine = ({ openModal, onDetailClick }) => {
  const { cine, loading, error } = useEvents();
  const { films, territories, selectedTerritory, loadingFilms, loadingTerritories, error: movieError, selectTerritory } = useMovieglu();

  return (
    <section className="space-y-8">
      <div className="relative overflow-hidden rounded-[2rem] border border-white/10 bg-slate-950 shadow-2xl shadow-black/40">
        <img
          src={getImageUrl(cine[0] || { images: [{ url: "https://placehold.co/1200x800?text=Cine" }] })}
          alt="Cartelera de cine"
          className="h-72 w-full object-cover md:h-[32rem]"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black via-black/60 to-transparent" />
        <div className="absolute inset-x-0 bottom-0 p-8 text-white">
          <span className="inline-flex rounded-full bg-sky-500/20 px-4 py-2 text-xs uppercase tracking-[0.35em] text-sky-100">Cartelera de Cine</span>
          <h1 className="mt-4 text-4xl font-bold">Cartelera de Cine</h1>
          <p className="mt-3 max-w-2xl text-slate-300">{loading ? "Cargando eventos..." : `${cine.length} películas disponibles hoy`}</p>
        </div>
      </div>

      <div className="grid gap-6 xl:grid-cols-[1.6fr_0.9fr]">
        <div className="space-y-6">
          {error && (
            <div className="rounded-3xl border border-red-600 bg-red-600/10 p-6 text-red-200">
              <p>{error}</p>
              <button type="button" onClick={() => window.location.reload()} className="mt-4 rounded-2xl bg-slate-800 px-4 py-2 text-sm text-white transition hover:bg-slate-700">Reintentar</button>
            </div>
          )}

          {loading ? (
            <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-5">
              {Array.from({ length: 8 }, (_, index) => (
                <div key={index} className="h-80 rounded-3xl bg-slate-800 animate-pulse" />
              ))}
            </div>
          ) : cine.length === 0 ? (
            <div className="rounded-3xl border border-dashed border-white/10 bg-slate-900/80 p-12 text-center text-slate-400">
              <p className="text-2xl">No hay películas disponibles</p>
            </div>
          ) : (
            <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-5">
              {cine.map((event) => (
                <EventCard key={event.id} event={event} type="cine" onBuyClick={openModal} onDetailClick={onDetailClick} />
              ))}
            </div>
          )}
        </div>

        <aside className="space-y-6">
          <div className="rounded-3xl border border-white/10 bg-slate-950 p-6">
            <h2 className="text-lg font-semibold text-white">Películas MovieGlu</h2>
            <p className="mt-2 text-sm text-slate-400">Filtra por región para ver lo que está disponible cerca de ti.</p>
            <div className="mt-5">
              <RegionFilter territories={territories} selectedTerritory={selectedTerritory} onSelect={selectTerritory} loading={loadingTerritories} />
            </div>
          </div>

          <div className="rounded-3xl border border-white/10 bg-slate-950 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-lg font-semibold text-white">Ahora en cartelera</p>
                <p className="text-sm text-slate-400">Películas recomendadas de MovieGlu</p>
              </div>
              <span className="rounded-full bg-slate-900 px-3 py-1 text-xs uppercase tracking-[0.35em] text-slate-400">{selectedTerritory ?? "Todas"}</span>
            </div>

            {movieError && (
              <div className="mt-5 rounded-3xl border border-red-600 bg-red-600/10 p-4 text-sm text-red-200">{movieError}</div>
            )}

            {loadingFilms ? (
              <div className="mt-6 space-y-4">
                {Array.from({ length: 4 }, (_, index) => (
                  <div key={index} className="h-28 rounded-3xl bg-slate-800 animate-pulse" />
                ))}
              </div>
            ) : films.length === 0 ? (
              <div className="mt-6 rounded-3xl border border-dashed border-white/10 bg-slate-900/80 p-6 text-center text-slate-400">
                No hay películas de MovieGlu para esta región.
              </div>
            ) : (
              <div className="mt-6 space-y-4">
                {films.slice(0, 5).map((film) => (
                  <div key={film.id || film.title} className="flex items-center gap-4 rounded-3xl border border-white/10 bg-slate-900 p-3">
                    <img src={getFilmPoster(film)} alt={film.title} className="h-20 w-14 rounded-xl object-cover" />
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-semibold text-white">{film.title}</p>
                      <p className="mt-1 text-xs text-slate-400">{film.genre || film.certification || "Película"}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </aside>
      </div>
    </section>
  );
};

export default Cine;
