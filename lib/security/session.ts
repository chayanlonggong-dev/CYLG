import { prisma } from "@/lib/prisma";
import { randomBytes } from "crypto";

const SESSION_DAYS = 7;
const SESSION_MS = SESSION_DAYS * 24 * 60 * 60 * 1000;

export type DbSession = {
  id: string;
  token: string;
  adminUserId: number;
  expiresAt: Date;
  lastActivityAt: Date;
  ip: string | null;
  userAgent: string | null;
  createdAt: Date;
  updatedAt: Date;
};

function generateToken(): string {
  return randomBytes(32).toString("hex");
}

/**
 * 建立 DB session（與 login route 行為一致）
 */
export async function createDbSession(params: {
  adminUserId: number;
  ip?: string | null;
  userAgent?: string | null;
  days?: number;
}): Promise<DbSession> {
  const days = params.days ?? SESSION_DAYS;
  const token = generateToken();
  const expiresAt = new Date(Date.now() + days * 24 * 60 * 60 * 1000);

  return prisma.session.create({
    data: {
      token,
      adminUserId: params.adminUserId,
      expiresAt,
      lastActivityAt: new Date(),
      ip: params.ip ?? null,
      userAgent: params.userAgent ?? null,
    },
  });
}

/**
 * 用 cookie token 取有效 session（過期自動刪）
 */
export async function getSessionByToken(
  token: string | null | undefined
): Promise<DbSession | null> {
  if (!token) {
    return null;
  }

  const session = await prisma.session.findUnique({
    where: { token },
  });

  if (!session) {
    return null;
  }

  if (session.expiresAt.getTime() <= Date.now()) {
    await prisma.session.deleteMany({ where: { token } }).catch(() => {});
    return null;
  }

  return session;
}

/**
 * 取 session + adminUser
 */
export async function getSessionWithUser(token: string | null | undefined) {
  if (!token) {
    return null;
  }

  const session = await prisma.session.findUnique({
    where: { token },
    include: { adminUser: true },
  });

  if (!session) {
    return null;
  }

  if (session.expiresAt.getTime() <= Date.now()) {
    await prisma.session.deleteMany({ where: { token } }).catch(() => {});
    return null;
  }

  return session;
}

/**
 * 刪除單一 token（登出）
 */
export async function deleteSessionByToken(
  token: string | null | undefined
): Promise<void> {
  if (!token) {
    return;
  }

  await prisma.session.deleteMany({ where: { token } });
}

/**
 * 刪除某管理員全部 session（強制下線）
 */
export async function deleteSessionsByAdminUserId(
  adminUserId: number
): Promise<number> {
  const result = await prisma.session.deleteMany({
    where: { adminUserId },
  });

  return result.count;
}

/**
 * 延長 lastActivityAt / expiresAt（可選）
 */
export async function touchSession(
  token: string
): Promise<DbSession | null> {
  const session = await getSessionByToken(token);

  if (!session) {
    return null;
  }

  return prisma.session.update({
    where: { token },
    data: {
      lastActivityAt: new Date(),
      expiresAt: new Date(Date.now() + SESSION_MS),
    },
  });
}

/**
 * 清除所有過期 session（可給 cron / 維護用）
 */
export async function clearExpiredSessions(): Promise<number> {
  const result = await prisma.session.deleteMany({
    where: {
      expiresAt: { lte: new Date() },
    },
  });

  return result.count;
}

/**
 * 列出某管理員目前 session（安全中心用）
 */
export async function listSessionsByAdminUserId(adminUserId: number) {
  return prisma.session.findMany({
    where: {
      adminUserId,
      expiresAt: { gt: new Date() },
    },
    orderBy: { lastActivityAt: "desc" },
  });
}

// ---------------------------------------------------------------------------
// 相容層：舊記憶體 API 名稱 → 導向 DB（避免漏改的 import 直接炸）
// 新程式請用上面的 createDbSession / getSessionByToken 等
// ---------------------------------------------------------------------------

/** @deprecated 請用 createDbSession */
export async function createSession(
  _username: string,
  ip: string,
  userAgent: string,
  adminUserId?: number
) {
  if (adminUserId == null) {
    throw new Error(
      "createSession (memory) is removed. Use createDbSession({ adminUserId, ip, userAgent })."
    );
  }

  return createDbSession({ adminUserId, ip, userAgent });
}

/** @deprecated 請用 getSessionByToken */
export async function getSession(sessionId: string) {
  return getSessionByToken(sessionId);
}

/** @deprecated 請用 deleteSessionByToken */
export async function deleteSession(sessionId: string) {
  return deleteSessionByToken(sessionId);
}

/** @deprecated 無全域記憶體可清；改清過期 DB session */
export async function clearSessions() {
  return clearExpiredSessions();
}

/** @deprecated 請用 listSessionsByAdminUserId 或自行查 Prisma */
export async function getAllSessions() {
  return prisma.session.findMany({
    where: { expiresAt: { gt: new Date() } },
    orderBy: { lastActivityAt: "desc" },
  });
}

/** @deprecated 請用 touchSession */
export async function refreshSession(sessionId: string) {
  return touchSession(sessionId);
}