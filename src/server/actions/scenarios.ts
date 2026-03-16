"use server";

import { prisma } from "@/lib/db";
import { requireOrganization } from "@/lib/auth";
import { revalidatePath } from "next/cache";
import { serialize } from "@/lib/serialize";

async function verifySeasonAccess(seasonId: string) {
  const { organization } = await requireOrganization();
  const season = await prisma.campSeason.findFirst({
    where: { id: seasonId },
    include: { camp: true },
  });
  if (!season || season.camp.organizationId !== organization.id) {
    return null;
  }
  return season;
}

export async function createScenario(
  seasonId: string,
  data: {
    name: string;
    enrollmentPercent: number;
    notes?: string;
    projectedRevenue?: number;
    projectedExpenses?: number;
    projectedSurplus?: number;
  }
) {
  const season = await verifySeasonAccess(seasonId);
  if (!season) return { error: "Season not found" };

  if (!data.name?.trim()) return { error: "Scenario name is required" };
  if (data.enrollmentPercent < 0 || data.enrollmentPercent > 100) {
    return { error: "Enrollment percent must be between 0 and 100" };
  }

  const scenario = await prisma.savedScenario.create({
    data: {
      campSeasonId: seasonId,
      name: data.name.trim(),
      enrollmentPercent: data.enrollmentPercent,
      notes: data.notes || null,
      projectedRevenue: data.projectedRevenue ?? null,
      projectedExpenses: data.projectedExpenses ?? null,
      projectedSurplus: data.projectedSurplus ?? null,
    },
  });

  revalidatePath(`/camps/${season.campId}/seasons/${seasonId}`);
  return { scenario: serialize(scenario) };
}

export async function deleteScenario(scenarioId: string) {
  const scenario = await prisma.savedScenario.findFirst({
    where: { id: scenarioId },
    include: { campSeason: { include: { camp: true } } },
  });
  if (!scenario) return { error: "Scenario not found" };

  const { organization } = await requireOrganization();
  if (scenario.campSeason.camp.organizationId !== organization.id) {
    return { error: "Scenario not found" };
  }

  await prisma.savedScenario.delete({ where: { id: scenarioId } });

  const { campId } = scenario.campSeason;
  revalidatePath(`/camps/${campId}/seasons/${scenario.campSeasonId}`);
  return { success: true };
}

export async function getSavedScenarios(seasonId: string) {
  const season = await verifySeasonAccess(seasonId);
  if (!season) return [];

  return prisma.savedScenario.findMany({
    where: { campSeasonId: seasonId },
    orderBy: { createdAt: "desc" },
  });
}
