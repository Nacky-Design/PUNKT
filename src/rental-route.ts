import { cars } from "./data";

export type RentalRoute =
  | { page: "home" | "prices" }
  | { page: "car" | "request"; carId: number };

export function readRentalRoute(): RentalRoute {
  const params = new URLSearchParams(window.location.search);
  const page = params.get("page");
  if (page === "car" || page === "request") {
    const carId = Number(params.get("car"));
    return cars.some((car) => car.id === carId) ? { page, carId } : { page: "prices" };
  }
  return { page: page === "prices" ? "prices" : "home" };
}

export function rentalHref(route: RentalRoute, hash = "") {
  const url = new URL(window.location.href);
  url.searchParams.delete("page");
  url.searchParams.delete("car");
  if (route.page !== "home") url.searchParams.set("page", route.page);
  if ("carId" in route) url.searchParams.set("car", String(route.carId));
  url.hash = hash;
  return url.pathname + url.search + url.hash;
}
