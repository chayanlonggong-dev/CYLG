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

const PROJECT_ROOT = process.cwd();

const MANIFEST_PATH = path.join(
  PROJECT_ROOT,
  ".security",
  "integrity-manifest.json"
);

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

export function getIntegrityManifestPath(): string {
  return MANIFEST_PATH;
}

export function loadIntegrityManifest(): IntegrityManifest {
  return loadManifest();
}

export function checkIntegrity(): IntegritySummary {
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

      const stat =
        fs.statSync(filePath);

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
