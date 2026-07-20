export interface CloudStorageConfig {
  provider:
    | "R2"
    | "S3";

  bucket?: string;

  endpoint?: string;

  region?: string;
}

export interface CloudUploadResult {
  key: string;

  url: string;

  size: number;
}


export function getCloudConfig(): CloudStorageConfig {
  const provider =
    process.env.STORAGE_PROVIDER === "S3"
      ? "S3"
      : "R2";

  return {
    provider,

    bucket:
      process.env.STORAGE_BUCKET,

    endpoint:
      process.env.STORAGE_ENDPOINT,

    region:
      process.env.STORAGE_REGION,
  };
}


export async function uploadToCloud(
  file: Buffer,
  filename: string
): Promise<CloudUploadResult> {

  /*
    Cloud storage adapter.

    Production:
    - Cloudflare R2
    - AWS S3

    will be connected here.
  */

  const config =
    getCloudConfig();


  const key =
    `uploads/${Date.now()}-${filename}`;


  return {
    key,

    url:
      `${config.endpoint ?? ""}/${key}`,

    size:
      file.length,
  };
}


export async function deleteFromCloud(
  key: string
) {
  /*
    Production delete logic
    will be implemented here.
  */

  return {
    success: true,
    key,
  };
}


export function isCloudStorage() {
  const provider =
    process.env.STORAGE_PROVIDER;

  return (
    provider === "R2" ||
    provider === "S3"
  );
}