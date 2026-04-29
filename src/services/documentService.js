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

export async function performDocumentDeletion(recordId, state) {
  const record = state.documentRecords.find(r => r.id === recordId);
  let nextImages = state.images;

  if (record && record.imageIds && record.imageIds.length > 0) {
    await deleteDocumentImages(record.imageIds, state.images);
    nextImages = state.images.filter(img => !record.imageIds.includes(img.id));
  }

  return {
    ...state,
    documentRecords: state.documentRecords.map(r => r.id === recordId ? { ...r, status: "In-Active" } : r),
    images: nextImages,
  };
}
