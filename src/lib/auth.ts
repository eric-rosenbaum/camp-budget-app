import { createClient } from "@/lib/supabase/server";
import { prisma } from "@/lib/db";
import { redirect } from "next/navigation";

export async function getUser() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  return user;
}

export async function requireUser() {
  const user = await getUser();
  if (!user) {
    redirect("/login");
  }
  return user;
}

export async function getOrCreateOrganization(userId: string, userName?: string) {
  const existing = await prisma.organizationMember.findFirst({
    where: { userId },
    include: { organization: true },
  });

  if (existing) {
    return existing.organization;
  }

  const org = await prisma.organization.create({
    data: {
      name: userName ? `${userName}'s Organization` : "My Organization",
      members: {
        create: {
          userId,
          role: "OWNER",
        },
      },
    },
  });

  return org;
}

export async function requireOrganization() {
  const user = await requireUser();
  const org = await getOrCreateOrganization(
    user.id,
    user.user_metadata?.name
  );
  return { user, organization: org };
}
