import { useState } from "react";
import { UserPlus, ArrowRight } from "lucide-react";
import api from "../api/axios";
import useForm from "../hooks/useForm";

const USUARIO_PATTERN = /^[A-Za-z0-9]{5,20}$/;

const Register = ({ setAuthMode }) => {
  const [localError, setLocalError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [loading, setLoading] = useState(false);
  const { values, handleChange } = useForm({ usuario: "", contrasena: "" });

  const handleSubmit = async (event) => {
    event.preventDefault();
    setLocalError(null);
    setSuccess(null);

    if (!USUARIO_PATTERN.test(values.usuario)) {
      setLocalError("El usuario debe tener entre 5 y 20 caracteres alfanuméricos.");
      return;
    }

    setLoading(true);
    try {
      const response = await api.post("/auth/register", {
        usuario: values.usuario.toUpperCase(), // ✅ FIX: backend exige usuario en MAYÚSCULAS
        contrasena: values.contrasena,
      });

      if (response.status === 200) {
        setSuccess("Registro exitoso. Ahora puedes iniciar sesión.");
      }
    } catch (err) {
      const detail = err?.response?.data?.detail;
      setLocalError(detail || "Error desconocido al registrar.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="mx-auto flex min-h-[calc(100vh-4rem)] max-w-2xl items-center justify-center px-4 py-10">
      <div className="w-full rounded-3xl border border-slate-800 bg-slate-900/95 p-8 shadow-2xl shadow-slate-950/40">
        <div className="mb-8">
          <p className="text-sm uppercase tracking-[0.4em] text-indigo-400">Registro</p>
          <h1 className="mt-4 text-3xl font-semibold text-slate-100">Crear cuenta en TicketMaster</h1>
          <p className="mt-3 text-slate-400">Regístrate para acceder a todas las funciones de reserva.</p>
        </div>

        {(localError || success) && (
          <div className={`mb-6 rounded-2xl border px-4 py-3 ${success ? 'border-emerald-600 bg-emerald-600/10 text-emerald-200' : 'border-red-600 bg-red-600/10 text-red-200'}`}>
            {localError || success}
          </div>
        )}

        <form className="space-y-5" onSubmit={handleSubmit}>
          <label className="block text-sm font-medium text-slate-300">
            Usuario
            <div className="mt-2 flex items-center gap-3 rounded-2xl border border-slate-800 bg-slate-950 px-4 py-3 focus-within:border-indigo-500">
              <UserPlus className="h-5 w-5 text-slate-400" />
              <input
                name="usuario"
                value={values.usuario}
                onChange={handleChange}
                placeholder="usuario12345"
                className="w-full bg-transparent text-slate-100 placeholder:text-slate-500"
                maxLength={20}
              />
            </div>
          </label>

          <label className="block text-sm font-medium text-slate-300">
            Contraseña
            <div className="mt-2 flex items-center gap-3 rounded-2xl border border-slate-800 bg-slate-950 px-4 py-3 focus-within:border-indigo-500">
              <input
                name="contrasena"
                type="password"
                value={values.contrasena}
                onChange={handleChange}
                placeholder="●●●●●●●●"
                className="w-full bg-transparent text-slate-100 placeholder:text-slate-500"
                maxLength={20} // ✅ FIX: era 8, el backend acepta hasta 20 caracteres
              />
            </div>
          </label>

          <button
            type="submit"
            disabled={loading}
            className="inline-flex w-full items-center justify-center gap-2 rounded-2xl bg-indigo-600 px-6 py-3 text-sm font-semibold text-white shadow-lg shadow-indigo-500/20 transition hover:bg-indigo-500 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {loading ? "Registrando..." : "Registrarse"}
            <ArrowRight className="h-4 w-4" />
          </button>
        </form>

        <div className="mt-6 text-center">
          <p className="text-slate-400">
            ¿Ya tienes cuenta?{" "}
            <button
              onClick={() => setAuthMode("login")}
              className="text-indigo-400 hover:text-indigo-300 underline"
              type="button"
            >
              Inicia sesión aquí
            </button>
          </p>
        </div>
      </div>
    </section>
  );
};

export default Register;