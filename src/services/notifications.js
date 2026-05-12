import * as Notifications from "expo-notifications";
import { Platform } from "react-native";
import { formatDateInputValue } from "../domain/dates";

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: true
  })
});

export async function requestNotificationAccess() {
  if (Platform.OS === "android") {
    await Notifications.setNotificationChannelAsync("expiry-alerts", {
      name: "Expiry alerts",
      importance: Notifications.AndroidImportance.HIGH,
      vibrationPattern: [0, 250, 250, 250],
      lightColor: '#FF231F7C',
    });
  }

  const current = await Notifications.getPermissionsAsync();
  if (current.granted) return true;
  
  const next = await Notifications.requestPermissionsAsync();
  return next.granted;
}

export async function scheduleExpiryNotifications(state) {
  const granted = await requestNotificationAccess();
  if (!granted) return 0;
  
  await Notifications.cancelAllScheduledNotificationsAsync();
  
  const alertDays = Number(state.profile?.alertDays || 30);
  const activeRecords = state.documentRecords.filter(r => r.status === "Active");
  
  const notificationSchedule = new Map();

  function addSchedule(dateStr, record) {
    if (new Date(`${dateStr}T09:00:00`) <= new Date()) return;
    if (!notificationSchedule.has(dateStr)) notificationSchedule.set(dateStr, []);
    notificationSchedule.get(dateStr).push(record);
  }

  for (const record of activeRecords) {
    if (!record.expiryDate) continue;
    const expiryDate = new Date(`${record.expiryDate}T09:00:00`);
    if (Number.isNaN(expiryDate.getTime())) continue;

    // Schedule initial alert
    const alertDate = new Date(expiryDate);
    alertDate.setDate(alertDate.getDate() - alertDays);
    addSchedule(formatDateInputValue(alertDate), record);

    // Schedule 7-day recurring check
    if (alertDays > 7) {
      const weekDate = new Date(expiryDate);
      weekDate.setDate(weekDate.getDate() - 7);
      addSchedule(formatDateInputValue(weekDate), record);
    }

    // Schedule 1-day urgent check
    const eveDate = new Date(expiryDate);
    eveDate.setDate(eveDate.getDate() - 1);
    addSchedule(formatDateInputValue(eveDate), record);
  }

  const promises = [];
  const entityMap = new Map(state.entities.map(e => [e.id, e]));
  const typeMap = new Map(state.documentTypes.map(t => [t.id, t]));

  for (const [dateStr, records] of notificationSchedule.entries()) {
    const triggerDate = new Date(`${dateStr}T09:00:00`);
    const uniqueRecords = Array.from(new Set(records));
    
    let title = "";
    let body = "";
    
    if (uniqueRecords.length === 1) {
      const r = uniqueRecords[0];
      const eName = entityMap.get(r.entityId)?.name || "Entity";
      const tName = typeMap.get(r.documentTypeId)?.name || "Document";
      title = `Action required: ${tName}`;
      body = `${eName}'s ${tName} expires on ${r.expiryDate}. Tap to review.`;
    } else {
      title = `${uniqueRecords.length} documents expiring soon`;
      const first = uniqueRecords[0];
      const eName = entityMap.get(first.entityId)?.name || "Entity";
      const tName = typeMap.get(first.documentTypeId)?.name || "Document";
      body = `Including ${eName}'s ${tName} and ${uniqueRecords.length - 1} other${uniqueRecords.length > 2 ? 's' : ''}.`;
    }

    promises.push(Notifications.scheduleNotificationAsync({
      content: { 
        title, 
        body, 
        data: { screen: 'Dashboard' },
        sound: true,
      },
      trigger: { type: "date", date: triggerDate, channelId: "expiry-alerts" }
    }));
  }

  await Promise.all(promises);
  return promises.length;
}
