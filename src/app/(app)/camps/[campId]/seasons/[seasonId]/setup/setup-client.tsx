"use client";

import { DriversForm } from "@/components/setup/drivers-form";
import { ExpenseTable } from "@/components/setup/expense-table";
import type { CampSeasonInput, ExpenseCategoryInput } from "@/lib/forecasting/types";

interface SetupClientProps {
  seasonId: string;
  initialSeason: CampSeasonInput & { name: string; year: number | null };
  initialExpenses: ExpenseCategoryInput[];
}

export function SetupClient({
  seasonId,
  initialSeason,
  initialExpenses,
}: SetupClientProps) {
  return (
    <div className="space-y-8">
      <section>
        <h2 className="mb-4 text-lg font-semibold">Camp Drivers</h2>
        <DriversForm seasonId={seasonId} initialData={initialSeason} />
      </section>

      <section>
        <h2 className="mb-4 text-lg font-semibold">Expense Categories</h2>
        <ExpenseTable
          seasonId={seasonId}
          initialExpenses={initialExpenses}
          season={initialSeason}
        />
      </section>
    </div>
  );
}
