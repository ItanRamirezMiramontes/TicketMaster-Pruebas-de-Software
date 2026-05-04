import { useState } from "react";
import { ArrowRight, UserPlus } from "lucide-react";
import api from "../api/axios";
import useForm from "../hooks/useForm";

const USUARIO_PATTERN = /^[A-Za-z0-9]{5,20}$/;

const Register = ({ setAuthMode }) => {
  const [loading, setLoading] = useState(false);
  const [localError, setLocalError] = useState(null);
  const [success, setSuccess] = useState(false);
  const { values, handleChange, setFieldValue } = useForm({ usuario: "", contrasena: "" });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLocalError(null);
    if (!USUARIO_PATTERN.test(values.usuario)) {
      setLocalError("El usuario debe tener entre 5 y 20 caracteres alfanuméricos.");
      return;
    }
    if (values.contrasena.length < 8 || values.contrasena.length > 20) {
      setLocalError("La contraseña debe tener entre 8 y 20 caracteres.");
      return;
    }
    setLoading(true);
    try {
      await api.post("/auth/register", { usuario: values.usuario.toUpperCase(), contrasena: values.contrasena });
      setSuccess(true);
    } catch (err) {
      setLocalError(err?.response?.data?.detail || "No se pudo completar el registro.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="min-h-[calc(100vh-4rem)] bg-slate-950 py-10">
      <div className="mx-auto grid max-w-7xl gap-8 px-4 lg:grid-cols-[1.1fr_0.9fr] lg:items-center">
        <div className="hidden overflow-hidden rounded-[2rem] bg-gradient-to-br from-violet-950 via-slate-900 to-black p-10 text-white lg:block">
          <p className="text-sm uppercase tracking-[0.4em] text-violet-300">TicketMaster</p>
          <h1 className="mt-8 text-5xl font-bold">Tu puerta a los mejores eventos</h1>
          <p className="mt-6 max-w-xl text-slate-300">Regístrate y empieza a descubrir cine, teatro, música y museos de manera rápida y moderna.</p>
          <div className="mt-12 grid gap-4 text-sm text-slate-200">
            <div className="flex items-center gap-3 rounded-3xl border border-white/10 bg-white/5 px-4 py-4"><UserPlus className="h-5 w-5 text-violet-300" /><span>Creación de cuenta instantánea</span></div>
            <div className="flex items-center gap-3 rounded-3xl border border-white/10 bg-white/5 px-4 py-4"><span className="h-5 w-5 rounded-full bg-emerald-300" /><span>Acceso a promociones exclusivas</span></div>
          </div>
        </div>
        <div className="rounded-[2rem] border border-white/10 bg-slate-950/95 p-8 shadow-2xl shadow-black/40">
          <p className="text-sm uppercase tracking-[0.4em] text-violet-400">Regístrate</p>
          <h2 className="mt-4 text-3xl font-bold text-white">Crear cuenta nueva</h2>
          <p className="mt-3 text-slate-400">Regístrate para comprar boletos y guardar tus eventos favoritos.</p>
          {success ? (
            <div className="mt-8 space-y-4 rounded-3xl border border-emerald-600/20 bg-emerald-600/10 p-6 text-slate-100">
              <p className="font-semibold text-emerald-200">Registro exitoso.</p>
              <p>Ahora puedes iniciar sesión con tu usuario en mayúsculas.</p>
              <button type="button" onClick={() => setAuthMode("login")} className="inline-flex w-full items-center justify-center gap-2 rounded-2xl bg-white px-6 py-3 text-sm font-semibold text-slate-950 transition hover:bg-slate-100">Ir a Login<ArrowRight className="h-4 w-4" /></button>
            </div>
          ) : (
            <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
              <label className="block text-sm text-slate-300">Usuario
                <input name="usuario" value={values.usuario} onChange={(e) => setFieldValue("usuario", e.target.value.toUpperCase())} placeholder="TUUSUARIO" className="mt-2 w-full rounded-2xl border border-slate-800 bg-slate-950 px-4 py-3 text-slate-100" maxLength={20} />
                <span className="mt-2 block text-xs text-slate-500">5-20 caracteres alfanuméricos</span>
              </label>
              <label className="block text-sm text-slate-300">Contraseña
                <input name="contrasena" type="password" value={values.contrasena} onChange={handleChange} placeholder="Tu contraseña" className="mt-2 w-full rounded-2xl border border-slate-800 bg-slate-950 px-4 py-3 text-slate-100" maxLength={20} />
                <span className="mt-2 block text-xs text-slate-500">8-20 caracteres</span>
              </label>
              {localError && (<div className="rounded-2xl border border-red-600 bg-red-600/10 px-4 py-3 text-sm text-red-200">{localError}</div>)}
              <button type="submit" disabled={loading} className="inline-flex w-full items-center justify-center gap-2 rounded-2xl bg-indigo-600 px-6 py-3 text-sm font-semibold text-white transition hover:bg-indigo-500 disabled:opacity-60">{loading ? "Creando cuenta..." : "Registrarme"}<ArrowRight className="h-4 w-4" /></button>
            </form>
          )}
          <div className="mt-6 text-center text-sm text-slate-400">¿Ya tienes cuenta? <button type="button" onClick={() => setAuthMode("login")} className="font-semibold text-indigo-300 hover:text-indigo-200">Inicia sesión</button></div>
        </div>
      </div>
    </section>
  );
};

export default Register;
