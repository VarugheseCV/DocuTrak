import * as FileSystem from "expo-file-system/legacy";

export async function deleteDocumentImages(imageIds, imagesState) {
  if (!imageIds || imageIds.length === 0) return;
  const imagesToDelete = imagesState.filter(img => imageIds.includes(img.id));
  await Promise.all(imagesToDelete.map(async (img) => {
    try {
      const info = await FileSystem.getInfoAsync(img.uri);
      if (info.exists) await FileSystem.deleteAsync(img.uri, { idempotent: true });
    } catch (_) { /* ignore */ }
  }));
}
