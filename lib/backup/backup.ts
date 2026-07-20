export type BackupType =
  | "DATABASE"
  | "SETTINGS"
  | "MODELS"
  | "FULL";

export interface BackupRecord {
  id: string;
  type: BackupType;
  filename: string;
  size: number;
  createdAt: Date;
  status: "SUCCESS" | "FAILED";
  error?: string;
}

const backups: BackupRecord[] = [];

function generateId() {
  return (
    Date.now().toString(36) +
    Math.random()
      .toString(36)
      .slice(2, 10)
  );
}

export function createBackupRecord(
  data: Omit<
    BackupRecord,
    "id" | "createdAt"
  >
) {
  const backup: BackupRecord = {
    id: generateId(),
    createdAt: new Date(),
    ...data,
  };

  backups.unshift(backup);

  return backup;
}

export function getBackups() {
  return [...backups];
}

export function getBackupById(
  id: string
) {
  return (
    backups.find(
      (backup) =>
        backup.id === id
    ) ?? null
  );
}

export function deleteBackup(
  id: string
) {
  const index =
    backups.findIndex(
      (backup) =>
        backup.id === id
    );

  if (index === -1) {
    return false;
  }

  backups.splice(index, 1);

  return true;
}

export async function runBackup(
  type: BackupType
) {
  try {
    const filename =
      `backup-${type.toLowerCase()}-${Date.now()}.json`;

    const record =
      createBackupRecord({
        type,
        filename,
        size: 0,
        status: "SUCCESS",
      });

    return record;

  } catch (error) {
    return createBackupRecord({
      type,
      filename: "",
      size: 0,
      status: "FAILED",
      error:
        error instanceof Error
          ? error.message
          : String(error),
    });
  }
}

export function clearBackups() {
  backups.length = 0;
}