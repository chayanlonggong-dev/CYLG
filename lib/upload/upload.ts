export type UploadType =
  | "IMAGE"
  | "VIDEO";

export interface UploadFile {
  id: string;
  filename: string;
  path: string;
  type: UploadType;
  size: number;
  createdAt: Date;
}

const uploads: UploadFile[] = [];

function generateId() {
  return (
    Date.now().toString(36) +
    Math.random()
      .toString(36)
      .slice(2, 10)
  );
}

export function createUploadRecord(
  data: Omit<
    UploadFile,
    "id" | "createdAt"
  >
) {
  const record: UploadFile = {
    id: generateId(),
    createdAt: new Date(),
    ...data,
  };

  uploads.unshift(record);

  return record;
}

export function getUploads() {
  return [...uploads];
}

export function getUploadById(
  id: string
) {
  return (
    uploads.find(
      (item) =>
        item.id === id
    ) ?? null
  );
}

export function deleteUpload(
  id: string
) {
  const index =
    uploads.findIndex(
      (item) =>
        item.id === id
    );

  if (index === -1) {
    return false;
  }

  uploads.splice(index, 1);

  return true;
}

export function validateUploadSize(
  size: number,
  maxSize: number
) {
  return size <= maxSize;
}

export function validateUploadType(
  type: string,
  allowedTypes: string[]
) {
  return allowedTypes.includes(type);
}

export function clearUploads() {
  uploads.length = 0;
}