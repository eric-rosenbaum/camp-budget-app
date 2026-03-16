"use client";

import { deleteScenario } from "@/server/actions/scenarios";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { formatCurrency, formatPercent } from "@/lib/forecasting/helpers";
import { Trash2, ArrowRight } from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import type { SavedScenarioSummary } from "@/lib/forecasting/types";

interface SavedScenariosListProps {
  scenarios: SavedScenarioSummary[];
  onDelete: (id: string) => void;
  onApply: (enrollmentPercent: number) => void;
}

export function SavedScenariosList({
  scenarios,
  onDelete,
  onApply,
}: SavedScenariosListProps) {
  async function handleDelete(id: string) {
    onDelete(id);

    const result = await deleteScenario(id);
    if (result.error) {
      toast.error(result.error);
      return;
    }
    toast.success("Scenario deleted");
  }

  if (scenarios.length === 0) {
    return (
      <Card className="border-dashed">
        <CardContent className="py-8 text-center text-muted-foreground">
          <p>No saved scenarios yet.</p>
          <p className="text-sm">
            Adjust enrollment above and save a scenario to compare later.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">Saved Scenarios</CardTitle>
      </CardHeader>
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b text-left">
              <th className="px-4 py-3 font-medium">Name</th>
              <th className="px-4 py-3 font-medium text-right">Enrollment</th>
              <th className="px-4 py-3 font-medium text-right">Revenue</th>
              <th className="px-4 py-3 font-medium text-right">Expenses</th>
              <th className="px-4 py-3 font-medium text-right">
                Surplus / Deficit
              </th>
              <th className="w-24 px-4 py-3"></th>
            </tr>
          </thead>
          <tbody>
            {scenarios.map((scenario) => (
              <tr key={scenario.id} className="border-b last:border-0">
                <td className="px-4 py-3 font-medium">
                  {scenario.name}
                  {scenario.notes && (
                    <p className="mt-0.5 text-xs text-muted-foreground">
                      {scenario.notes}
                    </p>
                  )}
                </td>
                <td className="px-4 py-3 text-right tabular-nums">
                  {formatPercent(scenario.enrollmentPercent)}
                </td>
                <td className="px-4 py-3 text-right tabular-nums">
                  {scenario.projectedRevenue != null
                    ? formatCurrency(scenario.projectedRevenue)
                    : "—"}
                </td>
                <td className="px-4 py-3 text-right tabular-nums">
                  {scenario.projectedExpenses != null
                    ? formatCurrency(scenario.projectedExpenses)
                    : "—"}
                </td>
                <td
                  className={cn(
                    "px-4 py-3 text-right font-medium tabular-nums",
                    scenario.projectedSurplus != null &&
                      scenario.projectedSurplus < 0 &&
                      "text-red-600",
                    scenario.projectedSurplus != null &&
                      scenario.projectedSurplus >= 0 &&
                      "text-green-600"
                  )}
                >
                  {scenario.projectedSurplus != null
                    ? formatCurrency(scenario.projectedSurplus)
                    : "—"}
                </td>
                <td className="px-4 py-3">
                  <div className="flex gap-1 justify-end">
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8"
                      title="Apply this scenario"
                      onClick={() => onApply(scenario.enrollmentPercent)}
                    >
                      <ArrowRight className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8"
                      title="Delete scenario"
                      onClick={() => handleDelete(scenario.id)}
                    >
                      <Trash2 className="h-4 w-4 text-muted-foreground" />
                    </Button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </Card>
  );
}
