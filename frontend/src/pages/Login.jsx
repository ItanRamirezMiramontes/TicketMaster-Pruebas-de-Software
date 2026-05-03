import { useState } from "react";
import { User, Lock, ArrowRight } from "lucide-react";
import { useAuth } from "../context/AuthContext";
import useForm from "../hooks/useForm";

const USUARIO_PATTERN = /^[A-Za-z0-9]{5,20}$/;

const Login = ({ setAuthMode }) => {
  const { login, error: authError } = useAuth();
  const [localError, setLocalError] = useState(null);
  const [loading, setLoading] = useState(false);
  const { values, handleChange } = useForm({ usuario: "", contrasena: "" });

  const handleSubmit = async (event) => {
    event.preventDefault();
    setLocalError(null);

    if (!USUARIO_PATTERN.test(values.usuario)) {
      setLocalError("El usuario debe tener entre 5 y 20 caracteres alfanuméricos.");
      return;
    }

    setLoading(true);
    const success = await login({ usuario: values.usuario, contrasena: values.contrasena });
    setLoading(false);

    if (!success && !authError) {
      setLocalError("Error desconocido al iniciar sesión.");
    }
  };

  return (
    <section className="mx-auto flex min-h-[calc(100vh-4rem)] max-w-2xl items-center justify-center px-4 py-10">
      <div className="w-full rounded-3xl border border-slate-800 bg-slate-900/95 p-8 shadow-2xl shadow-slate-950/40">
        <div className="mb-8">
          <p className="text-sm uppercase tracking-[0.4em] text-indigo-400">Acceso Seguro</p>
          <h1 className="mt-4 text-3xl font-semibold text-slate-100">Inicia sesión en TicketMaster</h1>
          <p className="mt-3 text-slate-400">Ingresa tu usuario de 20 caracteres y contraseña para comenzar a reservar.</p>
        </div>

        {(localError || authError) && (
          <div className="mb-6 rounded-2xl border border-red-600 bg-red-600/10 px-4 py-3 text-red-200">
            {localError || authError}
          </div>
        )}

        <form className="space-y-5" onSubmit={handleSubmit}>
          <label className="block text-sm font-medium text-slate-300">
            Usuario
            <div className="mt-2 flex items-center gap-3 rounded-2xl border border-slate-800 bg-slate-950 px-4 py-3 focus-within:border-indigo-500">
              <User className="h-5 w-5 text-slate-400" />
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
              <Lock className="h-5 w-5 text-slate-400" />
              <input
                name="contrasena"
                type="password"
                value={values.contrasena}
                onChange={handleChange}
                placeholder="●●●●●●●●"
                className="w-full bg-transparent text-slate-100 placeholder:text-slate-500"
                maxLength={8}
              />
            </div>
          </label>

          <button
            type="submit"
            disabled={loading}
            className="inline-flex w-full items-center justify-center gap-2 rounded-2xl bg-indigo-600 px-6 py-3 text-sm font-semibold text-white shadow-lg shadow-indigo-500/20 transition hover:bg-indigo-500 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {loading ? "Ingresando..." : "Ingresar"}
            <ArrowRight className="h-4 w-4" />
          </button>
        </form>

        <div className="mt-6 text-center">
          <p className="text-slate-400">
            ¿No tienes cuenta?{" "}
            <button
              onClick={() => setAuthMode("register")}
              className="text-indigo-400 hover:text-indigo-300 underline"
              type="button"
            >
              Regístrate aquí
            </button>
          </p>
        </div>
      </div>
    </section>
  );
};

export default Login;
