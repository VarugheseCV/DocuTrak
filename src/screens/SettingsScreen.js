import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert, Switch, Modal, TextInput } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as LocalAuthentication from 'expo-local-authentication';
import { colors } from '../theme/theme';
import { exportBackup, importBackup } from '../services/backupService';
import { useAppState, useAppNavigation } from '../context/AppContext';

export default function SettingsScreen() {
  const { state, commit } = useAppState();
  const navigate = useAppNavigation();
  const [isBiometricSupported, setIsBiometricSupported] = useState(false);
  const profile = state.profile || {};

  // Inline edit modal state
  const [editModal, setEditModal] = useState({ visible: false, field: '', value: '' });

  useEffect(() => {
    LocalAuthentication.hasHardwareAsync().then(hasHardware => {
      setIsBiometricSupported(hasHardware);
    });
  }, []);

  async function handleBackup() {
    try {
      const result = await exportBackup(state);
      const timestamp = new Date().toLocaleString();
      await commit({ ...state, lastBackupAt: timestamp });
      Alert.alert("Backup successful", "Your data was backed up to Google Drive/Local.");
    } catch (e) {
      Alert.alert("Backup failed", e.message);
    }
  }

  async function handleRestore() {
    try {
      const payload = await importBackup();
      if (!payload) return;
      Alert.alert("Restore backup?", "This will replace all your current local data.", [
        { text: "Cancel", style: "cancel" },
        {
          text: "Restore",
          style: "destructive",
          onPress: async () => {
            commit(payload.data);
            Alert.alert("Restored", "Data restored successfully.");
          }
        }
      ]);
    } catch (e) {
      Alert.alert("Restore failed", e.message);
    }
  }

  async function toggleAppLock(value) {
    if (value) {
      const auth = await LocalAuthentication.authenticateAsync({
        promptMessage: 'Authenticate to enable App Lock',
      });
      if (auth.success) {
        commit({ ...state, profile: { ...profile, appLockEnabled: true } });
      } else {
        Alert.alert("Authentication failed", "Could not enable App Lock.");
      }
    } else {
      commit({ ...state, profile: { ...profile, appLockEnabled: false } });
    }
  }

  function openEditModal(field, currentValue) {
    setEditModal({ visible: true, field, value: currentValue || '' });
  }

  function saveEditModal() {
    const { field, value } = editModal;
    const key = field.toLowerCase();
    commit({
      ...state,
      profile: { ...profile, [key]: value.trim() }
    });
    setEditModal({ visible: false, field: '', value: '' });
  }

  function adjustAlertDays(delta) {
    const current = Number(profile.alertDays || 30);
    const next = Math.max(1, Math.min(365, current + delta));
    commit({
      ...state,
      profile: { ...profile, alertDays: next }
    });
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <TouchableOpacity onPress={() => navigate("dashboard")} style={styles.backButton}>
            <Ionicons name="arrow-back" size={24} color={colors.text} />
          </TouchableOpacity>
          <Text style={styles.title}>Settings</Text>
        </View>
      </View>

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        
        {/* SECURITY */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Security (Critical)</Text>
          <View style={styles.listItem}>
            <View style={styles.itemLeft}>
              <Ionicons name="lock-closed" size={24} color={colors.primary} />
              <Text style={styles.itemName}>App Lock (Biometrics/PIN)</Text>
            </View>
            <Switch 
              value={!!profile.appLockEnabled} 
              onValueChange={toggleAppLock} 
              trackColor={{ false: colors.border, true: colors.primary }}
              thumbColor={colors.text}
            />
          </View>
        </View>

        {/* GENERAL */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>General</Text>
          
          <View style={styles.listItemStacked}>
            <View style={[styles.itemLeft, { justifyContent: 'space-between', flex: 1 }]}>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 14 }}>
                <Ionicons name="notifications" size={24} color={colors.primary} />
                <Text style={styles.itemName}>Alert Days</Text>
              </View>
              <View style={styles.alertDaysControls}>
                <TouchableOpacity style={styles.alertDaysBtn} onPress={() => adjustAlertDays(-5)}>
                  <Ionicons name="remove" size={20} color={colors.text} />
                </TouchableOpacity>
                <Text style={styles.alertDaysValue}>{profile.alertDays || 30}</Text>
                <TouchableOpacity style={styles.alertDaysBtn} onPress={() => adjustAlertDays(5)}>
                  <Ionicons name="add" size={20} color={colors.text} />
                </TouchableOpacity>
              </View>
            </View>
            <Text style={styles.itemSub}>
              You will be notified {profile.alertDays || 30} days before a document expires.
            </Text>
          </View>

          <View style={styles.listItem}>
            <View style={styles.itemLeft}>
              <Ionicons name="globe" size={24} color={colors.primary} />
              <Text style={styles.itemName}>Language</Text>
            </View>
            <View style={styles.itemRight}>
              <Text style={styles.itemValue}>{profile.language || "English"}</Text>
              <Ionicons name="chevron-forward" size={20} color={colors.textMuted} />
            </View>
          </View>
        </View>

        {/* PROFILE FIELDS */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Profile Setup</Text>
          
          {['Profession', 'Country', 'Area'].map(field => (
            <TouchableOpacity key={field} style={styles.listItem} onPress={() => openEditModal(field, profile[field.toLowerCase()])}>
              <View style={styles.itemLeft}>
                <Ionicons name="person-circle-outline" size={24} color={colors.primary} />
                <Text style={styles.itemName}>{field}</Text>
              </View>
              <View style={styles.itemRight}>
                <Text style={styles.itemValue}>{profile[field.toLowerCase()] || "Not set"}</Text>
                <Ionicons name="chevron-forward" size={20} color={colors.textMuted} />
              </View>
            </TouchableOpacity>
          ))}
        </View>

        {/* DATA MANAGEMENT */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Data Management</Text>
          
          <TouchableOpacity style={styles.listItemStacked} onPress={handleBackup}>
            <View style={styles.itemLeft}>
              <Ionicons name="cloud-upload" size={24} color={colors.primary} />
              <Text style={styles.itemName}>Backup to Cloud</Text>
            </View>
            <Text style={styles.itemSub}>Last backup: {state.lastBackupAt || 'Never'}</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.listItem} onPress={handleRestore}>
            <View style={styles.itemLeft}>
              <Ionicons name="cloud-download" size={24} color={colors.danger} />
              <Text style={[styles.itemName, { color: colors.danger }]}>Restore Backup</Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color={colors.textMuted} />
          </TouchableOpacity>
        </View>

        <View style={styles.footer}>
          <Text style={styles.footerText}>DocuTrak v1.0.0</Text>
        </View>

      </ScrollView>

      {/* EDIT FIELD MODAL */}
      <Modal visible={editModal.visible} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={styles.modalCard}>
            <Text style={styles.modalTitle}>Edit {editModal.field}</Text>
            <TextInput
              style={styles.modalInput}
              value={editModal.value}
              onChangeText={(text) => setEditModal(prev => ({ ...prev, value: text }))}
              placeholder={`Enter ${editModal.field.toLowerCase()}...`}
              placeholderTextColor={colors.textMuted}
              autoFocus
            />
            <View style={styles.modalActions}>
              <TouchableOpacity style={styles.modalCancelBtn} onPress={() => setEditModal({ visible: false, field: '', value: '' })}>
                <Text style={styles.modalCancelText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.modalSaveBtn} onPress={saveEditModal}>
                <Text style={styles.modalSaveText}>Save</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  header: {
    paddingHorizontal: 20,
    paddingTop: 15,
    paddingBottom: 15,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  backButton: {
    marginRight: 16,
    padding: 8,
    borderRadius: 20,
    backgroundColor: colors.surfaceElevated,
  },
  title: { fontSize: 28, fontWeight: '900', color: colors.text },
  content: { padding: 20, paddingBottom: 120 },
  section: { marginBottom: 30 },
  sectionTitle: { fontSize: 13, fontWeight: '800', color: colors.textMuted, marginBottom: 12, marginLeft: 4, textTransform: 'uppercase', letterSpacing: 1.5 },
  listItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: colors.surfaceElevated,
    padding: 18,
    borderRadius: 20,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: colors.border,
  },
  listItemStacked: {
    backgroundColor: colors.surfaceElevated,
    padding: 18,
    borderRadius: 20,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: colors.border,
  },
  itemLeft: { flexDirection: 'row', alignItems: 'center', gap: 14 },
  itemName: { fontSize: 16, fontWeight: '700', color: colors.text },
  itemRight: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  itemValue: { fontSize: 15, fontWeight: '600', color: colors.textMuted },
  itemSub: { fontSize: 13, color: colors.textMuted, marginTop: 8, lineHeight: 18 },
  alertDaysControls: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  alertDaysBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  alertDaysValue: {
    fontSize: 20,
    fontWeight: '900',
    color: colors.text,
    minWidth: 40,
    textAlign: 'center',
  },
  footer: { alignItems: 'center', paddingVertical: 20 },
  footerText: { color: colors.textMuted, fontSize: 14, fontWeight: 'bold' },
  // Modal styles
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.7)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 30,
  },
  modalCard: {
    width: '100%',
    backgroundColor: colors.surfaceElevated,
    borderRadius: 24,
    padding: 24,
    borderWidth: 1,
    borderColor: colors.border,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: colors.text,
    marginBottom: 16,
  },
  modalInput: {
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 12,
    padding: 14,
    fontSize: 16,
    color: colors.text,
    marginBottom: 20,
  },
  modalActions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 12,
  },
  modalCancelBtn: {
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 12,
    backgroundColor: colors.surface,
  },
  modalCancelText: {
    color: colors.textMuted,
    fontWeight: '700',
    fontSize: 15,
  },
  modalSaveBtn: {
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 12,
    backgroundColor: colors.primary,
  },
  modalSaveText: {
    color: colors.text,
    fontWeight: '800',
    fontSize: 15,
  },
});
