import type {
  BreakEvenResult,
  ForecastResult,
  RiskIndicator,
} from "./types";

export function calculateRiskIndicators(
  forecast: ForecastResult,
  breakEven: BreakEvenResult
): RiskIndicator[] {
  const indicators: RiskIndicator[] = [];

  if (breakEven.reachable && breakEven.enrollmentPercent! > 90) {
    indicators.push({
      level: "warning",
      message:
        "Break-even enrollment is high. Small enrollment declines may create a deficit.",
    });
  }

  if (!breakEven.reachable) {
    indicators.push({
      level: "danger",
      message:
        "Break-even is not reachable at 100% enrollment under current assumptions.",
    });
  }

  if (forecast.isDeficit) {
    indicators.push({
      level: "danger",
      message: "This scenario results in a projected deficit.",
    });
  }

  if (
    forecast.projectedRevenue > 0 &&
    forecast.fixedCostTotal / forecast.projectedRevenue > 0.75
  ) {
    indicators.push({
      level: "warning",
      message:
        "Fixed costs consume a high share of projected revenue.",
    });
  }

  if (
    breakEven.reachable &&
    breakEven.enrollmentPercent != null &&
    Math.abs(forecast.enrollmentPercent - breakEven.enrollmentPercent) <= 5 &&
    forecast.projectedSurplus > 0
  ) {
    indicators.push({
      level: "info",
      message:
        "This budget is highly sensitive to enrollment changes.",
    });
  }

  return indicators;
}
