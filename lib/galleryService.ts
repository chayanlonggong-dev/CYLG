import { uploadFile } from "./uploadService";

export async function uploadGallery(files: File[]) {
  const results = [];

  for (const file of files) {
    const uploaded = await uploadFile(file);
    results.push(uploaded);
  }

  return results;
}