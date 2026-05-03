import { useState } from "react";
import { Ticket, CreditCard, Calendar } from "lucide-react";
import api from "../api/axios";
import useForm from "../hooks/useForm";
import { useAuth } from "../context/AuthContext";

const OBRAS = {
  "COLÓN": ["El Fantasma", "El Sueño", "La Dama"],
  SCALA: ["Historia Viva", "La Orquesta", "El Sueño"],
  METROPÓLITAN: ["El Viaje", "Memorias", "El Duelo"],
};

const SECCIONES = ["LUNETA", "PALCO", "PREFERENTE"];
const METODOS = ["CREDITO", "DEBITO", "PAYPAL"];

const Teatro = () => {
  const { user } = useAuth();
  const [message, setMessage] = useState(null);
  const [error, setError] = useState(null);
  const [reservation, setReservation] = useState(null);

  const today = new Date().toISOString().slice(0, 10);

  const { values, handleChange, setValues } = useForm({
    sede: "COLÓN",
    obra: OBRAS["COLÓN"][0],
    seccion: "LUNETA",
    boletos: 1,
    fecha: today,
    metodo: "CREDITO",
    numero_tarjeta: "",
    nombre_tarjeta: "",
  });

  const selectedObras = OBRAS[values.sede] || OBRAS["COLÓN"];

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError(null);
    setMessage(null);

    if (!user) {
      setError("Necesitas autenticación para continuar.");
      return;
    }

    if (values.metodo !== "PAYPAL") {
      if (!/^\d+$/.test(values.numero_tarjeta)) {
        setError("El número de tarjeta solo puede contener dígitos.");
        return;
      }
      if (!/^[A-Za-z ]+$/.test(values.nombre_tarjeta.trim())) {
        setError("El nombre de la tarjeta solo puede contener letras.");
        return;
      }
    }

    try {
      const payload = {
        usuario: user.usuario,
        contrasena: user.contrasena,
        sede: values.sede,
        obra: values.obra,
        seccion: values.seccion,
        boletos: Number(values.boletos),
        fecha: values.fecha,
        pago: {
          metodo: values.metodo,
          nombre_tarjeta: values.metodo === "PAYPAL" ? null : values.nombre_tarjeta,
          numero_tarjeta: values.metodo === "PAYPAL" ? null : values.numero_tarjeta,
        },
      };

      const response = await api.post("/tickets/teatro", payload);
      setMessage(response.data.mensaje);
      setReservation(response.data);
    } catch (err) {
      setError(err?.response?.data?.detail || "No se pudo completar la compra. Verifica los datos.");
    }
  };

  return (
    <section className="space-y-6">
      <div className="rounded-3xl border border-slate-800 bg-slate-900/90 p-8 shadow-xl shadow-slate-950/40">
        <div className="flex items-center justify-between gap-4">
          <div>
            <p className="text-sm uppercase tracking-[0.4em] text-indigo-400">Teatro</p>
            <h2 className="mt-3 text-3xl font-semibold text-slate-100">Reserva tu función</h2>
            <p className="mt-2 text-slate-400">Elige sede, obra y sección. Confirmación segura en minutos.</p>
          </div>
          <Ticket className="h-12 w-12 text-indigo-400" />
        </div>
      </div>

      {error && (
        <div className="rounded-2xl border border-red-600 bg-red-600/10 px-5 py-4 text-red-200">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="grid gap-6 lg:grid-cols-[1.2fr_0.8fr]">
        <div className="space-y-6 rounded-3xl border border-slate-800 bg-slate-900/90 p-8">
          <div className="grid gap-5 sm:grid-cols-2">
            <label className="block text-sm text-slate-300">
              Sede
              <select
                name="sede"
                value={values.sede}
                onChange={(e) => {
                  const sede = e.target.value;
                  setValues((prev) => ({
                    ...prev,
                    sede,
                    obra: OBRAS[sede][0],
                  }));
                }}
                className="mt-2 w-full rounded-2xl border-slate-800 bg-slate-950 px-4 py-3 text-slate-100"
              >
                {Object.keys(OBRAS).map((sede) => (
                  <option key={sede} value={sede}>{sede}</option>
                ))}
              </select>
            </label>

            <label className="block text-sm text-slate-300">
              Obra
              <select
                name="obra"
                value={values.obra}
                onChange={handleChange}
                className="mt-2 w-full rounded-2xl border-slate-800 bg-slate-950 px-4 py-3 text-slate-100"
              >
                {selectedObras.map((obra) => (
                  <option key={obra} value={obra}>{obra}</option>
                ))}
              </select>
            </label>
          </div>

          <div className="grid gap-5 sm:grid-cols-3">
            <label className="block text-sm text-slate-300">
              Sección
              <select
                name="seccion"
                value={values.seccion}
                onChange={handleChange}
                className="mt-2 w-full rounded-2xl border-slate-800 bg-slate-950 px-4 py-3 text-slate-100"
              >
                {SECCIONES.map((seccion) => (
                  <option key={seccion} value={seccion}>{seccion}</option>
                ))}
              </select>
            </label>
            <label className="block text-sm text-slate-300">
              Boletos
              <input
                name="boletos"
                type="number"
                min={1}
                max={10}
                value={values.boletos}
                onChange={handleChange}
                className="mt-2 w-full rounded-2xl border-slate-800 bg-slate-950 px-4 py-3 text-slate-100"
              />
            </label>
            <label className="block text-sm text-slate-300">
              Fecha
              <div className="mt-2 flex items-center gap-3 rounded-2xl border border-slate-800 bg-slate-950 px-4 py-3">
                <Calendar className="h-4 w-4 text-slate-400" />
                <input
                  name="fecha"
                  type="date"
                  min={today}
                  value={values.fecha}
                  onChange={handleChange}
                  className="w-full bg-transparent text-slate-100"
                />
              </div>
            </label>
          </div>

          <div className="space-y-4 rounded-3xl border border-slate-800 bg-slate-950/80 p-6">
            <p className="text-sm uppercase tracking-[0.3em] text-indigo-400">Información de pago</p>
            <div className="grid gap-5 sm:grid-cols-2">
              <label className="block text-sm text-slate-300">
                Método
                <select
                  name="metodo"
                  value={values.metodo}
                  onChange={handleChange}
                  className="mt-2 w-full rounded-2xl border-slate-800 bg-slate-950 px-4 py-3 text-slate-100"
                >
                  {METODOS.map((item) => (
                    <option key={item} value={item}>{item}</option>
                  ))}
                </select>
              </label>
              <label className="block text-sm text-slate-300">
                Titular
                <input
                  name="nombre_tarjeta"
                  value={values.nombre_tarjeta}
                  onChange={handleChange}
                  placeholder="Nombre completo"
                  className="mt-2 w-full rounded-2xl border-slate-800 bg-slate-950 px-4 py-3 text-slate-100"
                />
              </label>
            </div>
            <label className="block text-sm text-slate-300">
              Número de tarjeta
              <input
                name="numero_tarjeta"
                value={values.numero_tarjeta}
                onChange={(e) => {
                  const onlyNumbers = e.target.value.replace(/\D/g, "");
                  setValues((prev) => ({ ...prev, numero_tarjeta: onlyNumbers }));
                }}
                placeholder="0000000000000000"
                className="mt-2 w-full rounded-2xl border-slate-800 bg-slate-950 px-4 py-3 text-slate-100"
              />
            </label>
          </div>

          <button
            type="submit"
            className="inline-flex items-center justify-center rounded-2xl bg-indigo-600 px-6 py-3 text-sm font-semibold text-white shadow-lg shadow-indigo-500/20 transition hover:bg-indigo-500"
          >
            Confirmar Compra
          </button>
        </div>

        <aside className="space-y-6 rounded-3xl border border-slate-800 bg-slate-900/90 p-8">
          <div className="rounded-3xl border border-slate-800 bg-slate-950/80 p-5">
            <p className="text-sm uppercase tracking-[0.3em] text-indigo-400">Resumen</p>
            <p className="mt-4 text-slate-300">Sede: {values.sede}</p>
            <p className="text-slate-300">Obra: {values.obra}</p>
            <p className="text-slate-300">Sección: {values.seccion}</p>
            <p className="text-slate-300">Boletos: {values.boletos}</p>
            <p className="text-slate-300">Fecha: {values.fecha}</p>
          </div>

          <div className="rounded-3xl border border-slate-800 bg-slate-950/80 p-5">
            <p className="mb-3 text-sm uppercase tracking-[0.3em] text-indigo-400">Restricciones</p>
            <p className="text-slate-300">Máximo 10 boletos por usuario. No se aceptan cambios el día festivo.</p>
          </div>

          {message && (
            <div className="rounded-3xl border border-emerald-500/30 bg-emerald-500/10 p-5 text-emerald-200">
              <p className="font-semibold">{message}</p>
              <p className="mt-2 text-slate-300">Total estimado calculado por el backend.</p>
            </div>
          )}

          {reservation && (
            <div className="rounded-3xl border border-indigo-600 bg-slate-950/90 p-5">
              <p className="text-sm uppercase tracking-[0.3em] text-indigo-400">Ficha de Reservación</p>
              <p className="mt-3 text-slate-100">ID: {reservation.purchase_id}</p>
              <p className="text-slate-300">Total: ${reservation.total.toFixed(2)}</p>
              <p className="text-slate-300">Boletos: {values.boletos}</p>
              <p className="mt-3 text-slate-300">{reservation.detalles?.restricciones || "Sin detalles adicionales."}</p>
            </div>
          )}
        </aside>
      </form>
    </section>
  );
};

export default Teatro;
