import { getSeasonWithExpenses } from "@/server/actions/seasons";
import { getSavedScenarios } from "@/server/actions/scenarios";
import { notFound } from "next/navigation";
import { toSeasonInput, toExpenseInput } from "@/lib/converters";
import { ScenariosClient } from "./scenarios-client";
import type { SavedScenarioSummary } from "@/lib/forecasting/types";

export default async function ScenariosPage({
  params,
}: {
  params: Promise<{ campId: string; seasonId: string }>;
}) {
  const { seasonId } = await params;
  const season = await getSeasonWithExpenses(seasonId);

  if (!season) {
    notFound();
  }

  const savedScenarios = await getSavedScenarios(seasonId);

  const scenarioSummaries: SavedScenarioSummary[] = savedScenarios.map((s) => ({
    id: s.id,
    name: s.name,
    enrollmentPercent: Number(s.enrollmentPercent),
    notes: s.notes,
    projectedRevenue: s.projectedRevenue ? Number(s.projectedRevenue) : null,
    projectedExpenses: s.projectedExpenses ? Number(s.projectedExpenses) : null,
    projectedSurplus: s.projectedSurplus ? Number(s.projectedSurplus) : null,
    createdAt: s.createdAt.toISOString(),
  }));

  const seasonInput = toSeasonInput(season);
  const expenseInputs = season.expenseCategories.map(toExpenseInput);

  return (
    <ScenariosClient
      seasonId={seasonId}
      season={seasonInput}
      expenses={expenseInputs}
      initialScenarios={scenarioSummaries}
    />
  );
}
