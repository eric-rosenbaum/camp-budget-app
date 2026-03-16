"use client";

import { Card } from "@/components/ui/card";
import { formatCurrency } from "@/lib/forecasting/helpers";
import type { ForecastCategoryResult } from "@/lib/forecasting/types";
import { cn } from "@/lib/utils";

const BEHAVIOR_LABELS: Record<string, string> = {
  FIXED: "Fixed",
  PER_CAMPER: "Per Camper",
  PERCENT_REVENUE: "% Revenue",
};

export function ExpenseBreakdownTable({
  categories,
}: {
  categories: ForecastCategoryResult[];
}) {
  const total = categories.reduce((s, c) => s + c.forecastExpense, 0);

  return (
    <Card>
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b text-left">
              <th className="px-4 py-3 font-medium">Category</th>
              <th className="px-4 py-3 font-medium">Cost Behavior</th>
              <th className="px-4 py-3 font-medium text-right">
                Baseline Budget
              </th>
              <th className="px-4 py-3 font-medium text-right">
                Forecast Expense
              </th>
              <th className="px-4 py-3 font-medium text-right">Variance</th>
            </tr>
          </thead>
          <tbody>
            {categories.map((cat) => (
              <tr key={cat.id} className="border-b last:border-0">
                <td className="px-4 py-3 font-medium">{cat.name}</td>
                <td className="px-4 py-3 text-muted-foreground">
                  {BEHAVIOR_LABELS[cat.costBehavior] ?? cat.costBehavior}
                </td>
                <td className="px-4 py-3 text-right tabular-nums">
                  {formatCurrency(cat.baselineBudget)}
                </td>
                <td className="px-4 py-3 text-right font-medium tabular-nums">
                  {formatCurrency(cat.forecastExpense)}
                </td>
                <td
                  className={cn(
                    "px-4 py-3 text-right tabular-nums",
                    cat.variance > 0 && "text-red-600",
                    cat.variance < 0 && "text-green-600"
                  )}
                >
                  {cat.variance === 0
                    ? "—"
                    : `${cat.variance > 0 ? "+" : ""}${formatCurrency(cat.variance)}`}
                </td>
              </tr>
            ))}
          </tbody>
          <tfoot>
            <tr className="border-t bg-muted/30">
              <td className="px-4 py-3 font-semibold" colSpan={3}>
                Total
              </td>
              <td className="px-4 py-3 text-right font-semibold tabular-nums">
                {formatCurrency(total)}
              </td>
              <td></td>
            </tr>
          </tfoot>
        </table>
      </div>
    </Card>
  );
}
