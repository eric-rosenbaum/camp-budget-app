"use client";

import { useState, useMemo } from "react";
import { calculateForecast } from "@/lib/forecasting/calculateForecast";
import { calculateBreakEven } from "@/lib/forecasting/calculateBreakEven";
import { calculateRiskIndicators } from "@/lib/forecasting/calculateRiskIndicators";
import { generateChartSeries } from "@/lib/forecasting/chartSeries";
import { SummaryCards } from "@/components/forecast/summary-cards";
import { RiskIndicators } from "@/components/forecast/risk-indicators";
import { SurplusChart } from "@/components/charts/surplus-chart";
import { SaveScenarioForm } from "@/components/scenarios/save-scenario-form";
import { SavedScenariosList } from "@/components/scenarios/saved-scenarios-list";
import { Slider } from "@/components/ui/slider";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type {
  CampSeasonInput,
  ExpenseCategoryInput,
  SavedScenarioSummary,
} from "@/lib/forecasting/types";

interface ScenariosClientProps {
  seasonId: string;
  season: CampSeasonInput;
  expenses: ExpenseCategoryInput[];
  initialScenarios: SavedScenarioSummary[];
}

export function ScenariosClient({
  seasonId,
  season,
  expenses,
  initialScenarios,
}: ScenariosClientProps) {
  const [enrollmentPercent, setEnrollmentPercent] = useState(
    season.baselineEnrollmentPercent
  );
  const [scenarios, setScenarios] =
    useState<SavedScenarioSummary[]>(initialScenarios);

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

  function handleScenarioSaved(scenario: SavedScenarioSummary) {
    setScenarios((prev) => [scenario, ...prev]);
  }

  function handleScenarioDeleted(id: string) {
    setScenarios((prev) => prev.filter((s) => s.id !== id));
  }

  function handleScenarioApply(enrollPct: number) {
    setEnrollmentPercent(enrollPct);
  }

  if (expenses.length === 0) {
    return (
      <div className="rounded-lg border border-dashed p-12 text-center text-muted-foreground">
        <p className="text-lg font-medium">No expense categories yet</p>
        <p className="mt-1 text-sm">
          Go to Setup to add expense categories before modeling scenarios.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Enrollment Scenario</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center gap-6">
            <span className="text-sm text-muted-foreground w-12">60%</span>
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
            <span className="text-sm text-muted-foreground w-12 text-right">100%</span>
          </div>
          <div className="text-center">
            <span className="text-3xl font-bold tabular-nums">
              {enrollmentPercent.toFixed(0)}%
            </span>
            <span className="ml-2 text-muted-foreground">enrollment</span>
          </div>
        </CardContent>
      </Card>

      <SummaryCards forecast={forecast} breakEven={breakEven} />

      {risks.length > 0 && <RiskIndicators indicators={risks} />}

      <SurplusChart
        data={chartData}
        breakEvenPercent={breakEven.enrollmentPercent}
      />

      <SaveScenarioForm
        seasonId={seasonId}
        enrollmentPercent={enrollmentPercent}
        forecast={forecast}
        onSaved={handleScenarioSaved}
      />

      <SavedScenariosList
        scenarios={scenarios}
        onDelete={handleScenarioDeleted}
        onApply={handleScenarioApply}
      />
    </div>
  );
}
