import { useCallback, useEffect, useState } from "react";
import {
  getFilmsNowShowing,
  getFilmsByRegion,
  getFilmShowTimes,
  getTerritories,
} from "../api/movieglu";

const useMovieglu = () => {
  const [films, setFilms] = useState([]);
  const [territories, setTerritories] = useState([]);
  const [selectedTerritory, setSelectedTerritory] = useState(null);
  const [loadingFilms, setLoadingFilms] = useState(false);
  const [loadingTerritories, setLoadingTerritories] = useState(false);
  const [error, setError] = useState(null);

  const loadFilms = useCallback(async (territory = null) => {
    setLoadingFilms(true);
    setError(null);
    try {
      const response = territory
        ? await getFilmsByRegion(territory, 20)
        : await getFilmsNowShowing(20);
      const rawFilms = response.data?.films ?? response.data ?? [];
      setFilms(Array.isArray(rawFilms) ? rawFilms : []);
    } catch (err) {
      setError(
        err?.response?.status === 401
          ? "API MovieGlu no autenticada. Configura VITE_MOVIEGLU_API_KEY en .env"
          : "No se pudieron cargar películas de MovieGlu.",
      );
      setFilms([]);
    } finally {
      setLoadingFilms(false);
    }
  }, []);

  const loadTerritories = useCallback(async () => {
    setLoadingTerritories(true);
    try {
      const response = await getTerritories();
      const raw = response.data;
      if (Array.isArray(raw)) {
        setTerritories(raw);
      } else if (raw?.territories) {
        setTerritories(raw.territories);
      } else if (typeof raw === "object" && raw !== null) {
        setTerritories(
          Object.entries(raw).map(([code, name]) => ({ code, name })),
        );
      } else {
        setTerritories([]);
      }
    } catch {
      setTerritories([]);
    } finally {
      setLoadingTerritories(false);
    }
  }, []);

  useEffect(() => {
    loadTerritories();
  }, [loadTerritories]);

  useEffect(() => {
    loadFilms(selectedTerritory);
  }, [selectedTerritory, loadFilms]);

  const selectTerritory = useCallback(
    (territory) =>
      setSelectedTerritory((current) =>
        current === territory ? null : territory,
      ),
    [],
  );

  return {
    films,
    territories,
    selectedTerritory,
    loadingFilms,
    loadingTerritories,
    error,
    selectTerritory,
  };
};

export default useMovieglu;
