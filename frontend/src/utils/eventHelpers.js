export const getVenueName = (event) =>
  event?.embedded?.venues?.[0]?.name ?? event?.name ?? "Venue por confirmar";
export const getCityName = (event) =>
  event?.embedded?.venues?.[0]?.city?.name ??
  event?.city?.name ??
  "Ciudad por confirmar";

export const getCategoryLabel = (type) => {
  if (type === "musica") return "Música";
  if (type === "teatro") return "Teatro";
  if (type === "cine") return "Cine";
  return "Museo";
};

export const getImageUrl = (event, type, size = "1200x800") => {
  if (type === "museo")
    return event?.images?.[0]?.url ?? `https://placehold.co/${size}?text=Museo`;
  return event?.images?.[0]?.url ?? `https://placehold.co/${size}?text=Evento`;
};

export const formatEventDate = (event, options = {}) => {
  const raw = event?.dates?.start?.dateTime;
  if (!raw) return "Fecha por confirmar";
  const date = new Date(raw);
  return date.toLocaleDateString("es-MX", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
    ...options,
  });
};

export const formatEventTime = (event) => {
  const raw = event?.dates?.start?.dateTime;
  if (!raw) return "";
  return new Date(raw).toLocaleTimeString("es-MX", {
    hour: "2-digit",
    minute: "2-digit",
  });
};

export const formatDateShort = (event) => {
  const raw = event?.dates?.start?.dateTime;
  if (!raw) return "Fecha por confirmar";
  const date = new Date(raw);
  return date.toLocaleDateString("es-MX", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
};

export const formatCurrency = (value) => {
  if (value == null || Number.isNaN(Number(value))) return "-";
  return new Intl.NumberFormat("es-MX", {
    style: "currency",
    currency: "MXN",
    maximumFractionDigits: 0,
  }).format(value);
};

export const getCategoryColor = (type) => {
  if (type === "musica")
    return {
      border: "border-violet-500/40",
      badge: "bg-violet-500/20 text-violet-200 border border-violet-500/30",
    };
  if (type === "teatro")
    return {
      border: "border-amber-500/30",
      badge: "bg-amber-500/20 text-amber-200 border border-amber-500/30",
    };
  if (type === "cine")
    return {
      border: "border-sky-500/30",
      badge: "bg-sky-500/20 text-sky-200 border border-sky-500/30",
    };
  return {
    border: "border-emerald-500/30",
    badge: "bg-emerald-500/20 text-emerald-200 border border-emerald-500/30",
  };
};

export const getEventPriceLabel = (event, type) => {
  if (type === "museo") return "$220 MXN";
  const min = event?.priceRanges?.[0]?.min;
  return min ? `Desde $${min} MXN` : "Ver precio";
};

export const getEventDateLong = (event) => {
  const raw = event?.dates?.start?.dateTime;
  if (!raw) return "Fecha por confirmar";
  const date = new Date(raw);
  return date.toLocaleDateString("es-MX", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  });
};

export const isHoliday = (dateString) => {
  if (!dateString) return false;
  const date = new Date(dateString);
  const month = date.getUTCMonth() + 1;
  const day = date.getUTCDate();
  return (
    (month === 1 && day === 1) ||
    (month === 5 && day === 1) ||
    (month === 9 && day === 16) ||
    (month === 11 && day === 20) ||
    (month === 12 && day === 25)
  );
};

// ── Datos estáticos por categoría ────────────────────────────

// Cines disponibles con sus servicios según requerimiento del profesor
export const CINES = [
  {
    id: "cinemark",
    name: "Cinemark",
    servicios: ["Tradicional", "VIP", "IMAX", "3D", "Subtitulada"],
    restricciones: "No se permiten mascotas, armas ni alimentos externos.",
    clasificacion: "Todas las clasificaciones",
  },
  {
    id: "cinepolis",
    name: "Cinépolis",
    servicios: [
      "Tradicional",
      "VIP",
      "Macro XE",
      "4DX",
      "IMAX",
      "Cinépolis Junior",
      "Screen X",
      "Subtitulada",
      "Español",
    ],
    restricciones: "No se permiten mascotas, armas ni alimentos externos.",
    clasificacion: "Todas las clasificaciones",
  },
  {
    id: "cinemex",
    name: "Cinemex",
    servicios: [
      "Tradicional",
      "PLUUS",
      "VIP",
      "IMAX",
      "3D",
      "Español",
      "Subtitulada",
    ],
    restricciones: "No se permiten mascotas, armas ni alimentos externos.",
    clasificacion: "Todas las clasificaciones",
  },
  {
    id: "amc",
    name: "AMC",
    servicios: ["Tradicional", "IMAX", "Dolby Cinema", "3D", "Subtitulada"],
    restricciones:
      "No se permiten mascotas ni armas. Alimentos solo del establecimiento.",
    clasificacion: "Todas las clasificaciones",
  },
];

// Secciones de teatro con precio y vestimenta
export const TEATRO_SECCIONES = [
  {
    id: "luneta",
    label: "Luneta",
    descripcion: "Planta baja, visibilidad óptima",
    precioExtra: 0,
    vestimenta: "Formal / Semi-formal",
  },
  {
    id: "palco",
    label: "Palco",
    descripcion: "Palcos laterales con vista lateral",
    precioExtra: 50,
    vestimenta: "Formal",
  },
  {
    id: "galeria",
    label: "Galería",
    descripcion: "Nivel superior, visión panorámica",
    precioExtra: -30,
    vestimenta: "Semi-formal / Casual",
  },
];

// Restricciones y horarios por tipo
export const RESTRICCIONES_POR_TIPO = {
  cine: "Prohibido ingresar mascotas, armas y alimentos externos. Se verificará clasificación de película.",
  teatro:
    "Vestimenta formal requerida en luneta y palco. No se permiten alimentos, bebidas ni grabaciones.",
  musica:
    "No se permite ingresar objetos peligrosos. Solo bebidas del establecimiento. Prohibidas las grabaciones.",
  museo:
    "No se permiten mochilas grandes, alimentos ni fotografía con flash. Respetar el horario de visita.",
};

export const HORARIOS_POR_TIPO = {
  cine: "Funciones: 12:00 · 15:00 · 18:00 · 21:00 hrs (L-D)",
  teatro: "Funciones: 19:00 · 21:00 hrs (Mar-Dom). Lunes cerrado.",
  musica: "Funciones según programación del artista (ver fechas).",
  museo: "Lunes a Domingo 10:00 – 18:00 hrs. Último acceso: 17:30 hrs.",
};

// Clasificaciones de películas
export const CLASIFICACIONES_CINE = ["AA", "A", "B", "B-15", "C", "D"];

// Helper: elige el cine basado en hash del eventId (determinista)
export const getCineForEvent = (eventId) => {
  if (!eventId) return CINES[0];
  let h = 0;
  for (let i = 0; i < eventId.length; i++)
    h = (h * 31 + eventId.charCodeAt(i)) >>> 0;
  return CINES[h % CINES.length];
};

// Helper: elige clasificación basada en hash del eventId
export const getClasificacionForEvent = (eventId) => {
  if (!eventId) return "B";
  let h = 0;
  for (let i = 0; i < eventId.length; i++)
    h = (h * 31 + eventId.charCodeAt(i)) >>> 0;
  return CLASIFICACIONES_CINE[h % CLASIFICACIONES_CINE.length];
};

// MAX tickets por tipo (requerimiento del profesor)
export const MAX_TICKETS = { cine: 10, teatro: 10, musica: 12, museo: 5 };
export const DEFAULT_PRICE = {
  cine: 650,
  teatro: 500,
  musica: 700,
  museo: 220,
};
