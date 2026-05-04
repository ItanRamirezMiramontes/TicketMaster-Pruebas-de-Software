import { createContext, useContext, useState } from "react";
import api from "../api/axios";

const AuthContext = createContext({
  user: null,
  error: null,
  login: async () => {},
  logout: () => {},
});

const USUARIO_PATTERN = /^[A-Za-z0-9]{5,20}$/;

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [error, setError] = useState(null);

  const login = async ({ usuario, contrasena }) => {
    setError(null);

    // ✅ FIX: normalizar a mayúsculas antes de validar y enviar
    const usuarioUpper = usuario.toUpperCase();

    if (!USUARIO_PATTERN.test(usuarioUpper)) {
      setError("El usuario debe tener entre 5 y 20 caracteres alfanuméricos.");
      return false;
    }

    try {
      const response = await api.post("/auth/login", {
        usuario: usuarioUpper,
        contrasena,
      });

      if (response.status === 200) {
        // ✅ FIX: guardar el usuario en mayúsculas para que los endpoints de compra lo reciban igual
        setUser({ usuario: usuarioUpper, contrasena });
        return true;
      }

      setError("Error inesperado de autenticación.");
      return false;
    } catch (err) {
      const detail = err?.response?.data?.detail;
      setError(detail || "No se pudo iniciar sesión. Verifica tus credenciales.");
      return false;
    }
  };

  const logout = () => {
    setUser(null);
    setError(null);
  };

  return (
    <AuthContext.Provider value={{ user, error, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);