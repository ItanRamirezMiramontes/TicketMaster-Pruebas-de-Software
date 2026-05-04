import { useEffect, useState } from "react";
import api from "../api/axios";
import EventCard from "../components/EventCard";

const Museo = ({ openModal }) => {
  const [venues, setVenues] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const load = async () => {
      try {
        const response = await api.get("/venues/museo");
        setVenues(response.data.map((venue) => ({ ...venue, type: "museo" })));
      } catch (err) {
        setError("Error al cargar los museos.");
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  return (
    <section className="space-y-8">
      <div className="relative overflow-hidden rounded-[2rem] border border-white/10 bg-slate-950 shadow-2xl shadow-black/40">
        <img src={venues[0]?.images?.[0]?.url ?? "https://placehold.co/1200x800?text=Museos"} alt="Museos" className="h-72 w-full object-cover md:h-[32rem]" />
        <div className="absolute inset-0 bg-gradient-to-t from-black via-black/60 to-transparent" />
        <div className="absolute inset-x-0 bottom-0 p-8 text-white">
          <span className="inline-flex rounded-full bg-emerald-500/20 px-4 py-2 text-xs uppercase tracking-[0.35em] text-emerald-100">Museos</span>
          <h1 className="mt-4 text-4xl font-bold">Museos</h1>
          <p className="mt-3 max-w-2xl text-slate-300">{loading ? "Cargando museos..." : `${venues.length} museos disponibles`}</p>
        </div>
      </div>
      {error && (<div className="rounded-3xl border border-red-600 bg-red-600/10 p-6 text-red-200"><p>{error}</p><button type="button" onClick={() => window.location.reload()} className="mt-4 rounded-2xl bg-slate-800 px-4 py-2 text-sm text-white transition hover:bg-slate-700">Reintentar</button></div>)}
      {loading ? (
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-5">{Array.from({ length: 8 }, (_, index) => (<div key={index} className="h-80 rounded-3xl bg-slate-800 animate-pulse" />))}</div>
      ) : venues.length === 0 ? (
        <div className="rounded-3xl border border-dashed border-white/10 bg-slate-900/80 p-12 text-center text-slate-400"><p className="text-2xl">No hay museos disponibles</p></div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-5">{venues.map((venue) => (<EventCard key={venue.id} event={venue} type="museo" onBuyClick={openModal} />))}</div>
      )}
    </section>
  );
};

export default Museo;
