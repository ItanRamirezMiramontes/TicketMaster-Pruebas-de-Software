import EventCard from "../components/EventCard";
import useEvents from "../hooks/useEvents";

const getImageUrl = (event) => event.images?.[0]?.url ?? "https://placehold.co/1200x800?text=Música";

const Musica = ({ openModal, onDetailClick }) => {
  const { musica, loading, error } = useEvents();

  return (
    <section className="space-y-8">
      <div className="relative overflow-hidden rounded-[2rem] border border-white/10 bg-slate-950 shadow-2xl shadow-black/40">
        <img src={getImageUrl(musica[0] || { images: [{ url: "https://placehold.co/1200x800?text=Música" }] })} alt="Cartelera de música" className="h-72 w-full object-cover md:h-[32rem]" />
        <div className="absolute inset-0 bg-gradient-to-t from-black via-black/60 to-transparent" />
        <div className="absolute inset-x-0 bottom-0 p-8 text-white">
          <span className="inline-flex rounded-full bg-violet-500/20 px-4 py-2 text-xs uppercase tracking-[0.35em] text-violet-100">Cartelera de Música</span>
          <h1 className="mt-4 text-4xl font-bold">Cartelera de Música</h1>
          <p className="mt-3 max-w-2xl text-slate-300">{loading ? "Cargando conciertos..." : `${musica.length} conciertos disponibles`}</p>
        </div>
      </div>
      {error && (<div className="rounded-3xl border border-red-600 bg-red-600/10 p-6 text-red-200"><p>{error}</p><button type="button" onClick={() => window.location.reload()} className="mt-4 rounded-2xl bg-slate-800 px-4 py-2 text-sm text-white transition hover:bg-slate-700">Reintentar</button></div>)}
      {loading ? (
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-5">{Array.from({ length: 8 }, (_, index) => (<div key={index} className="h-80 rounded-3xl bg-slate-800 animate-pulse" />))}</div>
      ) : musica.length === 0 ? (
        <div className="rounded-3xl border border-dashed border-white/10 bg-slate-900/80 p-12 text-center text-slate-400"><p className="text-2xl">No hay conciertos disponibles</p></div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-5">{musica.map((event) => (<EventCard key={event.id} event={event} type="musica" onBuyClick={openModal} onDetailClick={onDetailClick} />))}</div>
      )}
    </section>
  );
};

export default Musica;
