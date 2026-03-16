"use server";

import { prisma } from "@/lib/db";
import { requireOrganization } from "@/lib/auth";
import { revalidatePath } from "next/cache";

export async function getCamps() {
  const { organization } = await requireOrganization();

  const camps = await prisma.camp.findMany({
    where: { organizationId: organization.id },
    include: {
      seasons: {
        orderBy: { createdAt: "desc" },
        take: 1,
        select: {
          id: true,
          name: true,
          year: true,
          capacity: true,
          baselineEnrollmentPercent: true,
        },
      },
    },
    orderBy: { createdAt: "desc" },
  });

  return camps;
}

export async function createCamp(formData: FormData) {
  const { organization } = await requireOrganization();
  const name = formData.get("name") as string;

  if (!name || name.trim().length === 0) {
    return { error: "Camp name is required" };
  }

  const camp = await prisma.camp.create({
    data: {
      name: name.trim(),
      organizationId: organization.id,
    },
  });

  revalidatePath("/camps");
  return { camp };
}

export async function deleteCamp(campId: string) {
  const { organization } = await requireOrganization();

  const camp = await prisma.camp.findFirst({
    where: { id: campId, organizationId: organization.id },
  });

  if (!camp) {
    return { error: "Camp not found" };
  }

  await prisma.camp.delete({ where: { id: campId } });
  revalidatePath("/camps");
  return { success: true };
}
