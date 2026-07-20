export interface BackupRecord {
  id: string;
  name: string;
  createdAt: Date;
  size: number;
}

const backups: BackupRecord[] = [];

function generateId() {
  return (
    Date.now().toString(36) +
    Math.random().toString(36).slice(2, 10)
  );
}

export function createBackup(
  name: string,
  size = 0
): BackupRecord {
  const backup: BackupRecord = {
    id: generateId(),
    name,
    createdAt: new Date(),
    size,
  };

  backups.unshift(backup);

  if (backups.length > 100) {
    backups.pop();
  }

  return backup;
}

export function getBackups(): BackupRecord[] {
  return [...backups];
}

export function getBackup(
  id: string
): BackupRecord | undefined {
  return backups.find(
    (backup) => backup.id === id
  );
}

export function deleteBackup(id: string) {
  const index = backups.findIndex(
    (backup) => backup.id === id
  );

  if (index >= 0) {
    backups.splice(index, 1);
    return true;
  }

  return false;
}

export function clearBackups() {
  backups.length = 0;
}