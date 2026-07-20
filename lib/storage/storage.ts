export type StorageType =
  | "LOCAL"
  | "R2"
  | "S3";

export interface StorageFile {
  id: string;
  filename: string;
  path: string;
  url: string;
  type: StorageType;
  size: number;
  createdAt: Date;
}

const files: StorageFile[] = [];

function generateId() {
  return (
    Date.now().toString(36) +
    Math.random()
      .toString(36)
      .slice(2, 10)
  );
}

export function saveFile(
  data: Omit<
    StorageFile,
    "id" | "createdAt"
  >
) {
  const file: StorageFile = {
    id: generateId(),
    createdAt: new Date(),
    ...data,
  };

  files.unshift(file);

  return file;
}

export function getFile(
  id: string
) {
  return (
    files.find(
      (file) =>
        file.id === id
    ) ?? null
  );
}

export function getFiles() {
  return [...files];
}

export function deleteFile(
  id: string
) {
  const index =
    files.findIndex(
      (file) =>
        file.id === id
    );

  if (index === -1) {
    return false;
  }

  files.splice(index, 1);

  return true;
}

export function getStorageType(): StorageType {
  const provider =
    process.env
      .STORAGE_PROVIDER;

  if (
    provider === "R2" ||
    provider === "S3"
  ) {
    return provider;
  }

  return "LOCAL";
}

export function generateStoragePath(
  folder: string,
  filename: string
) {
  return `${folder}/${Date.now()}-${filename}`;
}

export function clearStorage() {
  files.length = 0;
}