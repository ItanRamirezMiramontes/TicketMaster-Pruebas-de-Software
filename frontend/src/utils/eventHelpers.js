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
