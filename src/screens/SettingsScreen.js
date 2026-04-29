import { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert, Switch, Modal, TextInput } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as LocalAuthentication from 'expo-local-authentication';
import { useAppState, useAppNavigation } from '../context/AppContext';
import { ROUTES } from '../navigation/routes';

import { exportBackup, importBackup } from '../services/backupService';

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
      Alert.alert("Backup successful", "Your data was backed up to your device.");
      await commit({ ...state, lastBackupAt: new Date().toLocaleString() });
    } catch (e) { Alert.alert("Backup failed", e.message); }
  }

  async function handleRestore() {
    try {
      Alert.alert("Restore backup?", "This will replace all your current local data.", [
        { text: "Cancel", style: "cancel" },
        { 
          text: "Restore", 
          style: "destructive", 
          onPress: async () => { 
            try {
              const payload = await importBackup();
              if (payload) {
                await commit(payload.data);
                Alert.alert("Restored", "Data restored successfully.");
              }
            } catch (err) {
              Alert.alert("Restore failed", err.message);
            }
          } 
        },
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
          <TouchableOpacity onPress={() => navigate(ROUTES.DASHBOARD)} style={[styles.backButton, { backgroundColor: colors.surface }]}>
            <Ionicons name="arrow-back" size={24} color={colors.text} />
          </TouchableOpacity>
          <Text style={[styles.title, { color: colors.text }]}>Settings</Text>
        </View>
      </View>

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        {/* SECURITY */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.textMuted }]}>SECURITY (CRITICAL)</Text>
          <View style={[styles.sectionGroup, { backgroundColor: colors.surface }]}>
            <View style={styles.listItem}>
              <View style={styles.itemLeft}>
                <View style={[styles.iconBox, { backgroundColor: 'rgba(163, 113, 247, 0.15)' }]}>
                  <Ionicons name="lock-closed" size={20} color="#A371F7" />
                </View>
                <View>
                  <Text style={[styles.itemName, { color: colors.text }]}>App Lock</Text>
                  <Text style={[styles.itemSub, { color: colors.textMuted, marginTop: 2 }]}>Biometrics / PIN</Text>
                </View>
              </View>
              <Switch value={!!profile.appLockEnabled} onValueChange={toggleAppLock} trackColor={{ false: colors.border, true: colors.primary }} thumbColor="#FFF" />
            </View>
          </View>
        </View>

        {/* GENERAL */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.textMuted }]}>GENERAL</Text>
          <View style={[styles.sectionGroup, { backgroundColor: colors.surface }]}>
            <View style={[styles.listItem, { borderBottomWidth: 1, borderBottomColor: colors.border }]}>
              <View style={styles.itemLeft}>
                <View style={[styles.iconBox, { backgroundColor: 'rgba(79, 124, 255, 0.15)' }]}>
                  <Ionicons name="notifications" size={20} color={colors.primary} />
                </View>
                <View style={{ flex: 1, paddingRight: 10 }}>
                  <Text style={[styles.itemName, { color: colors.text }]}>Alert Days</Text>
                  <Text style={[styles.itemSub, { color: colors.textMuted, marginTop: 2, fontSize: 12 }]}>You will be notified {profile.alertDays || 30} day{profile.alertDays === 1 ? '' : 's'} before a document expires.</Text>
                </View>
              </View>
              <View style={styles.alertDaysControls}>
                <TouchableOpacity style={[styles.alertDaysBtn, { backgroundColor: colors.primary }]} onPress={() => adjustAlertDays(-1)}>
                  <Ionicons name="remove" size={16} color="#FFF" />
                </TouchableOpacity>
                <Text style={[styles.alertDaysValue, { color: colors.text }]}>{profile.alertDays || 30}</Text>
                <TouchableOpacity style={[styles.alertDaysBtn, { backgroundColor: colors.primary }]} onPress={() => adjustAlertDays(1)}>
                  <Ionicons name="add" size={16} color="#FFF" />
                </TouchableOpacity>
              </View>
            </View>

            <View style={styles.listItem}>
              <View style={styles.itemLeft}>
                <View style={[styles.iconBox, { backgroundColor: 'rgba(79, 124, 255, 0.15)' }]}>
                  <Ionicons name="globe" size={20} color={colors.primary} />
                </View>
                <Text style={[styles.itemName, { color: colors.text }]}>Language</Text>
              </View>
              <View style={styles.itemRight}>
                <Text style={[styles.itemValue, { color: colors.textMuted }]}>{profile.language || "English"}</Text>
                <Ionicons name="chevron-forward" size={18} color={colors.textMuted} />
              </View>
            </View>
          </View>
        </View>

        {/* DATA MANAGEMENT */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.textMuted }]}>DATA MANAGEMENT</Text>
          <View style={[styles.sectionGroup, { backgroundColor: colors.surface }]}>
            <TouchableOpacity style={[styles.listItem, { borderBottomWidth: 1, borderBottomColor: colors.border }]} onPress={handleBackup}>
              <View style={styles.itemLeft}>
                <View style={[styles.iconBox, { backgroundColor: 'rgba(79, 124, 255, 0.15)' }]}>
                  <Ionicons name="cloud-upload" size={20} color={colors.primary} />
                </View>
                <View>
                  <Text style={[styles.itemName, { color: colors.text }]}>Backup to Cloud</Text>
                  <Text style={[styles.itemSub, { color: colors.textMuted, marginTop: 2, fontSize: 12 }]}>Last backup: {state.lastBackupAt || 'Never'}</Text>
                </View>
              </View>
              <Ionicons name="chevron-forward" size={18} color={colors.textMuted} />
            </TouchableOpacity>

            <TouchableOpacity style={styles.listItem} onPress={handleRestore}>
              <View style={styles.itemLeft}>
                <View style={[styles.iconBox, { backgroundColor: 'rgba(255, 69, 58, 0.15)' }]}>
                  <Ionicons name="cloud-download" size={20} color={colors.danger} />
                </View>
                <Text style={[styles.itemName, { color: colors.danger }]}>Restore Backup</Text>
              </View>
              <Ionicons name="chevron-forward" size={18} color={colors.textMuted} />
            </TouchableOpacity>
          </View>
        </View>

        <View style={styles.footer}>
          <View style={[styles.iconBox, { backgroundColor: colors.primary, marginBottom: 8 }]}>
             <Ionicons name="shield-checkmark" size={20} color="#FFF" />
          </View>
          <Text style={[styles.footerTitle, { color: colors.text }]}>DocuTrak v1.0.0</Text>
          <Text style={[styles.footerSub, { color: colors.textMuted }]}>Track. Protect. Never Forget.</Text>
        </View>
      </ScrollView>

      {/* EDIT FIELD MODAL */}
      <Modal visible={editModal.visible} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={[styles.modalCard, { backgroundColor: colors.surface }]}>
            <Text style={[styles.modalTitle, { color: colors.text }]}>Edit {editModal.field}</Text>
            <TextInput style={[styles.modalInput, { backgroundColor: colors.background, borderColor: colors.border, color: colors.text }]} value={editModal.value} onChangeText={(t) => setEditModal(p => ({ ...p, value: t }))} placeholder={`Enter ${editModal.field.toLowerCase()}...`} placeholderTextColor={colors.textMuted} autoFocus />
            <View style={styles.modalActions}>
              <TouchableOpacity style={[styles.modalCancelBtn, { backgroundColor: colors.background }]} onPress={() => setEditModal({ visible: false, field: '', value: '' })}>
                <Text style={[styles.modalCancelText, { color: colors.textMuted }]}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity style={[styles.modalSaveBtn, { backgroundColor: colors.primary }]} onPress={saveEditModal}>
                <Text style={[styles.modalSaveText, { color: '#FFF' }]}>Save</Text>
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
  backButton: { marginRight: 16, padding: 8, borderRadius: 16 },
  title: { fontSize: 24, fontWeight: '700' },
  content: { padding: 20, paddingBottom: 40 },
  section: { marginBottom: 30 },
  sectionTitle: { fontSize: 12, fontWeight: '600', marginBottom: 10, marginLeft: 16, letterSpacing: 0.5 },
  sectionGroup: { 
    borderRadius: 20, 
    overflow: 'hidden',
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 2,
  },
  listItem: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 16 },
  itemLeft: { flexDirection: 'row', alignItems: 'center', flex: 1 },
  iconBox: { width: 36, height: 36, borderRadius: 10, justifyContent: 'center', alignItems: 'center', marginRight: 16 },
  itemName: { fontSize: 16, fontWeight: '600' },
  itemRight: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  itemValue: { fontSize: 15, fontWeight: '500' },
  itemSub: { fontSize: 13, marginTop: 4, lineHeight: 18 },
  alertDaysControls: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  alertDaysBtn: { width: 32, height: 32, borderRadius: 16, justifyContent: 'center', alignItems: 'center' },
  alertDaysValue: { fontSize: 16, fontWeight: '700', minWidth: 24, textAlign: 'center' },
  footer: { alignItems: 'center', paddingVertical: 30 },
  footerTitle: { fontSize: 15, fontWeight: '700', marginBottom: 4 },
  footerSub: { fontSize: 13, fontWeight: '500' },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.7)', justifyContent: 'center', alignItems: 'center', padding: 30 },
  modalCard: { width: '100%', borderRadius: 24, padding: 24, borderWidth: 1 },
  modalTitle: { fontSize: 20, fontWeight: '700', marginBottom: 16 },
  modalInput: { borderWidth: 1, borderRadius: 12, padding: 14, fontSize: 16, marginBottom: 20 },
  modalActions: { flexDirection: 'row', justifyContent: 'flex-end', gap: 12 },
  modalCancelBtn: { paddingVertical: 12, paddingHorizontal: 20, borderRadius: 12 },
  modalCancelText: { fontWeight: '600', fontSize: 15 },
  modalSaveBtn: { paddingVertical: 12, paddingHorizontal: 24, borderRadius: 12 },
  modalSaveText: { fontWeight: '700', fontSize: 15 },
});