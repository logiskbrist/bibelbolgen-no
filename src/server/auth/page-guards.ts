import "server-only";

import { redirect } from "next/navigation";
import { SessionKind, SystemRole } from "../../../generated/prisma/client";
import { getCurrentUser } from "./permissions";

export async function requireAdminUserForPage(nextPath = "/admin") {
  const user = await getCurrentUser(SessionKind.ADMIN);

  if (!user) {
    redirect(`/admin/login?next=${encodeURIComponent(nextPath)}`);
  }

  return user;
}

export async function requireGlobalAdminForPage(nextPath = "/admin/global") {
  const user = await requireAdminUserForPage(nextPath);

  if (user.systemRole !== SystemRole.GLOBAL_ADMIN) {
    redirect("/admin");
  }

  return user;
}
