import { Prisma } from "@prisma/client";
import fs from "fs";
import path from "path";
import crypto from "crypto";

import { prisma } from "@/lib/prisma";

export type IntegrityStatus =
  | "HEALTHY"
  | "MODIFIED"
  | "MISSING"
  | "ERROR";

export interface IntegrityManifestFile {
  path: string;
  hash: string;
  size: number;
}

export interface IntegrityManifest {
  version: number;
  algorithm: string;
  generatedAt: string;
  files: IntegrityManifestFile[];
}

export interface IntegrityResult {
  status: IntegrityStatus;
  path: string;
  expectedHash: string;
  actualHash: string | null;
  expectedSize: number;
  actualSize: number | null;
}

export interface IntegritySummary {
  total: number;
  healthy: number;
  modified: number;
  missing: number;
  errors: number;
  results: IntegrityResult[];
  /** 正式站 Serverless 环境会跳过完整校验 */
  skipped?: boolean;
  skipReason?: string;
}

export interface IntegrityBaselineUpdateResult {
  backupPath: string;
  generatedAt: string;
  protectedFiles: number;
}

const PROJECT_ROOT = process.cwd();

const MANIFEST_PATH = path.join(
  PROJECT_ROOT,
  ".security",
  "integrity-manifest.json"
);

const MANIFEST_BACKUP_ROOT = path.join(
  PROJECT_ROOT,
  ".security",
  "manifest-backups"
);

// =====================================================
// Environment Detection (Serverless / Vercel)
// =====================================================

function isServerlessEnvironment(): boolean {
  return (
    process.env.VERCEL === "1" ||
    !!process.env.AWS_LAMBDA_FUNCTION_NAME ||
    process.env.NEXT_RUNTIME === "edge" ||
    (process.env.NODE_ENV === "production" &&
      !!process.env.VERCEL_ENV)
  );
}

// =====================================================
// Safe Project Path Resolver
// =====================================================

function resolveSafeProjectPath(relativePath: string): string {
  const normalized = relativePath
    .replace(/\\/g, "/")
    .replace(/^\/+/, "");

  const resolved = path.resolve(PROJECT_ROOT, normalized);

  const rootWithSeparator = PROJECT_ROOT.endsWith(path.sep)
    ? PROJECT_ROOT
    : PROJECT_ROOT + path.sep;

  if (
    resolved !== PROJECT_ROOT &&
    !resolved.startsWith(rootWithSeparator)
  ) {
    throw new Error(`Unsafe integrity path: ${relativePath}`);
  }

  return resolved;
}

// =====================================================
// SHA-256
// =====================================================

function calculateSha256(filePath: string): string {
  const data = fs.readFileSync(filePath);

  return crypto
    .createHash("sha256")
    .update(data)
    .digest("hex")
    .toLowerCase();
}

// =====================================================
// Validate Manifest Shape
// =====================================================

function isValidManifest(value: unknown): value is IntegrityManifest {
  if (!value || typeof value !== "object") return false;

  const m = value as IntegrityManifest;

  return (
    m.version === 1 &&
    m.algorithm === "sha256" &&
    typeof m.generatedAt === "string" &&
    Array.isArray(m.files) &&
    m.files.every(
      (f) =>
        f &&
        typeof f.path === "string" &&
        typeof f.hash === "string" &&
        typeof f.size === "number"
    )
  );
}

// =====================================================
// File-based Manifest (local bootstrap / fallback)
// =====================================================

function loadManifestFromFile(): IntegrityManifest {
  if (!fs.existsSync(MANIFEST_PATH)) {
    throw new Error("Integrity manifest not found.");
  }

  const raw = fs.readFileSync(MANIFEST_PATH, "utf8");
  const manifest = JSON.parse(raw) as IntegrityManifest;

  if (!isValidManifest(manifest)) {
    throw new Error("Invalid integrity manifest.");
  }

  return manifest;
}

function writeManifestToFile(manifest: IntegrityManifest): void {
  const dir = path.dirname(MANIFEST_PATH);

  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }

  fs.writeFileSync(
    MANIFEST_PATH,
    JSON.stringify(manifest, null, 2) + "\n",
    "utf8"
  );
}

// =====================================================
// Database-backed Manifest (true persistence)
// =====================================================

async function loadManifestFromDb(): Promise<IntegrityManifest | null> {
  try {
    const row = await prisma.integrityBaseline.findUnique({
      where: { id: 1 },
    });

    if (!row) return null;

    const files = row.files as unknown;

    const manifest: IntegrityManifest = {
      version: row.version,
      algorithm: row.algorithm,
      generatedAt:
        row.generatedAt instanceof Date
          ? row.generatedAt.toISOString()
          : String(row.generatedAt),
      files: Array.isArray(files)
        ? (files as IntegrityManifestFile[])
        : [],
    };

    if (!isValidManifest(manifest)) {
      console.error(
        "INTEGRITY: Invalid baseline stored in database, ignoring."
      );
      return null;
    }

    return manifest;
  } catch (error) {
    // Table may not exist yet before migration
    console.error("INTEGRITY: Failed to load baseline from DB:", error);
    return null;
  }
}

async function saveManifestToDb(
  manifest: IntegrityManifest
): Promise<void> {
  const generatedAt = new Date(manifest.generatedAt);

  await prisma.integrityBaseline.upsert({
    where: { id: 1 },
    create: {
      id: 1,
      version: manifest.version,
      algorithm: manifest.algorithm,
      generatedAt,
      files: manifest.files as unknown as Prisma.InputJsonValue,
    },
    update: {
      version: manifest.version,
      algorithm: manifest.algorithm,
      generatedAt,
      files: manifest.files as unknown as Prisma.InputJsonValue,
    },
  });
}

/**
 * Load trusted baseline.
 * Priority: Database → local file (and seed DB from file when empty).
 */
async function loadManifest(): Promise<IntegrityManifest> {
  const fromDb = await loadManifestFromDb();

  if (fromDb) {
    return fromDb;
  }

  // Bootstrap from committed file, then persist to DB so it survives restarts
  const fromFile = loadManifestFromFile();

  try {
    await saveManifestToDb(fromFile);
  } catch (error) {
    console.error(
      "INTEGRITY: Could not seed baseline into database (will use file only):",
      error
    );
  }

  return fromFile;
}

// =====================================================
// Public Manifest Helpers
// =====================================================

export function getIntegrityManifestPath(): string {
  return MANIFEST_PATH;
}

export async function loadIntegrityManifest(): Promise<IntegrityManifest> {
  return loadManifest();
}

// =====================================================
// Integrity Check
// =====================================================

export async function checkIntegrity(): Promise<IntegritySummary> {
  // ---------------------------------------------------
  // Serverless / Vercel: skip full source file check
  // (source tree may not be fully available at runtime)
  // Still report total from the persistent baseline.
  // ---------------------------------------------------
  if (isServerlessEnvironment()) {
    let total = 0;

    try {
      const manifest = await loadManifest();
      total = manifest.files.length;
    } catch {
      // ignore
    }

    return {
      total,
      healthy: total,
      modified: 0,
      missing: 0,
      errors: 0,
      results: [],
      skipped: true,
      skipReason:
        "正式站（Serverless）不执行完整源文件校验，以本地 / CI 为准",
    };
  }

  // ---------------------------------------------------
  // Local / CI: full check against persistent baseline
  // ---------------------------------------------------
  const manifest = await loadManifest();

  const results: IntegrityResult[] = [];

  for (const entry of manifest.files) {
    try {
      const filePath = resolveSafeProjectPath(entry.path);

      if (!fs.existsSync(filePath)) {
        results.push({
          status: "MISSING",
          path: entry.path,
          expectedHash: entry.hash,
          actualHash: null,
          expectedSize: entry.size,
          actualSize: null,
        });
        continue;
      }

      const stat = fs.statSync(filePath);

      if (!stat.isFile()) {
        results.push({
          status: "ERROR",
          path: entry.path,
          expectedHash: entry.hash,
          actualHash: null,
          expectedSize: entry.size,
          actualSize: null,
        });
        continue;
      }

      const actualHash = calculateSha256(filePath);

      const status =
        actualHash === entry.hash.toLowerCase()
          ? "HEALTHY"
          : "MODIFIED";

      results.push({
        status,
        path: entry.path,
        expectedHash: entry.hash.toLowerCase(),
        actualHash,
        expectedSize: entry.size,
        actualSize: stat.size,
      });
    } catch {
      results.push({
        status: "ERROR",
        path: entry.path,
        expectedHash: entry.hash,
        actualHash: null,
        expectedSize: entry.size,
        actualSize: null,
      });
    }
  }

  return {
    total: results.length,
    healthy: results.filter((item) => item.status === "HEALTHY")
      .length,
    modified: results.filter((item) => item.status === "MODIFIED")
      .length,
    missing: results.filter((item) => item.status === "MISSING")
      .length,
    errors: results.filter((item) => item.status === "ERROR")
      .length,
    results,
  };
}

// =====================================================
// Create New Manifest From Current Files
// =====================================================

function createManifestFromCurrentFiles(
  currentManifest: IntegrityManifest
): IntegrityManifest {
  const files = currentManifest.files.map((entry) => {
    const filePath = resolveSafeProjectPath(entry.path);

    if (!fs.existsSync(filePath)) {
      throw new Error(
        `Cannot update trusted baseline because file is missing: ${entry.path}`
      );
    }

    const stat = fs.statSync(filePath);

    if (!stat.isFile()) {
      throw new Error(
        `Cannot update trusted baseline because path is not a file: ${entry.path}`
      );
    }

    return {
      path: entry.path,
      hash: calculateSha256(filePath),
      size: stat.size,
    };
  });

  return {
    version: 1,
    algorithm: "sha256",
    generatedAt: new Date().toISOString(),
    files,
  };
}

// =====================================================
// Update Trusted Integrity Baseline
// =====================================================

export async function updateIntegrityBaseline(): Promise<IntegrityBaselineUpdateResult> {
  // Full re-hash requires readable source files.
  // On pure serverless without source tree this will fail with a clear error.
  // Local / CI (and any environment where files exist) can always update.

  const currentManifest = await loadManifest();

  const currentIntegrity = await checkIntegrity();

  if (
    currentIntegrity.missing > 0 ||
    currentIntegrity.errors > 0
  ) {
    throw new Error(
      "Trusted baseline cannot be updated while files are missing or unreadable."
    );
  }

  // Local file backup (best-effort; may fail on read-only FS)
  let backupPath = "db:integrity_baseline";

  try {
    if (fs.existsSync(MANIFEST_PATH)) {
      const timestamp = new Date()
        .toISOString()
        .replace(/[:.]/g, "-");

      const backupDirectory = path.join(
        MANIFEST_BACKUP_ROOT,
        timestamp
      );

      fs.mkdirSync(backupDirectory, { recursive: true });

      backupPath = path.join(
        backupDirectory,
        "integrity-manifest.json"
      );

      fs.copyFileSync(MANIFEST_PATH, backupPath);
    }
  } catch (backupError) {
    console.warn(
      "INTEGRITY: Local file backup skipped:",
      backupError
    );
  }

  const updatedManifest =
    createManifestFromCurrentFiles(currentManifest);

  // 1) Persist to database (authoritative, survives restarts / new instances)
  await saveManifestToDb(updatedManifest);

  // 2) Also write local file when possible (keeps git/CI bootstrap in sync)
  try {
    writeManifestToFile(updatedManifest);
  } catch (fileError) {
    console.warn(
      "INTEGRITY: Local file write skipped (DB already updated):",
      fileError
    );
  }

  return {
    backupPath,
    generatedAt: updatedManifest.generatedAt,
    protectedFiles: updatedManifest.files.length,
  };
}