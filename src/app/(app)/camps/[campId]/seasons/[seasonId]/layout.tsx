import Link from "next/link";
import { prisma } from "@/lib/db";
import { requireOrganization } from "@/lib/auth";
import { notFound } from "next/navigation";
import { SeasonTabNav } from "./season-tab-nav";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";

export default async function SeasonLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ campId: string; seasonId: string }>;
}) {
  const { campId, seasonId } = await params;
  const { organization } = await requireOrganization();

  const season = await prisma.campSeason.findFirst({
    where: { id: seasonId },
    include: { camp: true },
  });

  if (!season || season.camp.organizationId !== organization.id) {
    notFound();
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link href={`/camps/${campId}`}>
          <Button variant="ghost" size="icon">
            <ArrowLeft className="h-4 w-4" />
          </Button>
        </Link>
        <div>
          <h1 className="text-2xl font-bold tracking-tight">
            {season.camp.name}
          </h1>
          <p className="text-muted-foreground">
            {season.name}
            {season.year ? ` (${season.year})` : ""}
          </p>
        </div>
      </div>

      <SeasonTabNav campId={campId} seasonId={seasonId} />

      {children}
    </div>
  );
}
