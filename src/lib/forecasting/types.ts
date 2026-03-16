export type CostBehavior = "FIXED" | "PER_CAMPER" | "PERCENT_REVENUE";
export type InputMode = "TOTAL_BUDGET" | "PER_CAMPER" | "PERCENT_REVENUE";

export interface CampSeasonInput {
  capacity: number;
  tuitionPerCamper: number;
  baselineEnrollmentPercent: number;
  priorYearCampers: number | null;
}

export interface ExpenseCategoryInput {
  id: string;
  name: string;
  costBehavior: CostBehavior;
  inputMode: InputMode;
  budgetAmount: number | null;
  costPerCamper: number | null;
  percentOfRevenue: number | null;
}

export interface ForecastRequest {
  season: CampSeasonInput;
  expenses: ExpenseCategoryInput[];
  enrollmentPercent: number;
}

export interface ForecastCategoryResult {
  id: string;
  name: string;
  costBehavior: CostBehavior;
  inputMode: InputMode;
  baselineBudget: number;
  forecastExpense: number;
  variance: number;
  derivedCostPerCamper: number | null;
  derivedPercentOfRevenue: number | null;
}

export interface ForecastResult {
  enrollmentPercent: number;
  projectedCampers: number;
  projectedRevenue: number;
  projectedExpenses: number;
  projectedSurplus: number;
  isDeficit: boolean;
  fixedCostTotal: number;
  variableCostTotal: number;
  contributionMarginPerCamper: number | null;
  categories: ForecastCategoryResult[];
}

export type RiskLevel = "warning" | "danger" | "info";

export interface RiskIndicator {
  level: RiskLevel;
  message: string;
}

export interface BreakEvenResult {
  reachable: boolean;
  enrollmentPercent: number | null;
  camperCount: number | null;
}

export interface ChartPoint {
  enrollmentPercent: number;
  surplus: number;
  revenue: number;
  expenses: number;
}

export interface SavedScenarioSummary {
  id: string;
  name: string;
  enrollmentPercent: number;
  notes: string | null;
  projectedRevenue: number | null;
  projectedExpenses: number | null;
  projectedSurplus: number | null;
  createdAt: string;
}
