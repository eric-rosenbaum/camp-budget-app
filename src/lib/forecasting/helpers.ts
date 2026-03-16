import type { CampSeasonInput } from "./types";

export function getBaselineCampers(season: CampSeasonInput): number {
  if (season.priorYearCampers && season.priorYearCampers > 0) {
    return season.priorYearCampers;
  }
  return (season.capacity * season.baselineEnrollmentPercent) / 100;
}

export function getBaselineRevenue(season: CampSeasonInput): number {
  const campers = getBaselineCampers(season);
  return campers * season.tuitionPerCamper;
}

export function getProjectedCampers(
  capacity: number,
  enrollmentPercent: number
): number {
  return (capacity * enrollmentPercent) / 100;
}

export function formatCurrency(value: number): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(value);
}

export function formatCurrencyDetailed(value: number): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(value);
}

export function formatPercent(value: number): string {
  return `${value.toFixed(1)}%`;
}

export function formatNumber(value: number): string {
  return new Intl.NumberFormat("en-US", {
    maximumFractionDigits: 0,
  }).format(Math.round(value));
}
