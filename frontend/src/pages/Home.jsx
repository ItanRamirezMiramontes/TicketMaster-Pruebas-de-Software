const Home = () => (
  <section className="rounded-3xl border border-slate-800 bg-slate-900/90 p-8 shadow-xl shadow-slate-900/30">
    <div className="flex flex-col gap-6">
      <div>
        <p className="text-sm uppercase tracking-[0.3em] text-indigo-400">TicketMaster</p>
        <h1 className="mt-3 text-4xl font-semibold text-slate-100">Bienvenido a la plataforma de reservas</h1>
        <p className="mt-4 max-w-2xl leading-7 text-slate-300">
          Utiliza el menú superior para acceder a las secciones de Teatro, Cine y Museo.
          Cada módulo cuenta con su propio formulario de compra y un resumen de reservación.
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        {[
          { title: "Teatro", description: "Reservas de obras con secciones VIP y preferente." },
          { title: "Cine", description: "Compra entradas con servicio IMAX, VIP o 4DX." },
          { title: "Museo", description: "Entradas rápidas y controladas por capacidad." },
        ].map((item) => (
          <div key={item.title} className="rounded-3xl border border-slate-800 bg-slate-950 p-5">
            <p className="text-sm uppercase tracking-[0.2em] text-slate-400">{item.title}</p>
            <p className="mt-3 text-lg text-slate-100">{item.description}</p>
          </div>
        ))}
      </div>
    </div>
  </section>
);

export default Home;
