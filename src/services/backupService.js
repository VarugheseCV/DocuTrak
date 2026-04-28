import * as Application from "expo-application";
import * as DocumentPicker from "expo-document-picker";
import * as FileSystem from "expo-file-system/legacy";
import * as Sharing from "expo-sharing";
import { createBackupPayload, validateBackupPayload } from "../domain/backup";

export async function exportBackup(state) {
  const payload = createBackupPayload(state, Application.nativeApplicationVersion || "1.0.0");
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
  return payload;
}
