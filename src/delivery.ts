export type DeliveryPoint = { lat: number; lng: number };
export type DeliverySelection = { address: string; point?: DeliveryPoint };

export function deliveryAddressLine(value: string) {
  return value.trim().replace(/^Москва\s*,\s*/iu, "").replace(/\s+/g, " ");
}

export function hasDeliveryAddress(value: string) {
  return /\p{L}.*[ ,](?:д(?:ом|\.)?\s*)?\d+[а-яa-z]?(?:\s*(?:[ксkc/]|корп(?:ус)?\.?|стр(?:оение)?\.?)\s*\d+[а-яa-z]?)*(?:\s*,.+)?$/iu.test(deliveryAddressLine(value));
}

export function deliveryPointUrl({ lat, lng }: DeliveryPoint) {
  const latitude = lat.toFixed(6);
  const longitude = lng.toFixed(6);
  return `https://www.openstreetmap.org/?mlat=${latitude}&mlon=${longitude}#map=18/${latitude}/${longitude}`;
}

const addressCache = new Map<string, string>();
let lastLookup = 0;

export async function resolveDeliveryAddress(point: DeliveryPoint, signal: AbortSignal) {
  const key = `${point.lat.toFixed(5)},${point.lng.toFixed(5)}`;
  if (addressCache.has(key)) return addressCache.get(key)!;

  const delay = lastLookup + 1000 - Date.now();
  if (delay > 0) await new Promise(resolve => setTimeout(resolve, delay));
  if (signal.aborted) throw signal.reason;
  lastLookup = Date.now();

  const endpoint = new URL(import.meta.env.VITE_PICKUP_REVERSE_URL || "https://nominatim.openstreetmap.org/reverse");
  endpoint.search = new URLSearchParams({
    lat: String(point.lat), lon: String(point.lng), format: "jsonv2", "accept-language": "ru",
  }).toString();
  const response = await fetch(endpoint, { signal });
  if (!response.ok) throw new Error("Address lookup failed");
  const { address } = await response.json() as { address?: Record<string, string> };
  const street = address?.road || address?.pedestrian || address?.residential || address?.square;
  const inMoscow = address?.["ISO3166-2-lvl4"] === "RU-MOW" || [address?.city, address?.state].some(value => value === "Москва" || value === "Moscow");
  const resolved = inMoscow && street && address?.house_number ? `${street}, ${address.house_number}` : "";
  if (hasDeliveryAddress(resolved)) {
    addressCache.set(key, resolved);
    return resolved;
  }
  return "";
}
