import { useState } from "react";
import { ArrowRight, Film, MapPin, Music, Theater, User } from "lucide-react";
import { useAuth } from "../context/AuthContext";
import useForm from "../hooks/useForm";

const CURP_PATTERN = /^[A-Z]{4}[0-9]{6}[A-Z]{3}[A-Z0-9]{3}[A-Z]{2}[0-9]$/;
const SIMPLE_PATTERN = /^[A-Z0-9]{5,20}$/;

const validarUsuario = (u) => CURP_PATTERN.test(u) || SIMPLE_PATTERN.test(u);

const validarContrasena = (p) => {
  if (p.length !== 8) return { ok: false, msg: "La contraseña debe tener exactamente 8 caracteres." };
  if (!/[A-Z]/.test(p)) return { ok: false, msg: "La contraseña debe incluir al menos una mayúscula." };
  if (!/[a-z]/.test(p)) return { ok: false, msg: "La contraseña debe incluir al menos una minúscula." };
  if (!/[0-9]/.test(p)) return { ok: false, msg: "La contraseña debe incluir al menos un número." };
  if (!/[@#$%&!^*]/.test(p)) return { ok: false, msg: "La contraseña debe incluir al menos un carácter especial (@#$%&!^*)." };
  return { ok: true, msg: "" };
};

const Login = ({ setAuthMode }) => {
  const { login, error: authError } = useAuth();
  const [loading, setLoading] = useState(false);
  const [localError, setLocalError] = useState(null);
  const { values, handleChange, setFieldValue } = useForm({ usuario: "", contrasena: "" });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLocalError(null);
    if (!validarUsuario(values.usuario)) {
      setLocalError("El usuario debe ser CURP (19 caracteres alfanuméricos mayúsculas) o simple (5-20 caracteres alfanuméricos mayúsculas).");
      return;
    }
    const passVal = validarContrasena(values.contrasena);
    if (!passVal.ok) {
      setLocalError(passVal.msg);
      return;
    }
    setLoading(true);
    const success = await login({ usuario: values.usuario.toUpperCase(), contrasena: values.contrasena });
    setLoading(false);
    if (!success) {
      if (!authError) {
        setLocalError("No se pudo iniciar sesión. Verifica tus datos.");
      }
      return;
    }
    setAuthMode(null);
  };

  return (
    <section className="min-h-[calc(100vh-4rem)] bg-slate-950 py-10">
      <div className="mx-auto grid max-w-7xl gap-8 px-4 lg:grid-cols-[1.1fr_0.9fr] lg:items-center">
        <div className="hidden overflow-hidden rounded-[2rem] bg-gradient-to-br from-violet-950 via-slate-900 to-black p-10 text-white lg:block">
          <p className="text-sm uppercase tracking-[0.4em] text-violet-300">TicketMaster</p>
          <h1 className="mt-8 text-5xl font-bold">Tu puerta a los mejores eventos</h1>
          <p className="mt-6 max-w-xl text-slate-300">Explora cine, teatro, música y museos desde una sola plataforma con diseño moderno y confirmación segura.</p>
          <div className="mt-12 grid gap-4 text-sm text-slate-200">
            {[{ icon: Music, label: "Conciertos en vivo", color: "text-violet-300" }, { icon: Theater, label: "Funciones imperdibles", color: "text-amber-300" }, { icon: Film, label: "Estrenos de cine", color: "text-sky-300" }, { icon: MapPin, label: "Museos y exposiciones", color: "text-emerald-300" }].map((item) => (
              <div key={item.label} className="flex items-center gap-3 rounded-3xl border border-white/10 bg-white/5 px-4 py-4">
                <item.icon className={`h-5 w-5 ${item.color}`} />
                <span>{item.label}</span>
              </div>
            ))}
          </div>
        </div>
        <div className="rounded-[2rem] border border-white/10 bg-slate-950/95 p-8 shadow-2xl shadow-black/40">
          <p className="text-sm uppercase tracking-[0.4em] text-violet-400">Bienvenido de nuevo</p>
          <h2 className="mt-4 text-3xl font-bold text-white">Inicia sesión</h2>
          <p className="mt-3 text-slate-400">Accede para reservar tus eventos favoritos con rapidez.</p>
          <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
            <label className="block text-sm text-slate-300">Usuario
              <input name="usuario" value={values.usuario} onChange={(e) => setFieldValue("usuario", e.target.value.toUpperCase())} placeholder="TUUSUARIO o CURP" className="mt-2 w-full rounded-2xl border border-slate-800 bg-slate-950 px-4 py-3 text-slate-100" maxLength={20} />
              <span className="mt-2 block text-xs text-slate-500">CURP (19 chars) o simple (5-20 chars alfanuméricos mayúsculas)</span>
            </label>
            <label className="block text-sm text-slate-300">Contraseña
              <input name="contrasena" type="password" value={values.contrasena} onChange={handleChange} placeholder="Tu contraseña" className="mt-2 w-full rounded-2xl border border-slate-800 bg-slate-950 px-4 py-3 text-slate-100" maxLength={8} />
              <span className="mt-2 block text-xs text-slate-500">Exactamente 8 caracteres: mayúscula, minúscula, número, especial</span>
              <div className="mt-2 flex gap-1">
                {["mayúscula", "minúscula", "número", "especial"].map((req, i) => {
                  const checks = [
                    /[A-Z]/.test(values.contrasena),
                    /[a-z]/.test(values.contrasena),
                    /[0-9]/.test(values.contrasena),
                    /[@#$%&!^*]/.test(values.contrasena)
                  ];
                  return (
                    <span key={req} className={`rounded-full px-2 py-1 text-xs ${checks[i] ? "bg-green-600 text-white" : "bg-slate-700 text-slate-400"}`}>
                      {req}
                    </span>
                  );
                })}
              </div>
            </label>
            {(localError || authError) && (<div className="rounded-2xl border border-red-600 bg-red-600/10 px-4 py-3 text-sm text-red-200">{localError || authError}</div>)}
            <button type="submit" disabled={loading} className="inline-flex w-full items-center justify-center gap-2 rounded-2xl bg-indigo-600 px-6 py-3 text-sm font-semibold text-white transition hover:bg-indigo-500 disabled:opacity-60">{loading ? "Ingresando..." : "Login"}<ArrowRight className="h-4 w-4" /></button>
          </form>
          <div className="mt-6 text-center text-sm text-slate-400">¿No tienes cuenta? <button type="button" onClick={() => setAuthMode("register")} className="font-semibold text-indigo-300 hover:text-indigo-200">Regístrate</button></div>
        </div>
      </div>
    </section>
  );
};

export default Login;
