import type {
  CampSeasonInput,
  ExpenseCategoryInput,
  ForecastCategoryResult,
  ForecastRequest,
  ForecastResult,
} from "./types";
import { getBaselineCampers, getBaselineRevenue, getProjectedCampers } from "./helpers";

function calculateCategoryForecast(
  expense: ExpenseCategoryInput,
  season: CampSeasonInput,
  projectedCampers: number,
  projectedRevenue: number
): ForecastCategoryResult {
  const baselineCampers = getBaselineCampers(season);
  const baselineRevenue = getBaselineRevenue(season);

  let forecastExpense = 0;
  let baselineBudget = 0;
  let derivedCostPerCamper: number | null = null;
  let derivedPercentOfRevenue: number | null = null;

  switch (expense.costBehavior) {
    case "FIXED": {
      const amount = expense.budgetAmount ?? 0;
      forecastExpense = amount;
      baselineBudget = amount;
      break;
    }

    case "PER_CAMPER": {
      if (expense.inputMode === "PER_CAMPER" && expense.costPerCamper != null) {
        derivedCostPerCamper = expense.costPerCamper;
        forecastExpense = expense.costPerCamper * projectedCampers;
        baselineBudget = expense.costPerCamper * baselineCampers;
      } else {
        const totalBudget = expense.budgetAmount ?? 0;
        baselineBudget = totalBudget;
        if (baselineCampers > 0) {
          derivedCostPerCamper = totalBudget / baselineCampers;
          forecastExpense = derivedCostPerCamper * projectedCampers;
        } else {
          forecastExpense = totalBudget;
        }
      }
      break;
    }

    case "PERCENT_REVENUE": {
      if (
        expense.inputMode === "PERCENT_REVENUE" &&
        expense.percentOfRevenue != null
      ) {
        derivedPercentOfRevenue = expense.percentOfRevenue;
        forecastExpense = (expense.percentOfRevenue / 100) * projectedRevenue;
        baselineBudget = (expense.percentOfRevenue / 100) * baselineRevenue;
      } else {
        const totalBudget = expense.budgetAmount ?? 0;
        baselineBudget = totalBudget;
        if (baselineRevenue > 0) {
          derivedPercentOfRevenue = (totalBudget / baselineRevenue) * 100;
          forecastExpense = (derivedPercentOfRevenue / 100) * projectedRevenue;
        } else {
          forecastExpense = totalBudget;
        }
      }
      break;
    }
  }

  return {
    id: expense.id,
    name: expense.name,
    costBehavior: expense.costBehavior,
    inputMode: expense.inputMode,
    baselineBudget,
    forecastExpense,
    variance: forecastExpense - baselineBudget,
    derivedCostPerCamper,
    derivedPercentOfRevenue,
  };
}

export function calculateForecast(request: ForecastRequest): ForecastResult {
  const { season, expenses, enrollmentPercent } = request;

  const projectedCampers = getProjectedCampers(season.capacity, enrollmentPercent);
  const projectedRevenue = projectedCampers * season.tuitionPerCamper;

  const categories = expenses.map((expense) =>
    calculateCategoryForecast(expense, season, projectedCampers, projectedRevenue)
  );

  const projectedExpenses = categories.reduce(
    (sum, cat) => sum + cat.forecastExpense,
    0
  );

  const fixedCostTotal = categories
    .filter((c) => c.costBehavior === "FIXED")
    .reduce((sum, c) => sum + c.forecastExpense, 0);

  const variableCostTotal = projectedExpenses - fixedCostTotal;

  const variableCostPerCamper =
    projectedCampers > 0 ? variableCostTotal / projectedCampers : 0;

  const contributionMarginPerCamper =
    projectedCampers > 0
      ? season.tuitionPerCamper - variableCostPerCamper
      : null;

  const projectedSurplus = projectedRevenue - projectedExpenses;

  return {
    enrollmentPercent,
    projectedCampers,
    projectedRevenue,
    projectedExpenses,
    projectedSurplus,
    isDeficit: projectedSurplus < 0,
    fixedCostTotal,
    variableCostTotal,
    contributionMarginPerCamper,
    categories,
  };
}
