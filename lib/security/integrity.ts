import fs from "fs";
import path from "path";
import crypto from "crypto";

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
    process.env.NODE_ENV === "production" &&
      !!process.env.VERCEL_ENV
  );
}

// =====================================================
// Safe Project Path Resolver
// =====================================================

function resolveSafeProjectPath(
  relativePath: string
): string {
  const normalized = relativePath
    .replace(/\\/g, "/")
    .replace(/^\/+/, "");

  const resolved = path.resolve(
    PROJECT_ROOT,
    normalized
  );

  const rootWithSeparator =
    PROJECT_ROOT.endsWith(path.sep)
      ? PROJECT_ROOT
      : PROJECT_ROOT + path.sep;

  if (
    resolved !== PROJECT_ROOT &&
    !resolved.startsWith(rootWithSeparator)
  ) {
    throw new Error(
      `Unsafe integrity path: ${relativePath}`
    );
  }

  return resolved;
}

// =====================================================
// SHA-256
// =====================================================

function calculateSha256(
  filePath: string
): string {
  const data = fs.readFileSync(filePath);

  return crypto
    .createHash("sha256")
    .update(data)
    .digest("hex")
    .toLowerCase();
}

// =====================================================
// Load Manifest
// =====================================================

function loadManifest(): IntegrityManifest {
  if (!fs.existsSync(MANIFEST_PATH)) {
    throw new Error(
      "Integrity manifest not found."
    );
  }

  const raw =
    fs.readFileSync(
      MANIFEST_PATH,
      "utf8"
    );

  const manifest =
    JSON.parse(raw) as IntegrityManifest;

  if (
    !manifest ||
    manifest.version !== 1 ||
    manifest.algorithm !== "sha256" ||
    !Array.isArray(manifest.files)
  ) {
    throw new Error(
      "Invalid integrity manifest."
    );
  }

  return manifest;
}

// =====================================================
// Public Manifest Helpers
// =====================================================

export function getIntegrityManifestPath(): string {
  return MANIFEST_PATH;
}

export function loadIntegrityManifest(): IntegrityManifest {
  return loadManifest();
}

// =====================================================
// Integrity Check
// =====================================================

export function checkIntegrity(): IntegritySummary {
  // ---------------------------------------------------
  // Serverless / Vercel: skip full source file check
  // ---------------------------------------------------
  if (isServerlessEnvironment()) {
    let total = 0;

    try {
      const manifest = loadManifest();
      total = manifest.files.length;
    } catch {
      // manifest 读不到也不影响跳过逻辑
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
  // Local / CI: full check
  // ---------------------------------------------------
  const manifest = loadManifest();

  const results: IntegrityResult[] = [];

  for (const entry of manifest.files) {
    try {
      const filePath =
        resolveSafeProjectPath(
          entry.path
        );

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

      const actualHash =
        calculateSha256(filePath);

      const status =
        actualHash ===
        entry.hash.toLowerCase()
          ? "HEALTHY"
          : "MODIFIED";

      results.push({
        status,
        path: entry.path,
        expectedHash:
          entry.hash.toLowerCase(),
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
    healthy: results.filter(
      (item) => item.status === "HEALTHY"
    ).length,
    modified: results.filter(
      (item) => item.status === "MODIFIED"
    ).length,
    missing: results.filter(
      (item) => item.status === "MISSING"
    ).length,
    errors: results.filter(
      (item) => item.status === "ERROR"
    ).length,
    results,
  };
}

// =====================================================
// Create New Manifest From Current Files
// =====================================================

function createManifestFromCurrentFiles(
  currentManifest: IntegrityManifest
): IntegrityManifest {
  const files =
    currentManifest.files.map(
      (entry) => {
        const filePath =
          resolveSafeProjectPath(
            entry.path
          );

        if (!fs.existsSync(filePath)) {
          throw new Error(
            `Cannot update trusted baseline because file is missing: ${entry.path}`
          );
        }

        const stat =
          fs.statSync(filePath);

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
      }
    );

  return {
    version: 1,
    algorithm: "sha256",
    generatedAt:
      new Date().toISOString(),
    files,
  };
}

// =====================================================
// Update Trusted Integrity Baseline
// =====================================================

export function updateIntegrityBaseline():
  IntegrityBaselineUpdateResult {
  // 正式站禁止更新基准
  if (isServerlessEnvironment()) {
    throw new Error(
      "Trusted baseline cannot be updated in Serverless / production environment. Please update baseline on local development environment and deploy via Git."
    );
  }

  const currentManifest =
    loadManifest();

  const currentIntegrity =
    checkIntegrity();

  if (
    currentIntegrity.missing > 0 ||
    currentIntegrity.errors > 0
  ) {
    throw new Error(
      "Trusted baseline cannot be updated while files are missing or unreadable."
    );
  }

  if (!fs.existsSync(MANIFEST_PATH)) {
    throw new Error(
      "Integrity manifest not found."
    );
  }

  const timestamp =
    new Date()
      .toISOString()
      .replace(/[:.]/g, "-");

  const backupDirectory =
    path.join(
      MANIFEST_BACKUP_ROOT,
      timestamp
    );

  fs.mkdirSync(backupDirectory, {
    recursive: true,
  });

  const backupPath =
    path.join(
      backupDirectory,
      "integrity-manifest.json"
    );

  fs.copyFileSync(
    MANIFEST_PATH,
    backupPath
  );

  try {
    const updatedManifest =
      createManifestFromCurrentFiles(
        currentManifest
      );

    fs.writeFileSync(
      MANIFEST_PATH,
      JSON.stringify(
        updatedManifest,
        null,
        2
      ) + "\n",
      "utf8"
    );

    return {
      backupPath,
      generatedAt:
        updatedManifest.generatedAt,
      protectedFiles:
        updatedManifest.files.length,
    };
  } catch (error) {
    try {
      fs.copyFileSync(
        backupPath,
        MANIFEST_PATH
      );
    } catch (rollbackError) {
      console.error(
        "INTEGRITY MANIFEST ROLLBACK FAILED:",
        rollbackError
      );
    }

    throw error;
  }
}