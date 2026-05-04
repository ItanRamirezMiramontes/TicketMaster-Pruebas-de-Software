import axios from "axios";

const MOVIEGLU_BASE =
  import.meta.env.VITE_MOVIEGLU_API_URL ?? "https://api-gate2.movieglu.com";

const getApiDate = () => new Date().toISOString().slice(0, 23) + "Z";

const moviegluClient = axios.create({
  baseURL: MOVIEGLU_BASE,
  timeout: 12000,
});

moviegluClient.interceptors.request.use((config) => {
  if (!config.headers) config.headers = {};
  config.headers["API-KEY"] = import.meta.env.VITE_MOVIEGLU_API_KEY ?? "";
  config.headers["client"] = import.meta.env.VITE_MOVIEGLU_CLIENT ?? "";
  config.headers["x-api-date"] = getApiDate();
  config.headers["Authorization"] = import.meta.env.VITE_MOVIEGLU_AUTH ?? "";
  config.headers["Content-Type"] = "application/json";
  return config;
});

export const normalizeFilm = (film) => ({
  id: String(film.film_id),
  name: film.film_name ?? "Película",
  url: film.film_trailer ?? "",
  dates: { start: { dateTime: null } },
  classifications: [{ segment: { name: "Film" } }],
  embedded: { venues: [] },
  images: film.images?.still_url ? [{ url: film.images.still_url }] : [],
  priceRanges: null,
  type: "cine",
  _source: "movieglu",
  showings: film.showings ?? null,
});

export const normalizeCinema = (cinema) => ({
  id: String(cinema.cinema_id),
  name: cinema.cinema_name ?? "Cine",
  address: cinema.address?.address1 ?? "",
  city: cinema.address?.city ?? "",
  state: cinema.address?.state ?? "",
  postcode: cinema.address?.postcode ?? "",
  logo: cinema.images?.logo_url ?? null,
  distance: cinema.distance ?? null,
});

export const getFilmsNowShowing = (n = 10) =>
  moviegluClient.get("/filmsNowShowing/", { params: { n } });

export const getFilmShowTimes = (filmId, date, n = 5) =>
  moviegluClient.get("/filmShowTimes/", {
    params: { film_id: filmId, date, n },
  });

export const getCinemas = (n = 10) =>
  moviegluClient.get("/cinemas/", { params: { n } });

export const getCinemaShowTimes = (cinemaId, date, n = 5) =>
  moviegluClient.get("/cinemaShowTimes/", {
    params: { cinema_id: cinemaId, date, n },
  });

export const getTerritories = () => moviegluClient.get("/territories/");

export const getFilmsByRegion = (territory, n = 10) =>
  moviegluClient.get("/filmsNowShowing/", { params: { n, territory } });

export default moviegluClient;
