"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";

const tabs = [
  { label: "Setup", segment: "setup" },
  { label: "Forecast", segment: "forecast" },
  { label: "Scenarios", segment: "scenarios" },
];

export function SeasonTabNav({
  campId,
  seasonId,
}: {
  campId: string;
  seasonId: string;
}) {
  const pathname = usePathname();

  return (
    <nav className="flex gap-1 border-b">
      {tabs.map((tab) => {
        const href = `/camps/${campId}/seasons/${seasonId}/${tab.segment}`;
        const isActive = pathname.endsWith(`/${tab.segment}`);

        return (
          <Link
            key={tab.segment}
            href={href}
            className={cn(
              "relative px-4 py-2 text-sm font-medium transition-colors hover:text-foreground",
              isActive
                ? "text-foreground"
                : "text-muted-foreground"
            )}
          >
            {tab.label}
            {isActive && (
              <span className="absolute inset-x-0 -bottom-px h-0.5 bg-primary" />
            )}
          </Link>
        );
      })}
    </nav>
  );
}
