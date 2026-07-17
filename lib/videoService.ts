import { uploadFile } from "./uploadService";

export async function uploadVideos(files: File[]) {
  const results = [];

  for (const file of files) {
    const uploaded = await uploadFile(file);
    results.push(uploaded);
  }

  return results;
}