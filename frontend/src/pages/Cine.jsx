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

      <RegionFilter
        territories={territories}
        selectedTerritory={selectedTerritory}
        onSelect={selectTerritory}
        loading={loadingTerritories}
      />

      <div className="flex items-center gap-6 text-sm text-slate-400">
        <span>Ticketmaster: <strong className="text-white">{cine.length}</strong></span>
        <span>MovieGlu: <strong className="text-white">{films.length}</strong></span>
        <span>Total: <strong className="text-white">{allFilms.length}</strong></span>
      </div>

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
        <div className="space-y-8">
          {/* MovieGlu section */}
          {films.length > 0 && (
            <div>
              <h2 className="text-2xl font-bold text-white mb-4">Películas MovieGlu</h2>
              <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-5">
                {films.map((film) => (
                  <EventCard
                    key={film.id}
                    event={film}
                    type="cine"
                    onBuyClick={openModal}
                    onDetailClick={onDetailClick}
                  />
                ))}
              </div>
            </div>
          )}

          {/* Separador */}
          {films.length > 0 && cine.length > 0 && (
            <div className="border-t border-white/10 pt-8">
              <h2 className="text-2xl font-bold text-white mb-4">Películas Ticketmaster</h2>
            </div>
          )}

          {/* Backend section */}
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-5">
            {cine.map((event) => (
              <EventCard
                key={event.id}
                event={event}
                type="cine"
                onBuyClick={openModal}
                onDetailClick={onDetailClick}
              />
            ))}
          </div>
        </div>
      )}
    </section>
  );
};

export default Cine;
