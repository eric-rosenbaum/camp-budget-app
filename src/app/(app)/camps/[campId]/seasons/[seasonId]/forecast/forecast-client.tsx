"use client";

import { useMemo } from "react";
import { calculateForecast } from "@/lib/forecasting/calculateForecast";
import { calculateBreakEven } from "@/lib/forecasting/calculateBreakEven";
import { calculateRiskIndicators } from "@/lib/forecasting/calculateRiskIndicators";
import { generateChartSeries } from "@/lib/forecasting/chartSeries";
import { SummaryCards } from "@/components/forecast/summary-cards";
import { RiskIndicators } from "@/components/forecast/risk-indicators";
import { ExpenseBreakdownTable } from "@/components/forecast/expense-breakdown-table";
import { SurplusChart } from "@/components/charts/surplus-chart";
import type { CampSeasonInput, ExpenseCategoryInput } from "@/lib/forecasting/types";

interface ForecastClientProps {
  season: CampSeasonInput;
  expenses: ExpenseCategoryInput[];
}

export function ForecastClient({ season, expenses }: ForecastClientProps) {
  const forecast = useMemo(
    () =>
      calculateForecast({
        season,
        expenses,
        enrollmentPercent: season.baselineEnrollmentPercent,
      }),
    [season, expenses]
  );

  const breakEven = useMemo(
    () => calculateBreakEven(season, expenses),
    [season, expenses]
  );

  const risks = useMemo(
    () => calculateRiskIndicators(forecast, breakEven),
    [forecast, breakEven]
  );

  const chartData = useMemo(
    () => generateChartSeries(season, expenses),
    [season, expenses]
  );

  if (expenses.length === 0) {
    return (
      <div className="rounded-lg border border-dashed p-12 text-center text-muted-foreground">
        <p className="text-lg font-medium">No expense categories yet</p>
        <p className="mt-1 text-sm">
          Go to Setup to add expense categories before viewing the forecast.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <SummaryCards forecast={forecast} breakEven={breakEven} />
      {risks.length > 0 && <RiskIndicators indicators={risks} />}
      <ExpenseBreakdownTable categories={forecast.categories} />
      <SurplusChart data={chartData} breakEvenPercent={breakEven.enrollmentPercent} />
    </div>
  );
}
