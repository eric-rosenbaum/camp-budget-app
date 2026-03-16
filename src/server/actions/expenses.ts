"use server";

import { prisma } from "@/lib/db";
import { requireOrganization } from "@/lib/auth";
import { revalidatePath } from "next/cache";
import { serialize } from "@/lib/serialize";
import type { CostBehavior, InputMode } from "@/generated/prisma/client";

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

export async function createExpenseCategory(
  seasonId: string,
  data: {
    name: string;
    costBehavior: CostBehavior;
    inputMode: InputMode;
    budgetAmount?: number | null;
    costPerCamper?: number | null;
    percentOfRevenue?: number | null;
    notes?: string;
  }
) {
  const season = await verifySeasonAccess(seasonId);
  if (!season) return { error: "Season not found" };

  const maxSort = await prisma.expenseCategory.aggregate({
    where: { campSeasonId: seasonId },
    _max: { sortOrder: true },
  });

  const expense = await prisma.expenseCategory.create({
    data: {
      campSeasonId: seasonId,
      name: data.name?.trim() || "New Category",
      costBehavior: data.costBehavior,
      inputMode: data.inputMode,
      budgetAmount: data.budgetAmount ?? null,
      costPerCamper: data.costPerCamper ?? null,
      percentOfRevenue: data.percentOfRevenue ?? null,
      notes: data.notes || null,
      sortOrder: (maxSort._max.sortOrder ?? 0) + 1,
    },
  });

  revalidatePath(`/camps/${season.campId}/seasons/${seasonId}`);
  return { expense: serialize(expense) };
}

export async function updateExpenseCategory(
  expenseId: string,
  data: {
    name?: string;
    costBehavior?: CostBehavior;
    inputMode?: InputMode;
    budgetAmount?: number | null;
    costPerCamper?: number | null;
    percentOfRevenue?: number | null;
    notes?: string | null;
  }
) {
  const expense = await prisma.expenseCategory.findFirst({
    where: { id: expenseId },
    include: { campSeason: { include: { camp: true } } },
  });
  if (!expense) return { error: "Expense not found" };

  const { organization } = await requireOrganization();
  if (expense.campSeason.camp.organizationId !== organization.id) {
    return { error: "Expense not found" };
  }

  await prisma.expenseCategory.update({
    where: { id: expenseId },
    data: {
      ...(data.name !== undefined && { name: data.name }),
      ...(data.costBehavior !== undefined && { costBehavior: data.costBehavior }),
      ...(data.inputMode !== undefined && { inputMode: data.inputMode }),
      ...(data.budgetAmount !== undefined && { budgetAmount: data.budgetAmount }),
      ...(data.costPerCamper !== undefined && { costPerCamper: data.costPerCamper }),
      ...(data.percentOfRevenue !== undefined && {
        percentOfRevenue: data.percentOfRevenue,
      }),
      ...(data.notes !== undefined && { notes: data.notes }),
    },
  });

  return { success: true };
}

export async function deleteExpenseCategory(expenseId: string) {
  const expense = await prisma.expenseCategory.findFirst({
    where: { id: expenseId },
    include: { campSeason: { include: { camp: true } } },
  });
  if (!expense) return { error: "Expense not found" };

  const { organization } = await requireOrganization();
  if (expense.campSeason.camp.organizationId !== organization.id) {
    return { error: "Expense not found" };
  }

  await prisma.expenseCategory.delete({ where: { id: expenseId } });

  const { campId } = expense.campSeason;
  revalidatePath(`/camps/${campId}/seasons/${expense.campSeasonId}`);
  return { success: true };
}
