import EventCard from "../components/EventCard";
import RegionFilter from "../components/RegionFilter";
import useEvents from "../hooks/useEvents";
import useMovieglu from "../hooks/useMovieglu";

const getImageUrl = (event) => event.images?.[0]?.url ?? "https://placehold.co/1200x800?text=Cine";
const getFilmPoster = (film) => film.poster?.thumb || film.poster?.medium || film.images?.poster?.thumb || "https://placehold.co/400x600?text=Pel%C3%ADcula";

const Cine = ({ openModal, onDetailClick }) => {
  const { cine, loading, error } = useEvents();
  const { films, territories, selectedTerritory, loadingFilms, loadingTerritories, error: movieError, selectTerritory } = useMovieglu();

  // Combine Ticketmaster and MovieGlu films
  const allFilms = [
    ...cine.map(event => ({ ...event, source: 'ticketmaster' })),
    ...films.map(film => ({ ...film, source: 'movieglu' }))
  ];

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
          <p className="mt-3 max-w-2xl text-slate-300">{loading || loadingFilms ? "Cargando películas..." : `${allFilms.length} películas disponibles`}</p>
        </div>
      </div>

      <div className="grid gap-6 xl:grid-cols-[1.6fr_0.9fr]">
        <div className="space-y-6">
          {(error || movieError) && (
            <div className="rounded-3xl border border-red-600 bg-red-600/10 p-6 text-red-200">
              <p>{error || movieError}</p>
              <button type="button" onClick={() => window.location.reload()} className="mt-4 rounded-2xl bg-slate-800 px-4 py-2 text-sm text-white transition hover:bg-slate-700">Reintentar</button>
            </div>
          )}

          {loading || loadingFilms ? (
            <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-5">
              {Array.from({ length: 8 }, (_, index) => (
                <div key={index} className="h-80 rounded-3xl bg-slate-800 animate-pulse" />
              ))}
            </div>
          ) : allFilms.length === 0 ? (
            <div className="rounded-3xl border border-dashed border-white/10 bg-slate-900/80 p-12 text-center text-slate-400">
              <p className="text-2xl">No hay películas disponibles</p>
            </div>
          ) : (
            <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-5">
              {allFilms.map((film) => (
                film.source === 'ticketmaster' ? (
                  <EventCard key={film.id} event={film} type="cine" onBuyClick={openModal} onDetailClick={onDetailClick} />
                ) : (
                  <div key={film.id} className="group relative overflow-hidden rounded-3xl border border-white/10 bg-slate-950 shadow-lg transition hover:shadow-xl">
                    <div className="aspect-[3/4] overflow-hidden">
                      <img src={getFilmPoster(film)} alt={film.name} className="h-full w-full object-cover transition group-hover:scale-105" />
                    </div>
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent" />
                    <div className="absolute bottom-0 left-0 right-0 p-4 text-white">
                      <span className="inline-flex rounded-full bg-emerald-500/20 px-2 py-1 text-xs text-emerald-200 border border-emerald-500/30">MovieGlu</span>
                      <h3 className="mt-2 text-lg font-semibold line-clamp-2">{film.name}</h3>
                      <p className="mt-1 text-sm text-slate-300">{film.genre || film.certification || "Película"}</p>
                    </div>
                  </div>
                )
              ))}
            </div>
          )}
        </div>

        <aside className="space-y-6">
          <div className="rounded-3xl border border-white/10 bg-slate-950 p-6">
            <h2 className="text-lg font-semibold text-white">Filtrar por región</h2>
            <p className="mt-2 text-sm text-slate-400">Selecciona una región para ver películas disponibles cerca de ti.</p>
            <div className="mt-5">
              <RegionFilter territories={territories} selectedTerritory={selectedTerritory} onSelect={selectTerritory} loading={loadingTerritories} />
            </div>
          </div>

          <div className="rounded-3xl border border-white/10 bg-slate-950 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-lg font-semibold text-white">Estadísticas</p>
                <p className="text-sm text-slate-400">Resumen de la cartelera</p>
              </div>
            </div>
            <div className="mt-6 space-y-4">
              <div className="flex justify-between text-sm">
                <span className="text-slate-400">Ticketmaster:</span>
                <span className="text-white font-semibold">{cine.length}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-slate-400">MovieGlu:</span>
                <span className="text-white font-semibold">{films.length}</span>
              </div>
              <div className="flex justify-between text-sm border-t border-white/10 pt-2">
                <span className="text-slate-300">Total:</span>
                <span className="text-white font-semibold">{allFilms.length}</span>
              </div>
            </div>
          </div>
        </aside>
      </div>
    </section>
  );
};

export default Cine;
