"use client";

import { Badge } from "@/components/ui/badge";
import { AlertTriangle, AlertCircle, Info } from "lucide-react";
import type { RiskIndicator } from "@/lib/forecasting/types";
import { cn } from "@/lib/utils";

const config: Record<
  RiskIndicator["level"],
  { icon: typeof AlertTriangle; className: string }
> = {
  danger: {
    icon: AlertCircle,
    className: "border-red-200 bg-red-50 text-red-800 dark:border-red-800 dark:bg-red-950 dark:text-red-200",
  },
  warning: {
    icon: AlertTriangle,
    className: "border-amber-200 bg-amber-50 text-amber-800 dark:border-amber-800 dark:bg-amber-950 dark:text-amber-200",
  },
  info: {
    icon: Info,
    className: "border-blue-200 bg-blue-50 text-blue-800 dark:border-blue-800 dark:bg-blue-950 dark:text-blue-200",
  },
};

export function RiskIndicators({
  indicators,
}: {
  indicators: RiskIndicator[];
}) {
  return (
    <div className="space-y-2">
      {indicators.map((indicator, i) => {
        const { icon: Icon, className } = config[indicator.level];
        return (
          <div
            key={i}
            className={cn(
              "flex items-start gap-3 rounded-lg border px-4 py-3",
              className
            )}
          >
            <Icon className="mt-0.5 h-4 w-4 shrink-0" />
            <p className="text-sm">{indicator.message}</p>
          </div>
        );
      })}
    </div>
  );
}
