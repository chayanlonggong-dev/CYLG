export function getFileExtension(
  filename: string
) {
  const parts = filename.split(".");

  if (parts.length <= 1) {
    return "";
  }

  return parts.pop()?.toLowerCase() ?? "";
}

export function getFileName(
  filename: string
) {
  return filename.replace(
    /\.[^/.]+$/,
    ""
  );
}

export function isImageFile(
  mimeType: string
) {
  return [
    "image/jpeg",
    "image/png",
    "image/webp",
    "image/gif",
  ].includes(mimeType);
}

export function isVideoFile(
  mimeType: string
) {
  return [
    "video/mp4",
    "video/webm",
    "video/quicktime",
  ].includes(mimeType);
}

export function isAllowedFile(
  mimeType: string,
  allowedTypes: string[]
) {
  return allowedTypes.includes(mimeType);
}

export function generateFileName(
  originalName: string
) {
  const extension =
    getFileExtension(originalName);

  const timestamp =
    Date.now().toString();

  return extension
    ? `${timestamp}.${extension}`
    : timestamp;
}

export function sanitizeFileName(
  filename: string
) {
  return filename
    .replace(/[^a-zA-Z0-9._-]/g, "")
    .trim();
}

export function getFileSizeInMB(
  bytes: number
) {
  return bytes / (1024 * 1024);
}