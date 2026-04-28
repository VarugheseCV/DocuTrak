import * as Application from "expo-application";
import * as DocumentPicker from "expo-document-picker";
import * as FileSystem from "expo-file-system/legacy";
import * as Sharing from "expo-sharing";
import { createBackupPayload, validateBackupPayload } from "../domain/backup";

export async function exportBackup(state) {
  const payload = createBackupPayload(state, Application.nativeApplicationVersion || "1.0.0");
  
  // Package images into the payload as base64
  const imagesWithData = [];
  for (const img of payload.data.images) {
    try {
      const base64 = await FileSystem.readAsStringAsync(img.uri, { encoding: FileSystem.EncodingType.Base64 });
      imagesWithData.push({ ...img, base64 });
    } catch (e) {
      imagesWithData.push(img);
    }
  }
  payload.data.images = imagesWithData;

  const fileName = `docutrak-backup-${payload.manifest.createdAt.slice(0, 10)}.json`;
  const uri = `${FileSystem.cacheDirectory}${fileName}`;
  await FileSystem.writeAsStringAsync(uri, JSON.stringify(payload), { encoding: FileSystem.EncodingType.UTF8 });

  if (await Sharing.isAvailableAsync()) {
    await Sharing.shareAsync(uri, {
      mimeType: "application/json",
      dialogTitle: "Save DocuTrak backup to Google Drive"
    });
  }
  return {
    uri,
    manifest: payload.manifest
  };
}

export async function importBackup() {
  const picked = await DocumentPicker.getDocumentAsync({
    type: "application/json",
    copyToCacheDirectory: true
  });
  if (picked.canceled) {
    return null;
  }
  const asset = picked.assets[0];
  const content = await FileSystem.readAsStringAsync(asset.uri, { encoding: FileSystem.EncodingType.UTF8 });
  let payload;
  try {
    payload = JSON.parse(content);
  } catch (e) {
    throw new Error("Invalid backup file: Not a valid JSON document.");
  }
  const error = validateBackupPayload(payload);
  if (error) {
    throw new Error(error);
  }
  
  // Restore images from base64 data to local file system
  const restoredImages = [];
  for (const img of payload.data.images) {
    if (img.base64) {
      const ext = img.originalName ? img.originalName.split('.').pop() : 'jpg';
      const newUri = `${FileSystem.documentDirectory}${img.id}.${ext}`;
      await FileSystem.writeAsStringAsync(newUri, img.base64, { encoding: FileSystem.EncodingType.Base64 });
      const { base64, ...restImg } = img;
      restoredImages.push({ ...restImg, uri: newUri });
    } else {
      restoredImages.push(img);
    }
  }
  payload.data.images = restoredImages;

  return payload;
}
