import path from "path";

export interface LocalFile {
  filename: string;
  filepath: string;
  url: string;
  size: number;
}

const UPLOAD_DIR =
  process.env.UPLOAD_DIR ??
  "public/uploads";

export function getUploadDirectory() {
  return path.resolve(
    process.cwd(),
    UPLOAD_DIR
  );
}

export function createLocalPath(
  filename: string
) {
  return path.join(
    getUploadDirectory(),
    filename
  );
}

export function createPublicUrl(
  filename: string
) {
  return `/uploads/${filename}`;
}

export function createFileInfo(
  filename: string,
  size: number
): LocalFile {
  return {
    filename,
    filepath:
      createLocalPath(filename),
    url:
      createPublicUrl(filename),
    size,
  };
}

export function isLocalStorage() {
  const provider =
    process.env.STORAGE_PROVIDER;

  return (
    !provider ||
    provider === "LOCAL"
  );
}