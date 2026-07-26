import {
  cookies,
} from "next/headers";

import {
  prisma,
} from "@/lib/prisma";

export async function getAdminSession() {
  const cookieStore = await cookies();
  const token = cookieStore.get("cylg_admin_session")?.value;

  if (!token) {
    return null;
  }

  const session = await prisma.session.findUnique({
    where: {
      token,
    },
    include: {
      adminUser: {
        select: {
          id: true,
          username: true,
        },
      },
    },
  });

  if (!session) {
    return null;
  }

  // 檢查是否過期
  if (session.expiresAt < new Date()) {
    // 過期就刪除
    await prisma.session.delete({
      where: {
        id: session.id,
      },
    }).catch(() => {});

    return null;
  }

  // 可選：檢查 lastActivityAt 是否超過 30 分鐘（雙重保險）
  const thirtyMinutesAgo = new Date(
    Date.now() - 30 * 60 * 1000
  );

  if (session.lastActivityAt < thirtyMinutesAgo) {
    await prisma.session.delete({
      where: {
        id: session.id,
      },
    }).catch(() => {});

    return null;
  }

  return {
    sessionId: session.id,
    token: session.token,
    adminUserId: session.adminUserId,
    username: session.adminUser.username,
    expiresAt: session.expiresAt,
    lastActivityAt: session.lastActivityAt,
  };
}

export async function requireAdminSession() {
  const session = await getAdminSession();

  if (!session) {
    throw new Error("Unauthorized");
  }

  return session;
}