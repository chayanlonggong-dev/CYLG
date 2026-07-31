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

export function getFileExtension(
  filename: string
) {
  const normalizedName =
    filename.toLowerCase();
  const lastDotIndex =
    normalizedName.lastIndexOf(".");

  if (lastDotIndex === -1) {
    return "";
  }

  return normalizedName.slice(
    lastDotIndex + 1
  );
}

export function sanitizeUploadFilename(
  filename: string
) {
  const trimmed =
    filename.trim();

  const withoutSeparators =
    trimmed
      .replace(/[\\/]+/g, "-")
      .replace(/\s+/g, "-")
      .replace(/[^a-zA-Z0-9._-]+/g, "-");

  const collapsed =
    withoutSeparators
      .replace(/-+/g, "-")
      .replace(/\.+/g, ".");

  const withoutLeadingDots =
    collapsed.replace(/^\.+/, "");

  const withoutTrailingDots =
    withoutLeadingDots.replace(/\.+$/g, "");

  const baseName =
    withoutTrailingDots || "upload";

  return baseName;
}

export function hasUnsafePathTraversal(
  filename: string
) {
  const normalized =
    filename.replace(/\\/g, "/");

  if (
    normalized.includes("../") ||
    normalized.includes("..\\") ||
    normalized.startsWith("/") ||
    normalized.startsWith("\\") ||
    normalized.includes("%2e%2e") ||
    normalized.includes("%2f") ||
    normalized.includes("%5c")
  ) {
    return true;
  }

  return false;
}

export function isDangerousFile(
  filename: string,
  mimeType: string,
  allowedMimeTypes: string[]
) {
  const extension = getFileExtension(
    filename
  );

  const dangerousExtensions = [
    "exe",
    "php",
    "js",
    "svg",
    "bat",
    "cmd",
    "ps1",
  ];

  if (
    dangerousExtensions.includes(
      extension
    )
  ) {
    return true;
  }

  if (
    !allowedMimeTypes.includes(mimeType)
  ) {
    return true;
  }

  return false;
}

export function isAllowedMimeType(
  mimeType: string,
  allowedMimeTypes: string[]
) {
  return allowedMimeTypes.includes(
    mimeType
  );
}

export function isAllowedExtension(
  filename: string,
  allowedExtensions: string[]
) {
  const extension = getFileExtension(
    filename
  );

  return allowedExtensions.includes(
    extension
  );
}

export function createUploadErrorResponse(
  message: string
) {
  return {
    success: false,
    message,
  };
}

export function logUploadEvent({
  uploadType,
  filename,
  size,
  success,
}: {
  uploadType: string;
  filename: string;
  size: number;
  success: boolean;
}) {
  console.info(
    JSON.stringify({
      event: "upload",
      uploadType,
      filename,
      size,
      success,
      timestamp: new Date().toISOString(),
    })
  );
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