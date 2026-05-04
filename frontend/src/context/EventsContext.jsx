import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import api from "../api/axios";

const EventsContext = createContext({
  musica: [],
  teatro: [],
  cine: [],
  museos: [],
  loading: true,
  error: null,
  refresh: async () => {},
  findEvent: () => null,
});

export const EventsProvider = ({ children }) => {
  const [musica, setMusica] = useState([]);
  const [teatro, setTeatro] = useState([]);
  const [cine, setCine] = useState([]);
  const [museos, setMuseos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const loadEvents = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const [resMusica, resTeatro, resCine, resMuseos] = await Promise.all([
        api.get("/events/musica"),
        api.get("/events/teatro"),
        api.get("/events/cine"),
        api.get("/venues/museo"),
      ]);
      setMusica(resMusica.data.map((event) => ({ ...event, type: "musica" })));
      setTeatro(resTeatro.data.map((event) => ({ ...event, type: "teatro" })));
      setCine(resCine.data.map((event) => ({ ...event, type: "cine" })));
      setMuseos(resMuseos.data.map((event) => ({ ...event, type: "museo" })));
    } catch (err) {
      setError("No se pudo cargar la cartelera. Verifica tu conexión e inténtalo de nuevo.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadEvents();
  }, [loadEvents]);

  const findEvent = useCallback(
    (type, id) => {
      if (!id) return null;
      const searchId = String(id);
      if (type === "musica") return musica.find((item) => String(item.id) === searchId) || null;
      if (type === "teatro") return teatro.find((item) => String(item.id) === searchId) || null;
      if (type === "cine") return cine.find((item) => String(item.id) === searchId) || null;
      if (type === "museo") return museos.find((item) => String(item.id) === searchId) || null;
      return null;
    },
    [musica, teatro, cine, museos],
  );

  const value = useMemo(
    () => ({ musica, teatro, cine, museos, loading, error, refresh: loadEvents, findEvent }),
    [musica, teatro, cine, museos, loading, error, loadEvents, findEvent],
  );

  return <EventsContext.Provider value={value}>{children}</EventsContext.Provider>;
};

export const useEventsContext = () => useContext(EventsContext);
export default EventsContext;
