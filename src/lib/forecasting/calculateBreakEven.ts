import type { BreakEvenResult, CampSeasonInput, ExpenseCategoryInput } from "./types";
import { calculateForecast } from "./calculateForecast";

export function calculateBreakEven(
  season: CampSeasonInput,
  expenses: ExpenseCategoryInput[]
): BreakEvenResult {
  for (let pct = 0; pct <= 1000; pct++) {
    const enrollmentPercent = pct / 10;
    const forecast = calculateForecast({
      season,
      expenses,
      enrollmentPercent,
    });

    if (forecast.projectedSurplus >= 0) {
      return {
        reachable: true,
        enrollmentPercent,
        camperCount: Math.ceil(
          (season.capacity * enrollmentPercent) / 100
        ),
      };
    }
  }

  return {
    reachable: false,
    enrollmentPercent: null,
    camperCount: null,
  };
}
