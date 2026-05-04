import { useState, useEffect, useCallback } from "react";
import api from "../api/axios";
import { useAuth } from "../context/AuthContext";

const useOrders = () => {
  const { user } = useAuth();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchOrders = useCallback(async () => {
    if (!user) {
      setOrders([]);
      setError(null);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const response = await api.get("/orders", {
        params: {
          usuario: user.usuario,
          contrasena: user.contrasena,
        },
      });
      setOrders(response.data);
    } catch (err) {
      setError(
        err?.response?.data?.detail ||
          "No se pudo cargar el historial de compras.",
      );
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    fetchOrders();
  }, [fetchOrders]);

  return { orders, loading, error, refresh: fetchOrders };
};

export default useOrders;
