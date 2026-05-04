import { useState, useEffect } from "react";
import api from "../api/axios";

const useEvents = () => {
  const [musica, setMusica] = useState([]);
  const [teatro, setTeatro] = useState([]);
  const [cine, setCine] = useState([]);
  const [museos, setMuseos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const load = async () => {
      try {
        const [resMusica, resTeatro, resCine, resMuseos] = await Promise.all([
          api.get("/events/musica"),
          api.get("/events/teatro"),
          api.get("/events/cine"),
          api.get("/venues/museo"),
        ]);
        setMusica(resMusica.data);
        setTeatro(resTeatro.data);
        setCine(resCine.data);
        setMuseos(resMuseos.data);
      } catch (e) {
        setError("Error al cargar el catálogo. Verifica tu conexión.");
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  return { musica, teatro, cine, museos, loading, error };
};

export default useEvents;
