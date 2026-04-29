import * as Notifications from "expo-notifications";
import { Platform } from "react-native";
import { buildExpiryReport } from "../domain/documents";

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: false,
    shouldSetBadge: true
  })
});

export async function requestNotificationAccess() {
  const current = await Notifications.getPermissionsAsync();
  if (current.granted) {
    return true;
  }
  const next = await Notifications.requestPermissionsAsync();
  if (Platform.OS === "android") {
    await Notifications.setNotificationChannelAsync("expiry-alerts", {
      name: "Expiry alerts",
      importance: Notifications.AndroidImportance.DEFAULT
    });
  }
  return next.granted;
}

export async function scheduleExpiryNotifications(state) {
  const granted = await requestNotificationAccess();
  if (!granted) {
    return 0;
  }
  await Notifications.cancelAllScheduledNotificationsAsync();
  const report = buildExpiryReport(state);
  const alertDays = Number(state.profile.alertDays || 30);
  const promises = [];

  for (const item of report) {
    const expiryDate = new Date(`${item.expiryDate}T09:00:00`);
    const triggerDate = new Date(expiryDate);
    triggerDate.setDate(triggerDate.getDate() - alertDays);

    // Skip notifications whose trigger date is already in the past
    // (null trigger would fire immediately, spamming the user)
    if (triggerDate <= new Date()) {
      continue;
    }

    promises.push(Notifications.scheduleNotificationAsync({
      content: {
        title: "Document expiry reminder",
        body: `${item.documentType?.name || "Document"} for ${item.entity?.name || "entity"} expires on ${item.expiryDate}.`,
        data: {
          documentRecordId: item.id
        }
      },
      trigger: { type: "date", date: triggerDate, channelId: "expiry-alerts" }
    }));
  }

  await Promise.all(promises);
  return promises.length;
}
