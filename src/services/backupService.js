import * as Application from "expo-application";
import * as DocumentPicker from "expo-document-picker";
import * as FileSystem from "expo-file-system/legacy";
import * as Sharing from "expo-sharing";
import { createBackupPayload, validateBackupPayload } from "../domain/backup";

export async function exportBackup(state) {
  const payload = createBackupPayload(state, Application.nativeApplicationVersion || "1.0.0");

  // Embed images as base64
  payload.data.images = await Promise.all(
    (payload.data.images || []).map(async (img) => {
      try {
        const uri = `${FileSystem.documentDirectory}${img.filename || img.uri.split('/').pop()}`;
        const base64 = await FileSystem.readAsStringAsync(uri, { encoding: FileSystem.EncodingType.Base64 });
        return { ...img, base64 };
      } catch (e) {
        return img;
      }
    })
  );

  const fileName = `docutrak-backup-${payload.manifest.createdAt.slice(0, 10)}.json`;
  const uri = `${FileSystem.cacheDirectory}${fileName}`;
  await FileSystem.writeAsStringAsync(uri, JSON.stringify(payload, null, 2));

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
  const content = await FileSystem.readAsStringAsync(asset.uri);
  const payload = JSON.parse(content);
  const error = validateBackupPayload(payload);
  if (error) {
    throw new Error(error);
  }

  // Write embedded images to the filesystem
  if (payload.data.images) {
    payload.data.images = await Promise.all(
      payload.data.images.map(async (img) => {
        if (img.base64) {
          try {
            const uri = `${FileSystem.documentDirectory}${img.filename || img.uri.split('/').pop()}`;
            await FileSystem.writeAsStringAsync(uri, img.base64, { encoding: FileSystem.EncodingType.Base64 });
          } catch (e) {
            console.warn('Failed to restore image', e);
          }
        }
        const { base64, ...rest } = img;
        return rest;
      })
    );
  }

  return payload;
}
