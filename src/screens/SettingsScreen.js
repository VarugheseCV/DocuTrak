import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert, Switch } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as LocalAuthentication from 'expo-local-authentication';
import { colors } from '../theme/theme';
import { exportBackup, importBackup } from '../services/backupService';

export default function SettingsScreen({ state, onCommit, onNavigate }) {
  const [isBiometricSupported, setIsBiometricSupported] = useState(false);
  const profile = state.profile || {};

  useEffect(() => {
    LocalAuthentication.hasHardwareAsync().then(hasHardware => {
      setIsBiometricSupported(hasHardware);
    });
  }, []);

  async function handleBackup() {
    try {
      const result = await exportBackup(state);
      const timestamp = new Date().toLocaleString();
      await onCommit({ ...state, lastBackupAt: timestamp });
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
            onCommit(payload.data);
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
        onCommit({ ...state, profile: { ...profile, appLockEnabled: true } });
      } else {
        Alert.alert("Authentication failed", "Could not enable App Lock.");
      }
    } else {
      onCommit({ ...state, profile: { ...profile, appLockEnabled: false } });
    }
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <TouchableOpacity onPress={() => onNavigate("dashboard")} style={styles.backButton}>
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
            <View style={styles.itemLeft}>
              <Ionicons name="notifications" size={24} color={colors.primary} />
              <Text style={styles.itemName}>Alert Days</Text>
            </View>
            <Text style={styles.itemSub}>
              You will be notified 30 days before a document expires. Example: "Your Passport expires in 30 days"
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
            <TouchableOpacity key={field} style={styles.listItem}>
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
  footer: { alignItems: 'center', paddingVertical: 20 },
  footerText: { color: colors.textMuted, fontSize: 14, fontWeight: 'bold' }
});
