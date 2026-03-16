"use server";

import { prisma } from "@/lib/db";
import { requireOrganization } from "@/lib/auth";
import { revalidatePath } from "next/cache";
import { serialize } from "@/lib/serialize";

export async function createSeason(campId: string, formData: FormData) {
  const { organization } = await requireOrganization();

  const camp = await prisma.camp.findFirst({
    where: { id: campId, organizationId: organization.id },
  });
  if (!camp) return { error: "Camp not found" };

  const name = (formData.get("name") as string)?.trim();
  const yearStr = formData.get("year") as string;
  const capacity = parseInt(formData.get("capacity") as string, 10);
  const tuitionPerCamper = parseFloat(formData.get("tuitionPerCamper") as string);
  const baselineEnrollmentPercent = parseFloat(
    formData.get("baselineEnrollmentPercent") as string
  );

  if (!name) return { error: "Season name is required" };
  if (!capacity || capacity <= 0) return { error: "Capacity must be a positive number" };
  if (isNaN(tuitionPerCamper) || tuitionPerCamper < 0)
    return { error: "Tuition must be non-negative" };
  if (
    isNaN(baselineEnrollmentPercent) ||
    baselineEnrollmentPercent < 0 ||
    baselineEnrollmentPercent > 100
  )
    return { error: "Enrollment percent must be between 0 and 100" };

  const season = await prisma.campSeason.create({
    data: {
      campId,
      name,
      year: yearStr ? parseInt(yearStr, 10) : null,
      capacity,
      tuitionPerCamper,
      baselineEnrollmentPercent,
    },
  });

  revalidatePath(`/camps/${campId}`);
  return { season: serialize(season) };
}

export async function updateSeasonDrivers(
  seasonId: string,
  data: {
    name?: string;
    year?: number | null;
    capacity?: number;
    tuitionPerCamper?: number;
    baselineEnrollmentPercent?: number;
    priorYearCampers?: number | null;
  }
) {
  const { organization } = await requireOrganization();

  const season = await prisma.campSeason.findFirst({
    where: { id: seasonId },
    include: { camp: true },
  });
  if (!season || season.camp.organizationId !== organization.id) {
    return { error: "Season not found" };
  }

  if (data.capacity != null && data.capacity <= 0)
    return { error: "Capacity must be positive" };
  if (data.tuitionPerCamper != null && data.tuitionPerCamper < 0)
    return { error: "Tuition must be non-negative" };
  if (
    data.baselineEnrollmentPercent != null &&
    (data.baselineEnrollmentPercent < 0 || data.baselineEnrollmentPercent > 100)
  )
    return { error: "Enrollment percent must be between 0 and 100" };

  await prisma.campSeason.update({
    where: { id: seasonId },
    data: {
      ...(data.name !== undefined && { name: data.name }),
      ...(data.year !== undefined && { year: data.year }),
      ...(data.capacity !== undefined && { capacity: data.capacity }),
      ...(data.tuitionPerCamper !== undefined && {
        tuitionPerCamper: data.tuitionPerCamper,
      }),
      ...(data.baselineEnrollmentPercent !== undefined && {
        baselineEnrollmentPercent: data.baselineEnrollmentPercent,
      }),
      ...(data.priorYearCampers !== undefined && {
        priorYearCampers: data.priorYearCampers,
      }),
    },
  });

  return { success: true };
}

export async function getSeasonWithExpenses(seasonId: string) {
  const { organization } = await requireOrganization();

  const season = await prisma.campSeason.findFirst({
    where: { id: seasonId },
    include: {
      camp: true,
      expenseCategories: {
        orderBy: [{ sortOrder: "asc" }, { createdAt: "asc" }],
      },
    },
  });

  if (!season || season.camp.organizationId !== organization.id) {
    return null;
  }

  return season;
}
