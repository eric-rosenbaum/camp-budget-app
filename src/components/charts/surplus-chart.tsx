"use client";

import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ReferenceLine,
} from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { formatCurrency } from "@/lib/forecasting/helpers";
import type { ChartPoint } from "@/lib/forecasting/types";

interface SurplusChartProps {
  data: ChartPoint[];
  breakEvenPercent: number | null;
}

export function SurplusChart({ data, breakEvenPercent }: SurplusChartProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">
          Surplus / Deficit by Enrollment
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="h-80">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart
              data={data}
              margin={{ top: 5, right: 20, left: 20, bottom: 5 }}
            >
              <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
              <XAxis
                dataKey="enrollmentPercent"
                tickFormatter={(v) => `${v}%`}
                fontSize={12}
              />
              <YAxis
                tickFormatter={(v) =>
                  `$${Math.abs(v) >= 1000 ? `${(v / 1000).toFixed(0)}k` : v}`
                }
                fontSize={12}
              />
              <Tooltip
                formatter={(value) => [
                  formatCurrency(Number(value)),
                  "Surplus/Deficit",
                ]}
                labelFormatter={(label) => `Enrollment: ${label}%`}
              />
              <ReferenceLine y={0} stroke="#94a3b8" strokeDasharray="3 3" />
              {breakEvenPercent != null && (
                <ReferenceLine
                  x={breakEvenPercent}
                  stroke="#f59e0b"
                  strokeDasharray="5 5"
                  label={{
                    value: `Break-even ${breakEvenPercent}%`,
                    position: "top",
                    fontSize: 11,
                    fill: "#92400e",
                  }}
                />
              )}
              <Line
                type="monotone"
                dataKey="surplus"
                stroke="#2563eb"
                strokeWidth={2}
                dot={false}
                activeDot={{ r: 4 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
}
