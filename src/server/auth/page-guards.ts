import "server-only";

import { redirect } from "next/navigation";
import { SessionKind } from "../../../generated/prisma/client";
import { canAccessAdminPages, getCurrentUser } from "./permissions";

export async function requireAdminUserForPage(nextPath = "/admin") {
  const user = await getCurrentUser(SessionKind.ADMIN);

  if (!user) {
    redirect(`/admin/login?next=${encodeURIComponent(nextPath)}`);
  }

  if (!(await canAccessAdminPages(user.id))) {
    redirect(`/admin/login?next=${encodeURIComponent(nextPath)}`);
  }

  return user;
}
