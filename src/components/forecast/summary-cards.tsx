"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  formatCurrency,
  formatPercent,
  formatNumber,
} from "@/lib/forecasting/helpers";
import type { BreakEvenResult, ForecastResult } from "@/lib/forecasting/types";
import {
  DollarSign,
  TrendingDown,
  TrendingUp,
  Users,
  Target,
  BarChart3,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface SummaryCardsProps {
  forecast: ForecastResult;
  breakEven: BreakEvenResult;
}

export function SummaryCards({ forecast, breakEven }: SummaryCardsProps) {
  const cards = [
    {
      title: "Projected Revenue",
      value: formatCurrency(forecast.projectedRevenue),
      icon: DollarSign,
      color: "text-blue-600",
    },
    {
      title: "Projected Expenses",
      value: formatCurrency(forecast.projectedExpenses),
      icon: BarChart3,
      color: "text-slate-600",
    },
    {
      title: "Surplus / Deficit",
      value: formatCurrency(Math.abs(forecast.projectedSurplus)),
      prefix: forecast.isDeficit ? "−" : "+",
      icon: forecast.isDeficit ? TrendingDown : TrendingUp,
      color: forecast.isDeficit ? "text-red-600" : "text-green-600",
      valueColor: forecast.isDeficit ? "text-red-600" : "text-green-600",
    },
    {
      title: "Break-Even Enrollment",
      value: breakEven.reachable
        ? formatPercent(breakEven.enrollmentPercent!)
        : "Not reachable",
      subtitle: breakEven.reachable
        ? `${formatNumber(breakEven.camperCount!)} campers`
        : undefined,
      icon: Target,
      color: "text-amber-600",
    },
    {
      title: "Projected Campers",
      value: formatNumber(forecast.projectedCampers),
      icon: Users,
      color: "text-indigo-600",
    },
    ...(forecast.contributionMarginPerCamper != null
      ? [
          {
            title: "Margin per Camper",
            value: formatCurrency(forecast.contributionMarginPerCamper),
            icon: TrendingUp,
            color: "text-teal-600",
          },
        ]
      : []),
  ];

  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {cards.map((card) => (
        <Card key={card.title}>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              {card.title}
            </CardTitle>
            <card.icon className={cn("h-4 w-4", card.color)} />
          </CardHeader>
          <CardContent>
            <div
              className={cn(
                "text-2xl font-bold tabular-nums",
                "valueColor" in card && card.valueColor
              )}
            >
              {"prefix" in card && card.prefix}
              {card.value}
            </div>
            {"subtitle" in card && card.subtitle && (
              <p className="mt-1 text-xs text-muted-foreground">
                {card.subtitle}
              </p>
            )}
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
