import { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert, Switch, Modal, TextInput } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as LocalAuthentication from 'expo-local-authentication';
import { useAppState, useAppNavigation } from '../context/AppContext';
import { ROUTES } from '../navigation/routes';

export default function SettingsScreen() {
  const { state, commit, colors } = useAppState();
  const navigate = useAppNavigation();
  const [isBiometricSupported, setIsBiometricSupported] = useState(false);
  const profile = state.profile || {};
  const [editModal, setEditModal] = useState({ visible: false, field: '', value: '' });

  useEffect(() => {
    LocalAuthentication.hasHardwareAsync().then(setIsBiometricSupported);
  }, []);

  async function handleBackup() {
    try {
      const result = await exportBackup(state);
      Alert.alert("Backup successful", "Your data was backed up.");
      await commit({ ...state, lastBackupAt: new Date().toLocaleString() });
    } catch (e) { Alert.alert("Backup failed", e.message); }
  }

  async function handleRestore() {
    try {
      // Mock restore for UI demonstration
      Alert.alert("Restore backup?", "This will replace all your current local data.", [
        { text: "Cancel", style: "cancel" },
        { text: "Restore", style: "destructive", onPress: () => { Alert.alert("Restored", "Data restored successfully."); } },
      ]);
    } catch (e) { Alert.alert("Restore failed", e.message); }
  }

  async function toggleAppLock(value) {
    if (value) {
      const auth = await LocalAuthentication.authenticateAsync({ promptMessage: 'Authenticate to enable App Lock' });
      if (auth.success) commit({ ...state, profile: { ...profile, appLockEnabled: true } });
      else Alert.alert("Authentication failed", "Could not enable App Lock.");
    } else {
      commit({ ...state, profile: { ...profile, appLockEnabled: false } });
    }
  }

  function openEditModal(field, currentValue) {
    setEditModal({ visible: true, field, value: currentValue || '' });
  }

  function saveEditModal() {
    const { field, value } = editModal;
    commit({ ...state, profile: { ...profile, [field.toLowerCase()]: value.trim() } });
    setEditModal({ visible: false, field: '', value: '' });
  }

  function adjustAlertDays(delta) {
    const next = Math.max(1, Math.min(365, Number(profile.alertDays || 30) + delta));
    commit({ ...state, profile: { ...profile, alertDays: next } });
  }

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <TouchableOpacity onPress={() => navigate(ROUTES.DASHBOARD)} style={[styles.backButton, { backgroundColor: colors.surfaceElevated }]}>
            <Ionicons name="arrow-back" size={24} color={colors.text} />
          </TouchableOpacity>
          <Text style={[styles.title, { color: colors.text }]}>Settings</Text>
        </View>
      </View>

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        {/* SECURITY */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.textMuted }]}>Security (Critical)</Text>
          <View style={[styles.listItem, { backgroundColor: colors.surfaceElevated, borderColor: colors.border }]}>
            <View style={styles.itemLeft}>
              <Ionicons name="lock-closed" size={24} color={colors.primary} />
              <Text style={[styles.itemName, { color: colors.text }]}>App Lock (Biometrics/PIN)</Text>
            </View>
            <Switch value={!!profile.appLockEnabled} onValueChange={toggleAppLock} trackColor={{ false: colors.border, true: colors.primary }} thumbColor={colors.text} />
          </View>
        </View>

        {/* GENERAL */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.textMuted }]}>General</Text>
          <View style={[styles.listItemStacked, { backgroundColor: colors.surfaceElevated, borderColor: colors.border }]}>
            <View style={[styles.itemLeft, { justifyContent: 'space-between', flex: 1 }]}>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 14 }}>
                <Ionicons name="notifications" size={24} color={colors.primary} />
                <Text style={[styles.itemName, { color: colors.text }]}>Alert Days</Text>
              </View>
              <View style={styles.alertDaysControls}>
                <TouchableOpacity style={[styles.alertDaysBtn, { backgroundColor: colors.primary }]} onPress={() => adjustAlertDays(-5)}>
                  <Ionicons name="remove" size={20} color={colors.text} />
                </TouchableOpacity>
                <Text style={[styles.alertDaysValue, { color: colors.text }]}>{profile.alertDays || 30}</Text>
                <TouchableOpacity style={[styles.alertDaysBtn, { backgroundColor: colors.primary }]} onPress={() => adjustAlertDays(5)}>
                  <Ionicons name="add" size={20} color={colors.text} />
                </TouchableOpacity>
              </View>
            </View>
            <Text style={[styles.itemSub, { color: colors.textMuted }]}>You will be notified {profile.alertDays || 30} days before a document expires.</Text>
          </View>

          <View style={[styles.listItem, { backgroundColor: colors.surfaceElevated, borderColor: colors.border }]}>
            <View style={styles.itemLeft}>
              <Ionicons name="globe" size={24} color={colors.primary} />
              <Text style={[styles.itemName, { color: colors.text }]}>Language</Text>
            </View>
            <View style={styles.itemRight}>
              <Text style={[styles.itemValue, { color: colors.textMuted }]}>{profile.language || "English"}</Text>
              <Ionicons name="chevron-forward" size={20} color={colors.textMuted} />
            </View>
          </View>
        </View>

        {/* PROFILE FIELDS */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.textMuted }]}>Profile Setup</Text>
          {['Profession', 'Country', 'Area'].map(field => (
            <TouchableOpacity key={field} style={[styles.listItem, { backgroundColor: colors.surfaceElevated, borderColor: colors.border }]} onPress={() => openEditModal(field, profile[field.toLowerCase()])}>
              <View style={styles.itemLeft}>
                <Ionicons name="person-circle-outline" size={24} color={colors.primary} />
                <Text style={[styles.itemName, { color: colors.text }]}>{field}</Text>
              </View>
              <View style={styles.itemRight}>
                <Text style={[styles.itemValue, { color: colors.textMuted }]}>{profile[field.toLowerCase()] || "Not set"}</Text>
                <Ionicons name="chevron-forward" size={20} color={colors.textMuted} />
              </View>
            </TouchableOpacity>
          ))}
        </View>

        {/* DATA MANAGEMENT */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.textMuted }]}>Data Management</Text>
          <TouchableOpacity style={[styles.listItemStacked, { backgroundColor: colors.surfaceElevated, borderColor: colors.border }]} onPress={handleBackup}>
            <View style={styles.itemLeft}>
              <Ionicons name="cloud-upload" size={24} color={colors.primary} />
              <Text style={[styles.itemName, { color: colors.text }]}>Backup to Cloud</Text>
            </View>
            <Text style={[styles.itemSub, { color: colors.textMuted }]}>Last backup: {state.lastBackupAt || 'Never'}</Text>
          </TouchableOpacity>
          <TouchableOpacity style={[styles.listItem, { backgroundColor: colors.surfaceElevated, borderColor: colors.border }]} onPress={handleRestore}>
            <View style={styles.itemLeft}>
              <Ionicons name="cloud-download" size={24} color={colors.danger} />
              <Text style={[styles.itemName, { color: colors.danger }]}>Restore Backup</Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color={colors.textMuted} />
          </TouchableOpacity>
        </View>

        <View style={styles.footer}><Text style={[styles.footerText, { color: colors.textMuted }]}>DocuTrak v1.0.0</Text></View>
      </ScrollView>

      {/* EDIT FIELD MODAL */}
      <Modal visible={editModal.visible} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={[styles.modalCard, { backgroundColor: colors.surfaceElevated, borderColor: colors.border }]}>
            <Text style={[styles.modalTitle, { color: colors.text }]}>Edit {editModal.field}</Text>
            <TextInput style={[styles.modalInput, { backgroundColor: colors.surface, borderColor: colors.border, color: colors.text }]} value={editModal.value} onChangeText={(t) => setEditModal(p => ({ ...p, value: t }))} placeholder={`Enter ${editModal.field.toLowerCase()}...`} placeholderTextColor={colors.textMuted} autoFocus />
            <View style={styles.modalActions}>
              <TouchableOpacity style={[styles.modalCancelBtn, { backgroundColor: colors.surface }]} onPress={() => setEditModal({ visible: false, field: '', value: '' })}>
                <Text style={[styles.modalCancelText, { color: colors.textMuted }]}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity style={[styles.modalSaveBtn, { backgroundColor: colors.primary }]} onPress={saveEditModal}>
                <Text style={[styles.modalSaveText, { color: colors.text }]}>Save</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: { paddingHorizontal: 20, paddingTop: 15, paddingBottom: 15 },
  headerLeft: { flexDirection: 'row', alignItems: 'center' },
  backButton: { marginRight: 16, padding: 8, borderRadius: 20 },
  title: { fontSize: 28, fontWeight: '900' },
  content: { padding: 20, paddingBottom: 40 },
  section: { marginBottom: 30 },
  sectionTitle: { fontSize: 13, fontWeight: '800', marginBottom: 12, marginLeft: 4, textTransform: 'uppercase', letterSpacing: 1.5 },
  listItem: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 18, borderRadius: 20, marginBottom: 8, borderWidth: 1 },
  listItemStacked: { padding: 18, borderRadius: 20, marginBottom: 8, borderWidth: 1 },
  itemLeft: { flexDirection: 'row', alignItems: 'center', gap: 14 },
  itemName: { fontSize: 16, fontWeight: '700' },
  itemRight: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  itemValue: { fontSize: 15, fontWeight: '600' },
  itemSub: { fontSize: 13, marginTop: 8, lineHeight: 18 },
  alertDaysControls: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  alertDaysBtn: { width: 36, height: 36, borderRadius: 18, justifyContent: 'center', alignItems: 'center' },
  alertDaysValue: { fontSize: 20, fontWeight: '900', minWidth: 40, textAlign: 'center' },
  footer: { alignItems: 'center', paddingVertical: 20 },
  footerText: { fontSize: 14, fontWeight: 'bold' },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.7)', justifyContent: 'center', alignItems: 'center', padding: 30 },
  modalCard: { width: '100%', borderRadius: 24, padding: 24, borderWidth: 1 },
  modalTitle: { fontSize: 20, fontWeight: '800', marginBottom: 16 },
  modalInput: { borderWidth: 1, borderRadius: 12, padding: 14, fontSize: 16, marginBottom: 20 },
  modalActions: { flexDirection: 'row', justifyContent: 'flex-end', gap: 12 },
  modalCancelBtn: { paddingVertical: 12, paddingHorizontal: 20, borderRadius: 12 },
  modalCancelText: { fontWeight: '700', fontSize: 15 },
  modalSaveBtn: { paddingVertical: 12, paddingHorizontal: 24, borderRadius: 12 },
  modalSaveText: { fontWeight: '800', fontSize: 15 },
});
