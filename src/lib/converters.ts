import type { CampSeasonInput, ExpenseCategoryInput, CostBehavior, InputMode } from "./forecasting/types";

type Numeric = string | number | { toString(): string };

function toNumber(val: Numeric | null | undefined): number {
  if (val == null) return 0;
  return typeof val === "number" ? val : Number(val);
}

function toNumberOrNull(val: Numeric | null | undefined): number | null {
  if (val == null) return null;
  return typeof val === "number" ? val : Number(val);
}

export function toSeasonInput(season: {
  capacity: number;
  tuitionPerCamper: Numeric;
  baselineEnrollmentPercent: Numeric;
  priorYearCampers: number | null;
}): CampSeasonInput {
  return {
    capacity: season.capacity,
    tuitionPerCamper: toNumber(season.tuitionPerCamper),
    baselineEnrollmentPercent: toNumber(season.baselineEnrollmentPercent),
    priorYearCampers: season.priorYearCampers,
  };
}

export function toExpenseInput(expense: {
  id: string;
  name: string;
  costBehavior: string;
  inputMode: string;
  budgetAmount: Numeric | null;
  costPerCamper: Numeric | null;
  percentOfRevenue: Numeric | null;
}): ExpenseCategoryInput {
  return {
    id: expense.id,
    name: expense.name,
    costBehavior: expense.costBehavior as CostBehavior,
    inputMode: expense.inputMode as InputMode,
    budgetAmount: toNumberOrNull(expense.budgetAmount),
    costPerCamper: toNumberOrNull(expense.costPerCamper),
    percentOfRevenue: toNumberOrNull(expense.percentOfRevenue),
  };
}
