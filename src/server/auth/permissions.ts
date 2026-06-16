import "server-only";

import { getDb } from "~/server/db";
import {
  GroupStatus,
  GroupVisibility,
  MembershipStatus,
  SessionKind,
  SystemRole,
} from "../../../generated/prisma/client";
import { getSessionFromCookie } from "./sessions";

export class AuthenticationError extends Error {
  constructor(message = "Du må være logget inn for å gjøre dette.") {
    super(message);
    this.name = "AuthenticationError";
  }
}

export class AuthorizationError extends Error {
  constructor(message = "Du har ikke tilgang til dette.") {
    super(message);
    this.name = "AuthorizationError";
  }
}

export async function getCurrentUser(kind?: SessionKind) {
  if (kind) {
    const session = await getSessionFromCookie(kind);
    return session?.user ?? null;
  }

  const memberSession = await getSessionFromCookie(SessionKind.MEMBER_DEVICE);

  if (memberSession) {
    return memberSession.user;
  }

  const adminSession = await getSessionFromCookie(SessionKind.ADMIN);
  return adminSession?.user ?? null;
}

export async function requireUser(kind?: SessionKind) {
  const user = await getCurrentUser(kind);

  if (!user) {
    throw new AuthenticationError();
  }

  return user;
}

export async function requireGlobalAdmin(userId?: string) {
  const user = userId
    ? await getDb().user.findUnique({ where: { id: userId } })
    : await requireUser(SessionKind.ADMIN);

  if (!user || user.systemRole !== SystemRole.GLOBAL_ADMIN) {
    throw new AuthorizationError("Kun global admin har tilgang til dette.");
  }

  return user;
}

export async function isGlobalAdmin(userId: string) {
  const user = await getDb().user.findUnique({
    select: { systemRole: true },
    where: { id: userId },
  });

  return user?.systemRole === SystemRole.GLOBAL_ADMIN;
}

export async function getGroupAdminRole(groupId: string, userId: string) {
  const assignment = await getDb().groupAdmin.findUnique({
    select: { role: true },
    where: {
      groupId_userId: {
        groupId,
        userId,
      },
    },
  });

  return assignment?.role ?? null;
}

export async function canAdminGroup(groupId: string, userId: string) {
  if (await isGlobalAdmin(userId)) {
    return true;
  }

  return Boolean(await getGroupAdminRole(groupId, userId));
}

export async function requireGroupAdmin(groupId: string, userId?: string) {
  const user = userId
    ? await getDb().user.findUnique({ where: { id: userId } })
    : await requireUser(SessionKind.ADMIN);

  if (!user || !(await canAdminGroup(groupId, user.id))) {
    throw new AuthorizationError("Du må være admin for denne gruppa.");
  }

  return user;
}

export async function canViewGroup(groupId: string, userId?: string) {
  const db = getDb();
  const group = await db.group.findUnique({
    select: {
      status: true,
      visibility: true,
    },
    where: { id: groupId },
  });

  if (!group || group.status === GroupStatus.ARCHIVED) {
    return false;
  }

  if (
    group.visibility === GroupVisibility.PUBLIC &&
    group.status === GroupStatus.ACTIVE
  ) {
    return true;
  }

  if (!userId) {
    return false;
  }

  if (await canAdminGroup(groupId, userId)) {
    return true;
  }

  const membership = await db.groupMembership.findUnique({
    select: { status: true },
    where: {
      groupId_userId: {
        groupId,
        userId,
      },
    },
  });

  return membership?.status === MembershipStatus.ACTIVE;
}

export async function requireGroupAccess(groupId: string, userId?: string) {
  const user = userId ? { id: userId } : await getCurrentUser();
  const canView = await canViewGroup(groupId, user?.id);

  if (!canView) {
    throw new AuthorizationError("Du har ikke tilgang til denne gruppa.");
  }

  return user;
}

export async function requireActiveMembership(
  groupId: string,
  userId?: string,
) {
  const user = userId ? { id: userId } : await requireUser();

  const membership = await getDb().groupMembership.findUnique({
    where: {
      groupId_userId: {
        groupId,
        userId: user.id,
      },
    },
  });

  if (!membership || membership.status !== MembershipStatus.ACTIVE) {
    throw new AuthorizationError("Du er ikke medlem av denne gruppa.");
  }

  return membership;
}
