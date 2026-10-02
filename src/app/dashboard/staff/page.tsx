import { redirect } from "next/navigation";
import { getTranslations } from "next-intl/server";
import { removeStaffMember } from "@/app/actions/staff";
import { AddStaffForm } from "@/components/add-staff-form";
import { PageHeader } from "@/components/page-header";
import { prisma } from "@/lib/prisma";
import { requireOwner } from "@/lib/staff";

export default async function StaffPage() {
  const context = await requireOwner();
  if (!context) redirect("/dashboard");
  const t = await getTranslations("staff");
  const members = await prisma.staffMembership.findMany({
    where: { venueId: context.venue.id },
    include: { user: true },
    orderBy: { createdAt: "asc" },
  });

  return (
    <div>
      <PageHeader title={t("title")} />
      <div className="mt-8 space-y-4">
        {members.map((member) => (
          <div
            key={member.id}
            className="flex items-center justify-between rounded-2xl border border-paper-line bg-paper px-5 py-4 text-paper-text"
          >
            <div>
              <p className="text-paper-text">{member.user.name}</p>
              <p className="text-sm text-paper-muted">{member.user.email}</p>
            </div>
            <div className="flex items-center gap-3">
              <span className="text-xs font-medium text-paper-muted">
                {member.role === "OWNER" ? t("roleOwner") : t("roleStaff")}
              </span>
              {member.role === "STAFF" ? (
                <form
                  action={async () => {
                    "use server";
                    await removeStaffMember(member.id);
                  }}
                >
                  <button type="submit" className="text-sm text-danger">
                    {t("remove")}
                  </button>
                </form>
              ) : null}
            </div>
          </div>
        ))}
      </div>
      <div className="mt-10 rounded-2xl border border-paper-line bg-paper p-6 text-paper-text">
        <AddStaffForm />
      </div>
    </div>
  );
}
