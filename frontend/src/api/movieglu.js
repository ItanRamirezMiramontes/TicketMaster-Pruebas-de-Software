import axios from "./axios";

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
  axios.get(`/movieglu/films?n=${n}`);

export const getFilmShowTimes = (filmId, date, n = 5) =>
  axios.get(`/movieglu/showtimes?film_id=${filmId}&date=${date}&n=${n}`);

export const getCinemas = (n = 10) => axios.get(`/movieglu/cinemas?n=${n}`);

export const getCinemaShowTimes = (cinemaId, date, n = 5) =>
  axios.get(
    `/movieglu/cinemaShowTimes?cinema_id=${cinemaId}&date=${date}&n=${n}`,
  );

export const getTerritories = () => axios.get("/movieglu/territories");

export const getFilmsByRegion = (territory, n = 10) =>
  axios.get(`/movieglu/films?n=${n}&territory=${territory}`);
