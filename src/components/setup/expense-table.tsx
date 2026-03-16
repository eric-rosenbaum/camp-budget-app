"use client";

import { useState, useCallback, useRef } from "react";
import {
  createExpenseCategory,
  updateExpenseCategory,
  deleteExpenseCategory,
} from "@/server/actions/expenses";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
} from "@/components/ui/select";
import { Plus, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { calculateForecast } from "@/lib/forecasting/calculateForecast";
import {
  formatCurrency,
  formatCurrencyDetailed,
  formatPercent,
  getBaselineCampers,
  getBaselineRevenue,
} from "@/lib/forecasting/helpers";
import type {
  CampSeasonInput,
  CostBehavior,
  ExpenseCategoryInput,
  InputMode,
} from "@/lib/forecasting/types";

const COST_BEHAVIOR_LABELS: Record<CostBehavior, string> = {
  FIXED: "Fixed",
  PER_CAMPER: "Per Camper",
  PERCENT_REVENUE: "% of Revenue",
};

const INPUT_MODE_LABELS: Record<InputMode, string> = {
  TOTAL_BUDGET: "Total Budget",
  PER_CAMPER: "Per Camper",
  PERCENT_REVENUE: "% of Revenue",
};

const SUGGESTED_BEHAVIORS: Record<string, CostBehavior> = {
  staffing: "FIXED",
  food: "PER_CAMPER",
  programs: "PER_CAMPER",
  facilities: "FIXED",
  administration: "FIXED",
  marketing: "PERCENT_REVENUE",
};

function suggestBehavior(name: string): CostBehavior {
  const lower = name.toLowerCase().trim();
  for (const [key, behavior] of Object.entries(SUGGESTED_BEHAVIORS)) {
    if (lower.includes(key)) return behavior;
  }
  return "FIXED";
}

function getInputModesForBehavior(
  behavior: CostBehavior
): { value: InputMode; label: string }[] {
  switch (behavior) {
    case "PER_CAMPER":
      return [
        { value: "TOTAL_BUDGET", label: "Total Budget" },
        { value: "PER_CAMPER", label: "Per Camper" },
      ];
    case "PERCENT_REVENUE":
      return [
        { value: "TOTAL_BUDGET", label: "Total Budget" },
        { value: "PERCENT_REVENUE", label: "% of Revenue" },
      ];
    default:
      return [];
  }
}

let optimisticId = 0;

interface ExpenseTableProps {
  seasonId: string;
  initialExpenses: ExpenseCategoryInput[];
  season: CampSeasonInput;
}

export function ExpenseTable({
  seasonId,
  initialExpenses,
  season,
}: ExpenseTableProps) {
  const [expenses, setExpenses] = useState<ExpenseCategoryInput[]>(initialExpenses);
  const debounceTimers = useRef<Map<string, ReturnType<typeof setTimeout>>>(
    new Map()
  );

  const baselineCampers = getBaselineCampers(season);
  const baselineRevenue = getBaselineRevenue(season);

  const forecast = calculateForecast({
    season,
    expenses,
    enrollmentPercent: season.baselineEnrollmentPercent,
  });

  const debouncedUpdate = useCallback(
    (expenseId: string, data: Parameters<typeof updateExpenseCategory>[1]) => {
      if (expenseId.startsWith("optimistic-")) return;
      const existing = debounceTimers.current.get(expenseId);
      if (existing) clearTimeout(existing);
      debounceTimers.current.set(
        expenseId,
        setTimeout(async () => {
          const result = await updateExpenseCategory(expenseId, data);
          if (result.error) toast.error(result.error);
        }, 800)
      );
    },
    []
  );

  function updateLocal(
    id: string,
    field: keyof ExpenseCategoryInput,
    value: string | number | null
  ) {
    setExpenses((prev) =>
      prev.map((e) => (e.id === id ? { ...e, [field]: value } : e))
    );
    debouncedUpdate(id, { [field]: value });
  }

  function updateMultiple(
    id: string,
    updates: Partial<ExpenseCategoryInput>
  ) {
    setExpenses((prev) =>
      prev.map((e) => (e.id === id ? { ...e, ...updates } : e))
    );
    debouncedUpdate(
      id,
      updates as Parameters<typeof updateExpenseCategory>[1]
    );
  }

  async function handleAdd() {
    const tempId = `optimistic-${++optimisticId}`;
    const newExpense: ExpenseCategoryInput = {
      id: tempId,
      name: "",
      costBehavior: "FIXED",
      inputMode: "TOTAL_BUDGET",
      budgetAmount: null,
      costPerCamper: null,
      percentOfRevenue: null,
    };

    setExpenses((prev) => [...prev, newExpense]);

    const result = await createExpenseCategory(seasonId, {
      name: "",
      costBehavior: "FIXED",
      inputMode: "TOTAL_BUDGET",
      budgetAmount: null,
    });

    if (result.error) {
      setExpenses((prev) => prev.filter((e) => e.id !== tempId));
      toast.error(result.error);
      return;
    }

    if (result.expense) {
      setExpenses((prev) =>
        prev.map((e) =>
          e.id === tempId ? { ...e, id: result.expense.id } : e
        )
      );
    }
  }

  async function handleDelete(id: string) {
    const removed = expenses.find((e) => e.id === id);
    setExpenses((prev) => prev.filter((e) => e.id !== id));

    if (id.startsWith("optimistic-")) return;

    const result = await deleteExpenseCategory(id);
    if (result.error) {
      if (removed) setExpenses((prev) => [...prev, removed]);
      toast.error(result.error);
      return;
    }
    toast.success("Category deleted");
  }

  function handleBehaviorChange(id: string, behavior: CostBehavior) {
    updateMultiple(id, { costBehavior: behavior, inputMode: "TOTAL_BUDGET" });
  }

  function handleInputModeChange(id: string, inputMode: InputMode) {
    updateMultiple(id, { inputMode });
  }

  function handleNameChange(id: string, name: string) {
    const expense = expenses.find((e) => e.id === id);
    const updates: Partial<ExpenseCategoryInput> = { name };

    if (expense && !expense.name) {
      const suggested = suggestBehavior(name);
      if (suggested !== expense.costBehavior) {
        updates.costBehavior = suggested;
        updates.inputMode = "TOTAL_BUDGET";
      }
    }

    setExpenses((prev) =>
      prev.map((e) => (e.id === id ? { ...e, ...updates } : e))
    );
    debouncedUpdate(
      id,
      updates as Parameters<typeof updateExpenseCategory>[1]
    );
  }

  function getHelperText(expense: ExpenseCategoryInput): string | null {
    if (
      expense.costBehavior === "PER_CAMPER" &&
      expense.inputMode === "TOTAL_BUDGET" &&
      expense.budgetAmount &&
      baselineCampers > 0
    ) {
      const perCamper = expense.budgetAmount / baselineCampers;
      return `≈ ${formatCurrencyDetailed(perCamper)} per camper`;
    }
    if (
      expense.costBehavior === "PER_CAMPER" &&
      expense.inputMode === "PER_CAMPER" &&
      expense.costPerCamper &&
      baselineCampers > 0
    ) {
      const total = expense.costPerCamper * baselineCampers;
      return `≈ ${formatCurrency(total)} total at baseline`;
    }
    if (
      expense.costBehavior === "PERCENT_REVENUE" &&
      expense.inputMode === "TOTAL_BUDGET" &&
      expense.budgetAmount &&
      baselineRevenue > 0
    ) {
      const pct = (expense.budgetAmount / baselineRevenue) * 100;
      return `≈ ${formatPercent(pct)} of revenue`;
    }
    if (
      expense.costBehavior === "PERCENT_REVENUE" &&
      expense.inputMode === "PERCENT_REVENUE" &&
      expense.percentOfRevenue &&
      baselineRevenue > 0
    ) {
      const total = (expense.percentOfRevenue / 100) * baselineRevenue;
      return `≈ ${formatCurrency(total)} total at baseline`;
    }
    return null;
  }

  function renderBudgetInput(expense: ExpenseCategoryInput) {
    const modeOptions = getInputModesForBehavior(expense.costBehavior);
    const hasModePicker = modeOptions.length > 0;

    const inputEl = (() => {
      if (expense.inputMode === "PER_CAMPER") {
        return (
          <div className="flex items-center gap-1">
            <span className="text-xs text-muted-foreground">$</span>
            <Input
              type="number"
              min={0}
              step="0.01"
              value={expense.costPerCamper ?? ""}
              onChange={(e) =>
                updateLocal(
                  expense.id,
                  "costPerCamper",
                  e.target.value ? parseFloat(e.target.value) : null
                )
              }
              className="h-8 w-28"
              placeholder="0.00"
            />
            <span className="text-xs text-muted-foreground whitespace-nowrap">
              /camper
            </span>
          </div>
        );
      }
      if (expense.inputMode === "PERCENT_REVENUE") {
        return (
          <div className="flex items-center gap-1">
            <Input
              type="number"
              min={0}
              max={100}
              step="0.01"
              value={expense.percentOfRevenue ?? ""}
              onChange={(e) =>
                updateLocal(
                  expense.id,
                  "percentOfRevenue",
                  e.target.value ? parseFloat(e.target.value) : null
                )
              }
              className="h-8 w-24"
              placeholder="0.0"
            />
            <span className="text-xs text-muted-foreground whitespace-nowrap">
              %
            </span>
          </div>
        );
      }
      return (
        <div className="flex items-center gap-1">
          <span className="text-xs text-muted-foreground">$</span>
          <Input
            type="number"
            min={0}
            step="1"
            value={expense.budgetAmount ?? ""}
            onChange={(e) =>
              updateLocal(
                expense.id,
                "budgetAmount",
                e.target.value ? parseFloat(e.target.value) : null
              )
            }
            className="h-8 w-28"
            placeholder="0"
          />
        </div>
      );
    })();

    return (
      <div className="space-y-1">
        <div className="flex items-center gap-2">
          {inputEl}
          {hasModePicker && (
            <Select
              value={expense.inputMode}
              onValueChange={(val) =>
                handleInputModeChange(expense.id, val as InputMode)
              }
            >
              <SelectTrigger className="h-8 w-auto text-xs px-2">
                {INPUT_MODE_LABELS[expense.inputMode]}
              </SelectTrigger>
              <SelectContent>
                {modeOptions.map((opt) => (
                  <SelectItem key={opt.value} value={opt.value}>
                    {opt.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}
        </div>
        {(() => {
          const helper = getHelperText(expense);
          return helper ? (
            <p className="text-xs text-muted-foreground">{helper}</p>
          ) : null;
        })()}
      </div>
    );
  }

  return (
    <Card>
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b text-left">
              <th className="px-4 py-3 font-medium">Category</th>
              <th className="px-4 py-3 font-medium">Cost Behavior</th>
              <th className="px-4 py-3 font-medium">Budget / Input</th>
              <th className="px-4 py-3 font-medium text-right">
                Forecast at Baseline
              </th>
              <th className="w-10 px-4 py-3"></th>
            </tr>
          </thead>
          <tbody>
            {expenses.map((expense) => {
              const catForecast = forecast.categories.find(
                (c) => c.id === expense.id
              );

              return (
                <tr key={expense.id} className="border-b last:border-0">
                  <td className="px-4 py-3">
                    <Input
                      value={expense.name}
                      onChange={(e) =>
                        handleNameChange(expense.id, e.target.value)
                      }
                      className="h-8 max-w-48"
                      placeholder="e.g. Staffing, Food..."
                    />
                  </td>
                  <td className="px-4 py-3">
                    <Select
                      value={expense.costBehavior}
                      onValueChange={(val) =>
                        handleBehaviorChange(
                          expense.id,
                          val as CostBehavior
                        )
                      }
                    >
                      <SelectTrigger className="h-8 w-36">
                        {COST_BEHAVIOR_LABELS[expense.costBehavior]}
                      </SelectTrigger>
                      <SelectContent>
                        {Object.entries(COST_BEHAVIOR_LABELS).map(
                          ([value, label]) => (
                            <SelectItem key={value} value={value}>
                              {label}
                            </SelectItem>
                          )
                        )}
                      </SelectContent>
                    </Select>
                  </td>
                  <td className="px-4 py-3">{renderBudgetInput(expense)}</td>
                  <td className="px-4 py-3 text-right font-medium tabular-nums">
                    {catForecast
                      ? formatCurrency(catForecast.forecastExpense)
                      : "—"}
                  </td>
                  <td className="px-4 py-3">
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8"
                      onClick={() => handleDelete(expense.id)}
                    >
                      <Trash2 className="h-4 w-4 text-muted-foreground" />
                    </Button>
                  </td>
                </tr>
              );
            })}
            {expenses.length === 0 && (
              <tr>
                <td
                  colSpan={5}
                  className="px-4 py-8 text-center text-muted-foreground"
                >
                  No expense categories yet. Add your first category to start
                  forecasting.
                </td>
              </tr>
            )}
          </tbody>
          <tfoot>
            <tr className="border-t bg-muted/30">
              <td className="px-4 py-3 font-medium" colSpan={3}>
                Total Expenses
              </td>
              <td className="px-4 py-3 text-right font-semibold tabular-nums">
                {formatCurrency(forecast.projectedExpenses)}
              </td>
              <td></td>
            </tr>
          </tfoot>
        </table>
      </div>
      <div className="border-t px-4 py-3">
        <Button variant="outline" size="sm" onClick={handleAdd}>
          <Plus className="mr-2 h-4 w-4" />
          Add category
        </Button>
      </div>
    </Card>
  );
}
