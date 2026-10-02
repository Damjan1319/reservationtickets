import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";

export async function getStaffContext() {
  const session = await auth();
  if (!session?.user?.id) return null;

  const membership = await prisma.staffMembership.findFirst({
    where: { userId: session.user.id },
    include: { venue: true },
    orderBy: { createdAt: "asc" },
  });

  if (!membership) return null;

  return {
    userId: session.user.id,
    role: membership.role as "OWNER" | "STAFF",
    venue: membership.venue,
  };
}

export async function requireStaff() {
  const context = await getStaffContext();
  if (!context) return null;
  return context;
}

export async function requireOwner() {
  const context = await getStaffContext();
  if (!context || context.role !== "OWNER") return null;
  return context;
}

export async function requireAdmin() {
  const session = await auth();
  if (!session?.user?.id) return null;
  const user = await prisma.user.findUnique({ where: { id: session.user.id } });
  if (!user?.isAdmin) return null;
  return user;
}
