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

const PROJECT_ROOT = process.cwd();

const TRUSTED_SOURCE =
  path.join(
    PROJECT_ROOT,
    "..",
    "cylg_trusted_repair_source_20260809_161420"
  );

const REPAIR_BACKUP_ROOT =
  path.join(
    PROJECT_ROOT,
    ".security",
    "repair-backups"
  );

// =====================================================
// Types
// =====================================================

export interface RepairResult {
  path: string;

  status:
    | "REPAIRED"
    | "SKIPPED"
    | "FAILED";

  reason: string;

  backupPath:
    | string
    | null;
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

function resolveProjectPath(
  relativePath: string
): string {
  const normalized =
    relativePath
      .replace(/\\/g, "/")
      .replace(/^\/+/, "");

  const resolved =
    path.resolve(
      PROJECT_ROOT,
      normalized
    );

  const rootWithSeparator =
    PROJECT_ROOT.endsWith(path.sep)
      ? PROJECT_ROOT
      : PROJECT_ROOT + path.sep;

  if (
    resolved !== PROJECT_ROOT &&
    !resolved.startsWith(
      rootWithSeparator
    )
  ) {
    throw new Error(
      `Unsafe project path: ${relativePath}`
    );
  }

  return resolved;
}

// =====================================================
// Trusted Source Resolver
// =====================================================

function resolveTrustedPath(
  relativePath: string
): string {
  const normalized =
    relativePath
      .replace(/\\/g, "/")
      .replace(/^\/+/, "");

  const resolved =
    path.resolve(
      TRUSTED_SOURCE,
      normalized
    );

  const rootWithSeparator =
    TRUSTED_SOURCE.endsWith(
      path.sep
    )
      ? TRUSTED_SOURCE
      : TRUSTED_SOURCE + path.sep;

  if (
    resolved !== TRUSTED_SOURCE &&
    !resolved.startsWith(
      rootWithSeparator
    )
  ) {
    throw new Error(
      `Unsafe trusted source path: ${relativePath}`
    );
  }

  return resolved;
}

// =====================================================
// Backup Current File
// =====================================================

function backupFile(
  sourcePath: string,
  relativePath: string,
  backupRoot: string
): string {
  const destination =
    path.join(
      backupRoot,
      relativePath
    );

  fs.mkdirSync(
    path.dirname(destination),
    {
      recursive: true,
    }
  );

  fs.copyFileSync(
    sourcePath,
    destination
  );

  return destination;
}

// =====================================================
// Repair One File
// =====================================================

function repairFile(
  item: IntegrityResult,
  backupRoot: string
): RepairResult {
  try {
    const currentPath =
      resolveProjectPath(
        item.path
      );

    const trustedPath =
      resolveTrustedPath(
        item.path
      );

    // =================================================
    // Trusted source must exist
    // =================================================

    if (
      !fs.existsSync(
        trustedPath
      )
    ) {
      return {
        path: item.path,

        status: "SKIPPED",

        reason:
          "Trusted repair source does not contain this file.",

        backupPath: null,
      };
    }

    const trustedStat =
      fs.statSync(
        trustedPath
      );

    if (
      !trustedStat.isFile()
    ) {
      return {
        path: item.path,

        status: "FAILED",

        reason:
          "Trusted repair source is not a file.",

        backupPath: null,
      };
    }

    // =================================================
    // Backup current file
    // =================================================

    let backupPath:
      | string
      | null = null;

    if (
      fs.existsSync(
        currentPath
      )
    ) {
      backupPath =
        backupFile(
          currentPath,
          item.path,
          backupRoot
        );
    }

    // =================================================
    // Ensure target directory
    // =================================================

    fs.mkdirSync(
      path.dirname(
        currentPath
      ),
      {
        recursive: true,
      }
    );

    // =================================================
    // Copy trusted file
    // =================================================

    fs.copyFileSync(
      trustedPath,
      currentPath
    );

    // =================================================
    // Verify repaired file
    // =================================================

    const manifest =
      loadIntegrityManifest();

    const manifestEntry =
      manifest.files.find(
        (entry) =>
          entry.path === item.path
      );

    if (!manifestEntry) {
      return {
        path: item.path,

        status: "FAILED",

        reason:
          "File is not present in the integrity manifest.",

        backupPath,
      };
    }

    const verification =
      checkIntegrity();

    const verified =
      verification.results.find(
        (result) =>
          result.path === item.path
      );

    if (
      !verified ||
      verified.status !==
        "HEALTHY"
    ) {
      return {
        path: item.path,

        status: "FAILED",

        reason:
          "Repair completed but SHA-256 verification failed.",

        backupPath,
      };
    }

    // =================================================
    // Success
    // =================================================

    return {
      path: item.path,

      status: "REPAIRED",

      reason:
        "File restored from trusted source and SHA-256 verification passed.",

      backupPath,
    };
  } catch (error) {
    return {
      path: item.path,

      status: "FAILED",

      reason:
        error instanceof Error
          ? error.message
          : "Unknown repair error.",

      backupPath: null,
    };
  }
}

// =====================================================
// Repair All Integrity Issues
// =====================================================

export function repairAllIntegrityIssues():
  RepairSummary {
  // ===================================================
  // Verify trusted source
  // ===================================================

  if (
    !fs.existsSync(
      TRUSTED_SOURCE
    )
  ) {
    throw new Error(
      `Trusted repair source not found: ${TRUSTED_SOURCE}`
    );
  }

  // ===================================================
  // Run integrity scan
  // ===================================================

  const integrity =
    checkIntegrity();

  const targets =
    integrity.results.filter(
      (item) =>
        item.status ===
          "MODIFIED" ||
        item.status ===
          "MISSING"
    );

  // ===================================================
  // Nothing to repair
  // ===================================================

  if (
    targets.length === 0
  ) {
    return {
      requested: 0,
      repaired: 0,
      skipped: 0,
      failed: 0,
      results: [],
    };
  }

  // ===================================================
  // Create timestamped backup
  // ===================================================

  const timestamp =
    new Date()
      .toISOString()
      .replace(
        /[:.]/g,
        "-"
      );

  const backupRoot =
    path.join(
      REPAIR_BACKUP_ROOT,
      timestamp
    );

  fs.mkdirSync(
    backupRoot,
    {
      recursive: true,
    }
  );

  // ===================================================
  // Repair files
  // ===================================================

  const results: RepairResult[] =
    [];

  for (
    const item of targets
  ) {
    results.push(
      repairFile(
        item,
        backupRoot
      )
    );
  }

  // ===================================================
  // Summary
  // ===================================================

  return {
    requested:
      targets.length,

    repaired:
      results.filter(
        (item) =>
          item.status ===
          "REPAIRED"
      ).length,

    skipped:
      results.filter(
        (item) =>
          item.status ===
          "SKIPPED"
      ).length,

    failed:
      results.filter(
        (item) =>
          item.status ===
          "FAILED"
      ).length,

    results,
  };
}
