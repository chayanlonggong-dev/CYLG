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
  const manifest = loadManifest();

  const results: IntegrityResult[] = [];

  for (const entry of manifest.files) {
    try {
      const filePath =
        resolveSafeProjectPath(
          entry.path
        );

      // -----------------------------------------------
      // Missing
      // -----------------------------------------------

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

      // -----------------------------------------------
      // Stat
      // -----------------------------------------------

      const stat =
        fs.statSync(filePath);

      // -----------------------------------------------
      // Path is not a file
      // -----------------------------------------------

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

      // -----------------------------------------------
      // Calculate actual hash
      // -----------------------------------------------

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

    healthy:
      results.filter(
        (item) =>
          item.status === "HEALTHY"
      ).length,

    modified:
      results.filter(
        (item) =>
          item.status === "MODIFIED"
      ).length,

    missing:
      results.filter(
        (item) =>
          item.status === "MISSING"
      ).length,

    errors:
      results.filter(
        (item) =>
          item.status === "ERROR"
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

        // ---------------------------------------------
        // File must exist
        // ---------------------------------------------

        if (
          !fs.existsSync(filePath)
        ) {
          throw new Error(
            `Cannot update trusted baseline because file is missing: ${entry.path}`
          );
        }

        // ---------------------------------------------
        // File must be a regular file
        // ---------------------------------------------

        const stat =
          fs.statSync(filePath);

        if (!stat.isFile()) {
          throw new Error(
            `Cannot update trusted baseline because path is not a file: ${entry.path}`
          );
        }

        // ---------------------------------------------
        // Generate new SHA-256
        // ---------------------------------------------

        return {
          path: entry.path,
          hash:
            calculateSha256(
              filePath
            ),
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
  // ---------------------------------------------------
  // Load existing trusted manifest
  // ---------------------------------------------------

  const currentManifest =
    loadManifest();

  // ---------------------------------------------------
  // Inspect current project before changing baseline
  // ---------------------------------------------------

  const currentIntegrity =
    checkIntegrity();

  // ---------------------------------------------------
  // Never update baseline if files are missing
  // or unreadable.
  // ---------------------------------------------------

  if (
    currentIntegrity.missing > 0 ||
    currentIntegrity.errors > 0
  ) {
    throw new Error(
      "Trusted baseline cannot be updated while files are missing or unreadable."
    );
  }

  // ---------------------------------------------------
  // Manifest must exist
  // ---------------------------------------------------

  if (
    !fs.existsSync(
      MANIFEST_PATH
    )
  ) {
    throw new Error(
      "Integrity manifest not found."
    );
  }

  // ---------------------------------------------------
  // Create timestamped backup directory
  // ---------------------------------------------------

  const timestamp =
    new Date()
      .toISOString()
      .replace(
        /[:.]/g,
        "-"
      );

  const backupDirectory =
    path.join(
      MANIFEST_BACKUP_ROOT,
      timestamp
    );

  fs.mkdirSync(
    backupDirectory,
    {
      recursive: true,
    }
  );

  // ---------------------------------------------------
  // Backup current manifest
  // ---------------------------------------------------

  const backupPath =
    path.join(
      backupDirectory,
      "integrity-manifest.json"
    );

  fs.copyFileSync(
    MANIFEST_PATH,
    backupPath
  );

  // ---------------------------------------------------
  // Generate and write new baseline
  // ---------------------------------------------------

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

    // -------------------------------------------------
    // Return update result
    // -------------------------------------------------

    return {
      backupPath,
      generatedAt:
        updatedManifest.generatedAt,
      protectedFiles:
        updatedManifest.files.length,
    };
  } catch (error) {
    // -------------------------------------------------
    // Roll back to previous manifest if anything fails
    // -------------------------------------------------

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