import { getSeasonWithExpenses } from "@/server/actions/seasons";
import { notFound } from "next/navigation";
import { toSeasonInput, toExpenseInput } from "@/lib/converters";
import { SetupClient } from "./setup-client";

export default async function SetupPage({
  params,
}: {
  params: Promise<{ campId: string; seasonId: string }>;
}) {
  const { seasonId } = await params;
  const season = await getSeasonWithExpenses(seasonId);

  if (!season) {
    notFound();
  }

  const seasonInput = toSeasonInput(season);
  const expenseInputs = season.expenseCategories.map(toExpenseInput);

  return (
    <SetupClient
      seasonId={season.id}
      initialSeason={{
        name: season.name,
        year: season.year,
        ...seasonInput,
      }}
      initialExpenses={expenseInputs}
    />
  );
}
