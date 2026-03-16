"use client";

import { useState, useCallback, useRef, useEffect } from "react";
import { updateSeasonDrivers } from "@/server/actions/seasons";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { formatCurrency, formatNumber } from "@/lib/forecasting/helpers";
import { toast } from "sonner";
import type { CampSeasonInput } from "@/lib/forecasting/types";

interface DriversFormProps {
  seasonId: string;
  initialData: CampSeasonInput & { name: string; year: number | null };
}

export function DriversForm({ seasonId, initialData }: DriversFormProps) {
  const [data, setData] = useState(initialData);
  const [saving, setSaving] = useState(false);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const projectedCampers =
    (data.capacity * data.baselineEnrollmentPercent) / 100;
  const projectedRevenue = projectedCampers * data.tuitionPerCamper;

  const save = useCallback(
    async (updates: Parameters<typeof updateSeasonDrivers>[1]) => {
      setSaving(true);
      const result = await updateSeasonDrivers(seasonId, updates);
      setSaving(false);
      if (result.error) {
        toast.error(result.error);
      }
    },
    [seasonId]
  );

  const debouncedSave = useCallback(
    (updates: Parameters<typeof updateSeasonDrivers>[1]) => {
      if (timerRef.current) clearTimeout(timerRef.current);
      timerRef.current = setTimeout(() => save(updates), 800);
    },
    [save]
  );

  useEffect(() => {
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, []);

  function handleChange(
    field: keyof typeof data,
    raw: string
  ) {
    const numericFields = [
      "capacity",
      "tuitionPerCamper",
      "baselineEnrollmentPercent",
      "priorYearCampers",
    ];
    let value: string | number | null = raw;

    if (numericFields.includes(field)) {
      if (raw === "") {
        value = field === "priorYearCampers" ? null : 0;
      } else {
        value = parseFloat(raw);
        if (isNaN(value as number)) return;
      }
    }

    setData((prev) => ({ ...prev, [field]: value }));
    debouncedSave({ [field]: value });
  }

  return (
    <Card>
      <CardContent className="pt-6">
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          <div className="space-y-2">
            <Label htmlFor="d-name">Season name</Label>
            <Input
              id="d-name"
              value={data.name}
              onChange={(e) => handleChange("name", e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="d-capacity">Camp capacity</Label>
            <Input
              id="d-capacity"
              type="number"
              min={1}
              value={data.capacity || ""}
              onChange={(e) => handleChange("capacity", e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="d-tuition">Tuition per camper</Label>
            <Input
              id="d-tuition"
              type="number"
              min={0}
              step="0.01"
              value={data.tuitionPerCamper || ""}
              onChange={(e) =>
                handleChange("tuitionPerCamper", e.target.value)
              }
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="d-enrollment">Baseline enrollment %</Label>
            <Input
              id="d-enrollment"
              type="number"
              min={0}
              max={100}
              step="0.1"
              value={data.baselineEnrollmentPercent || ""}
              onChange={(e) =>
                handleChange("baselineEnrollmentPercent", e.target.value)
              }
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="d-prior">Prior-year campers (optional)</Label>
            <Input
              id="d-prior"
              type="number"
              min={0}
              value={data.priorYearCampers ?? ""}
              onChange={(e) =>
                handleChange("priorYearCampers", e.target.value)
              }
            />
          </div>
        </div>

        <div className="mt-6 flex flex-wrap gap-6 rounded-lg bg-muted/50 p-4">
          <div>
            <p className="text-xs text-muted-foreground">Projected campers</p>
            <p className="text-lg font-semibold">
              {formatNumber(projectedCampers)}
            </p>
          </div>
          <div>
            <p className="text-xs text-muted-foreground">Projected revenue</p>
            <p className="text-lg font-semibold">
              {formatCurrency(projectedRevenue)}
            </p>
          </div>
          <div className="ml-auto text-xs text-muted-foreground self-center">
            {saving ? "Saving..." : "Auto-saved"}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
