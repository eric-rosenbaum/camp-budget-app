import { prisma } from "@/lib/db";
import { requireOrganization } from "@/lib/auth";
import { notFound } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { ArrowLeft, Calendar, ChevronRight } from "lucide-react";
import { CreateSeasonDialog } from "./create-season-dialog";

export default async function CampDetailPage({
  params,
}: {
  params: Promise<{ campId: string }>;
}) {
  const { campId } = await params;
  const { organization } = await requireOrganization();

  const camp = await prisma.camp.findFirst({
    where: { id: campId, organizationId: organization.id },
    include: {
      seasons: {
        orderBy: { createdAt: "desc" },
      },
    },
  });

  if (!camp) {
    notFound();
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link href="/camps">
          <Button variant="ghost" size="icon">
            <ArrowLeft className="h-4 w-4" />
          </Button>
        </Link>
        <div className="flex-1">
          <h1 className="text-3xl font-bold tracking-tight">{camp.name}</h1>
          <p className="text-muted-foreground">
            Manage seasons and budget models
          </p>
        </div>
        <CreateSeasonDialog campId={campId} />
      </div>

      {camp.seasons.length === 0 ? (
        <Card className="border-dashed">
          <CardHeader className="items-center text-center">
            <div className="mb-2 flex h-12 w-12 items-center justify-center rounded-full bg-muted">
              <Calendar className="h-6 w-6 text-muted-foreground" />
            </div>
            <CardTitle className="text-lg">No seasons yet</CardTitle>
            <CardDescription>
              Create your first season to start building a budget forecast.
            </CardDescription>
          </CardHeader>
        </Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {camp.seasons.map((season) => (
            <Card
              key={season.id}
              className="group relative transition-colors hover:border-primary/30"
            >
              <Link
                href={`/camps/${campId}/seasons/${season.id}/setup`}
                className="absolute inset-0 z-10"
              >
                <span className="sr-only">Open {season.name}</span>
              </Link>
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 text-primary">
                      <Calendar className="h-5 w-5" />
                    </div>
                    <div>
                      <CardTitle className="text-lg">{season.name}</CardTitle>
                      <CardDescription>
                        {season.year && `${season.year} · `}
                        Capacity: {season.capacity}
                      </CardDescription>
                    </div>
                  </div>
                  <ChevronRight className="h-4 w-4 text-muted-foreground" />
                </div>
              </CardHeader>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
