"use client";

import { useState } from "react";
import { createScenario } from "@/server/actions/scenarios";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Save } from "lucide-react";
import { toast } from "sonner";
import type { ForecastResult, SavedScenarioSummary } from "@/lib/forecasting/types";

const SUGGESTED_NAMES = ["Base Case", "Conservative Case", "Best Case", "Worst Case"];

interface SaveScenarioFormProps {
  seasonId: string;
  enrollmentPercent: number;
  forecast: ForecastResult;
  onSaved: (scenario: SavedScenarioSummary) => void;
}

export function SaveScenarioForm({
  seasonId,
  enrollmentPercent,
  forecast,
  onSaved,
}: SaveScenarioFormProps) {
  const [name, setName] = useState("");
  const [notes, setNotes] = useState("");
  const [saving, setSaving] = useState(false);

  async function handleSave() {
    if (!name.trim()) {
      toast.error("Please enter a scenario name");
      return;
    }

    setSaving(true);
    const result = await createScenario(seasonId, {
      name: name.trim(),
      enrollmentPercent,
      notes: notes || undefined,
      projectedRevenue: forecast.projectedRevenue,
      projectedExpenses: forecast.projectedExpenses,
      projectedSurplus: forecast.projectedSurplus,
    });
    setSaving(false);

    if (result.error) {
      toast.error(result.error);
      return;
    }

    if (result.scenario) {
      onSaved({
        id: result.scenario.id,
        name: result.scenario.name,
        enrollmentPercent: Number(result.scenario.enrollmentPercent),
        notes: result.scenario.notes,
        projectedRevenue: result.scenario.projectedRevenue
          ? Number(result.scenario.projectedRevenue)
          : null,
        projectedExpenses: result.scenario.projectedExpenses
          ? Number(result.scenario.projectedExpenses)
          : null,
        projectedSurplus: result.scenario.projectedSurplus
          ? Number(result.scenario.projectedSurplus)
          : null,
        createdAt: new Date().toISOString(),
      });
      setName("");
      setNotes("");
      toast.success("Scenario saved");
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">Save Current Scenario</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="scenario-name">Scenario name</Label>
          <div className="flex gap-2">
            <Input
              id="scenario-name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Base Case"
            />
          </div>
          <div className="flex flex-wrap gap-1">
            {SUGGESTED_NAMES.map((suggestion) => (
              <button
                key={suggestion}
                type="button"
                className="rounded-md border px-2 py-0.5 text-xs text-muted-foreground transition-colors hover:border-primary hover:text-foreground"
                onClick={() => setName(suggestion)}
              >
                {suggestion}
              </button>
            ))}
          </div>
        </div>
        <div className="space-y-2">
          <Label htmlFor="scenario-notes">Notes (optional)</Label>
          <Input
            id="scenario-notes"
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="Any context for this scenario..."
          />
        </div>
        <Button onClick={handleSave} disabled={saving}>
          <Save className="mr-2 h-4 w-4" />
          {saving ? "Saving..." : "Save scenario"}
        </Button>
      </CardContent>
    </Card>
  );
}
