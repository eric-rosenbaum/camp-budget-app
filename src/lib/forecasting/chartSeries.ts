import type { CampSeasonInput, ChartPoint, ExpenseCategoryInput } from "./types";
import { calculateForecast } from "./calculateForecast";

export function generateChartSeries(
  season: CampSeasonInput,
  expenses: ExpenseCategoryInput[],
  minPercent: number = 60,
  maxPercent: number = 100
): ChartPoint[] {
  const points: ChartPoint[] = [];

  for (let pct = minPercent; pct <= maxPercent; pct++) {
    const forecast = calculateForecast({
      season,
      expenses,
      enrollmentPercent: pct,
    });

    points.push({
      enrollmentPercent: pct,
      surplus: forecast.projectedSurplus,
      revenue: forecast.projectedRevenue,
      expenses: forecast.projectedExpenses,
    });
  }

  return points;
}
