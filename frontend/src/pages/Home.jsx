import { Film, Music, Theater, MapPin } from "lucide-react";
import HeroBanner from "../components/HeroBanner";
import CategoryRow from "../components/CategoryRow";
import useEvents from "../hooks/useEvents";
import { getCategoryLabel, getCityName, getImageUrl, formatEventDate, getVenueName } from "../utils/eventHelpers";

const Home = ({ openModal, onCategoryClick, onDetailClick }) => {
  const { musica, teatro, cine, museos, loading, error } = useEvents();

  const heroEvents = [
    ...(musica.length ? [{ ...musica[0], type: "musica" }] : []),
    ...(teatro.length ? [{ ...teatro[0], type: "teatro" }] : []),
    ...(cine.length ? [{ ...cine[0], type: "cine" }] : []),
    ...(museos.length ? [{ ...museos[0], type: "museo" }] : []),
  ].slice(0, 4);

  const featured = [
    ...(musica.length ? [{ item: { ...musica[0], type: "musica" }, label: "Nuevo" }] : []),
    ...(teatro.length ? [{ item: { ...teatro[0], type: "teatro" }, label: "Nuevo" }] : []),
    ...(cine.length ? [{ item: { ...cine[0], type: "cine" }, label: "Nuevo" }] : []),
    ...(museos.length ? [{ item: { ...museos[0], type: "museo" }, label: "Nuevo" }] : []),
  ];

  const allEvents = [
    ...musica.map((event) => ({ ...event, type: "musica" })),
    ...teatro.map((event) => ({ ...event, type: "teatro" })),
    ...cine.map((event) => ({ ...event, type: "cine" })),
    ...museos.map((event) => ({ ...event, type: "museo" })),
  ];

  const upcoming = [...allEvents].sort((a, b) => {
    const aDate = a.dates?.start?.dateTime ? new Date(a.dates.start.dateTime).getTime() : Infinity;
    const bDate = b.dates?.start?.dateTime ? new Date(b.dates.start.dateTime).getTime() : Infinity;
    return aDate - bDate;
  });

  if (loading) {
    return (
      <section className="space-y-10">
        <div className="h-[60vh] min-h-[400px] rounded-[2rem] bg-slate-800 animate-pulse" />
        <div className="grid gap-4 lg:grid-cols-4">{Array.from({ length: 4 }, (_, index) => (<div key={index} className="h-72 rounded-3xl bg-slate-800 animate-pulse" />))}</div>
      </section>
    );
  }

  return (
    <section className="space-y-12">
      {error && (
        <div className="rounded-[2rem] border border-red-500/20 bg-red-500/10 p-6 text-slate-100">
          <p className="font-semibold">No se pudieron cargar algunos eventos.</p>
          <p className="mt-2 text-sm text-slate-300">Intenta actualizar la página o regresa en unos minutos.</p>
        </div>
      )}

      {heroEvents.length ? (
        <HeroBanner events={heroEvents} onBuyClick={openModal} onCategoryClick={onCategoryClick} />
      ) : (
        <div className="rounded-[2rem] border border-white/10 bg-slate-950 p-8 text-center text-slate-300">No hay eventos destacados disponibles.</div>
      )}

      <div className="space-y-6">
        <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <div>
            <p className="text-sm uppercase tracking-[0.35em] text-slate-400">Estrenos y favoritos</p>
            <h2 className="mt-3 text-3xl font-bold text-white">Novedades en cartelera</h2>
          </div>
          <p className="text-sm text-slate-400">Descubre las mejores funciones y compras rápidas.</p>
        </div>
        <div className="grid gap-4 md:grid-cols-4">
          {featured.map(({ item, label }) => (
            <div key={item.id} className="group relative overflow-hidden rounded-3xl border border-white/10 bg-slate-950 shadow-2xl shadow-black/40 transition hover:scale-[1.01]">
              <img src={getImageUrl(item, item.type)} alt={item.name} className="h-60 w-full object-cover" />
              <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black via-black/70 to-transparent p-5">
                <span className="rounded-full bg-indigo-500/20 px-3 py-1 text-[10px] uppercase tracking-[0.3em] text-indigo-200">{label}</span>
                <h3 className="mt-3 text-lg font-semibold text-white line-clamp-2">{item.name}</h3>
                <p className="mt-2 text-sm text-slate-400">{item.type === "museo" ? item.city?.name : getVenueName(item)}</p>
                <div className="mt-4 flex flex-wrap gap-3">
                  <button type="button" onClick={() => openModal(item, item.type)} className="rounded-2xl bg-white px-5 py-3 text-sm font-semibold text-slate-950 transition hover:bg-slate-100">Comprar</button>
                  <button type="button" onClick={() => onDetailClick(item, item.type)} className="rounded-2xl border border-white/10 bg-white/10 px-5 py-3 text-sm text-white transition hover:bg-white/15">Detalles</button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="space-y-10">
        <CategoryRow title="Música" icon={Music} events={musica.map((item) => ({ ...item, type: "musica" }))} type="musica" accentColor="text-violet-300" onBuyClick={openModal} onDetailClick={onDetailClick} onSeeAll={onCategoryClick} />
        <CategoryRow title="Teatro" icon={Theater} events={teatro.map((item) => ({ ...item, type: "teatro" }))} type="teatro" accentColor="text-amber-300" onBuyClick={openModal} onDetailClick={onDetailClick} onSeeAll={onCategoryClick} />
        <CategoryRow title="Cine" icon={Film} events={cine.map((item) => ({ ...item, type: "cine" }))} type="cine" accentColor="text-sky-300" onBuyClick={openModal} onDetailClick={onDetailClick} onSeeAll={onCategoryClick} />
        <CategoryRow title="Museos" icon={MapPin} events={museos.map((item) => ({ ...item, type: "museo" }))} type="museo" accentColor="text-emerald-300" onBuyClick={openModal} onDetailClick={onDetailClick} onSeeAll={onCategoryClick} />
      </div>

      <div className="space-y-6">
        <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <div>
            <p className="text-sm uppercase tracking-[0.35em] text-slate-400">Próximas funciones</p>
            <h2 className="mt-3 text-3xl font-bold text-white">Cartelera completa</h2>
          </div>
          <p className="text-sm text-slate-400">Ordenadas por fecha y disponibilidad de la plataforma.</p>
        </div>
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {upcoming.length === 0 ? (
            <div className="rounded-3xl border border-dashed border-white/10 bg-slate-900/80 p-8 text-center text-slate-400">No hay eventos disponibles en este momento.</div>
          ) : (
            upcoming.map((item) => (
              <button key={item.id} type="button" onClick={() => onDetailClick(item, item.type)} className="group flex items-center gap-4 overflow-hidden rounded-3xl border border-white/10 bg-slate-950 p-4 text-left transition hover:-translate-y-1 hover:bg-slate-900" aria-label={`Ver detalles de ${item.name}`}>
                <img src={getImageUrl(item, item.type, "400x400")} alt={item.name} className="h-24 w-24 rounded-3xl object-cover" />
                <div className="flex-1">
                  <p className="text-xs uppercase tracking-[0.35em] text-slate-500">{getCategoryLabel(item.type)}</p>
                  <h3 className="mt-2 text-lg font-semibold text-white line-clamp-2">{item.name}</h3>
                  <p className="mt-2 text-sm text-slate-400">{item.type === "museo" ? getCityName(item) : getVenueName(item)}</p>
                  <p className="mt-1 text-sm text-slate-400">{item.type === "museo" ? item.city?.name : formatEventDate(item)}</p>
                </div>
              </button>
            ))
          )}
        </div>
      </div>
    </section>
  );
};

export default Home;
