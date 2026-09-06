import fs from "fs";
import path from "path";

import {
  checkIntegrity,
  loadIntegrityManifest,
  IntegrityResult,
} from "@/lib/security/integrity";

// =====================================================
// Repair Configuration
// =====================================================

const PROJECT_ROOT = /*turbopackIgnore: true*/ process.cwd();

// Keep trusted source INSIDE the project root.
const TRUSTED_SOURCE = path.join(
  PROJECT_ROOT,
  ".security",
  "trusted-repair-source"
);

const REPAIR_BACKUP_ROOT = path.join(
  PROJECT_ROOT,
  ".security",
  "repair-backups"
);

// =====================================================
// Types
// =====================================================

export interface RepairResult {
  path: string;
  status: "REPAIRED" | "SKIPPED" | "FAILED";
  reason: string;
  backupPath: string | null;
}

export interface RepairSummary {
  requested: number;
  repaired: number;
  skipped: number;
  failed: number;
  results: RepairResult[];
}

// =====================================================
// Safe Path Resolver
// =====================================================

function resolveProjectPath(relativePath: string): string {
  const normalized = relativePath
    .replace(/\\/g, "/")
    .replace(/^\/+/, "");

  if (
    normalized === ".." ||
    normalized.startsWith("../") ||
    normalized.includes("/../")
  ) {
    throw new Error(`Unsafe project path: ${relativePath}`);
  }

  const resolved = path.resolve(PROJECT_ROOT, normalized);

  const rootWithSeparator = PROJECT_ROOT.endsWith(path.sep)
    ? PROJECT_ROOT
    : PROJECT_ROOT + path.sep;

  if (resolved !== PROJECT_ROOT && !resolved.startsWith(rootWithSeparator)) {
    throw new Error(`Unsafe project path: ${relativePath}`);
  }

  return resolved;
}

// =====================================================
// Trusted Source Resolver
// =====================================================

function resolveTrustedPath(relativePath: string): string {
  const normalized = relativePath
    .replace(/\\/g, "/")
    .replace(/^\/+/, "");

  if (
    normalized === ".." ||
    normalized.startsWith("../") ||
    normalized.includes("/../")
  ) {
    throw new Error(`Unsafe trusted source path: ${relativePath}`);
  }

  const resolved = path.resolve(TRUSTED_SOURCE, normalized);

  const rootWithSeparator = TRUSTED_SOURCE.endsWith(path.sep)
    ? TRUSTED_SOURCE
    : TRUSTED_SOURCE + path.sep;

  if (resolved !== TRUSTED_SOURCE && !resolved.startsWith(rootWithSeparator)) {
    throw new Error(`Unsafe trusted source path: ${relativePath}`);
  }

  return resolved;
}

function ensureParentDirectory(filePath: string): void {
  const directory = path.dirname(filePath);
  fs.mkdirSync(directory, { recursive: true });
}

function backupCurrentFile(
  relativePath: string,
  backupRoot: string
): string | null {
  const sourcePath = resolveProjectPath(relativePath);

  if (!fs.existsSync(sourcePath)) {
    return null;
  }

  const backupPath = path.join(backupRoot, relativePath);
  ensureParentDirectory(backupPath);
  fs.copyFileSync(sourcePath, backupPath);

  return backupPath;
}

async function repairFile(
  item: IntegrityResult,
  backupRoot: string
): Promise<RepairResult> {
  try {
    const relativePath = item.path;
    const trustedPath = resolveTrustedPath(relativePath);

    if (!fs.existsSync(trustedPath)) {
      return {
        path: relativePath,
        status: "FAILED",
        reason: "Trusted source file not found.",
        backupPath: null,
      };
    }

    const trustedStat = fs.statSync(trustedPath);

    if (!trustedStat.isFile()) {
      return {
        path: relativePath,
        status: "FAILED",
        reason: "Trusted source path is not a file.",
        backupPath: null,
      };
    }

    const targetPath = resolveProjectPath(relativePath);

    let backupPath: string | null = null;

    if (fs.existsSync(targetPath)) {
      backupPath = backupCurrentFile(relativePath, backupRoot);
    }

    ensureParentDirectory(targetPath);
    fs.copyFileSync(trustedPath, targetPath);

    return {
      path: relativePath,
      status: "REPAIRED",
      reason: "File restored from trusted source.",
      backupPath,
    };
  } catch (error) {
    return {
      path: item.path,
      status: "FAILED",
      reason:
        error instanceof Error ? error.message : "Unknown repair error.",
      backupPath: null,
    };
  }
}

export async function repairAllIntegrityIssues(): Promise<RepairSummary> {
  if (!fs.existsSync(TRUSTED_SOURCE)) {
    throw new Error(
      `Trusted repair source not found: ${TRUSTED_SOURCE}`
    );
  }

  const integrity = await checkIntegrity();

  const targets = integrity.results.filter(
    (item) => item.status === "MODIFIED" || item.status === "MISSING"
  );

  if (targets.length === 0) {
    return {
      requested: 0,
      repaired: 0,
      skipped: 0,
      failed: 0,
      results: [],
    };
  }

  const timestamp = new Date().toISOString().replace(/[:.]/g, "-");
  const backupRoot = path.join(REPAIR_BACKUP_ROOT, timestamp);

  fs.mkdirSync(backupRoot, { recursive: true });

  const results: RepairResult[] = [];

  for (const item of targets) {
    results.push(await repairFile(item, backupRoot));
  }

  return {
    requested: targets.length,
    repaired: results.filter((item) => item.status === "REPAIRED").length,
    skipped: results.filter((item) => item.status === "SKIPPED").length,
    failed: results.filter((item) => item.status === "FAILED").length,
    results,
  };
}