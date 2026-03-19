"use client";

import { useState, useMemo } from "react";
import { calculateForecast } from "@/lib/forecasting/calculateForecast";
import { calculateBreakEven } from "@/lib/forecasting/calculateBreakEven";
import { calculateRiskIndicators } from "@/lib/forecasting/calculateRiskIndicators";
import { generateChartSeries } from "@/lib/forecasting/chartSeries";
import { SummaryCards } from "@/components/forecast/summary-cards";
import { RiskIndicators } from "@/components/forecast/risk-indicators";
import { ExpenseBreakdownTable } from "@/components/forecast/expense-breakdown-table";
import { SurplusChart } from "@/components/charts/surplus-chart";
import { Slider } from "@/components/ui/slider";
import { Card, CardContent } from "@/components/ui/card";
import { formatPercent, formatNumber } from "@/lib/forecasting/helpers";
import type { CampSeasonInput, ExpenseCategoryInput } from "@/lib/forecasting/types";

interface ForecastClientProps {
  season: CampSeasonInput;
  expenses: ExpenseCategoryInput[];
}

export function ForecastClient({ season, expenses }: ForecastClientProps) {
  const [enrollmentPercent, setEnrollmentPercent] = useState(
    season.baselineEnrollmentPercent
  );

  const forecast = useMemo(
    () => calculateForecast({ season, expenses, enrollmentPercent }),
    [season, expenses, enrollmentPercent]
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
      {/* Enrollment Slider */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex items-center gap-6">
            <span className="w-10 text-sm text-muted-foreground">60%</span>
            <div className="flex-1">
              <Slider
                value={[enrollmentPercent]}
                onValueChange={(values) =>
                  setEnrollmentPercent(
                    Array.isArray(values) ? values[0] : values
                  )
                }
                min={60}
                max={100}
              />
            </div>
            <span className="w-12 text-right text-sm text-muted-foreground">
              100%
            </span>
          </div>
          <div className="mt-3 flex items-baseline justify-center gap-2">
            <span className="text-3xl font-bold tabular-nums">
              {formatPercent(enrollmentPercent)}
            </span>
            <span className="text-muted-foreground">enrollment</span>
            <span className="ml-2 text-sm text-muted-foreground">
              · {formatNumber(forecast.projectedCampers)} campers
            </span>
          </div>
        </CardContent>
      </Card>

      <SummaryCards forecast={forecast} breakEven={breakEven} />

      {risks.length > 0 && <RiskIndicators indicators={risks} />}

      <ExpenseBreakdownTable categories={forecast.categories} />

      <SurplusChart
        data={chartData}
        breakEvenPercent={breakEven.enrollmentPercent}
        currentEnrollment={enrollmentPercent}
      />
    </div>
  );
}
