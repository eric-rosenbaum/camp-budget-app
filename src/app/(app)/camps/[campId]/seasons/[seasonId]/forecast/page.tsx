import { getSeasonWithExpenses } from "@/server/actions/seasons";
import { notFound } from "next/navigation";
import { toSeasonInput, toExpenseInput } from "@/lib/converters";
import { ForecastClient } from "./forecast-client";

export default async function ForecastPage({
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
    <ForecastClient season={seasonInput} expenses={expenseInputs} />
  );
}
