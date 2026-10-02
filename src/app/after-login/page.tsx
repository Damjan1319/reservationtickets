import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { getStaffContext } from "@/lib/staff";

export default async function AfterLoginPage() {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");

  const staff = await getStaffContext();
  if (staff?.role === "STAFF") redirect("/dashboard/scan");
  if (staff?.role === "OWNER") redirect("/dashboard");

  const admin = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { isAdmin: true },
  });
  if (admin?.isAdmin) redirect("/admin");

  redirect("/tickets");
}
