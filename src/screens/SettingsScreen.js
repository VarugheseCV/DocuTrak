import { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, Switch, TextInput, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as LocalAuthentication from 'expo-local-authentication';
import { useAppState, useAppNavigation } from '../context/AppContext';
import { ROUTES } from '../navigation/routes';
import { exportBackup, importBackup } from '../services/backupService';
import GlassScreen from '../components/glass/GlassScreen';
import GlassSurface from '../components/glass/GlassSurface';
import GlassButton from '../components/glass/GlassButton';
import ConfirmSheet from '../components/glass/ConfirmSheet';
import { useToast } from '../components/glass/Toast';

export default function SettingsScreen() {
  const { state, commit, colors } = useAppState();
  const { showToast } = useToast();
  const navigate = useAppNavigation();
  const [isBiometricSupported, setIsBiometricSupported] = useState(false);
  const [restoreVisible, setRestoreVisible] = useState(false);
  const [busyAction, setBusyAction] = useState(null);
  const profile = state.profile || {};

  useEffect(() => {
    LocalAuthentication.hasHardwareAsync().then(setIsBiometricSupported);
  }, []);

  async function handleBackup() {
    try {
      setBusyAction('backup');
      await exportBackup(state);
      await commit({ ...state, lastBackupAt: new Date().toLocaleString() });
      showToast('Backup ready to save');
    } catch (e) {
      showToast(e.message || 'Backup failed', 'error');
    } finally {
      setBusyAction(null);
    }
  }

  async function confirmRestore() {
    try {
      setBusyAction('restore');
      const payload = await importBackup();
      if (payload) {
        await commit(payload.data);
        showToast('Data restored');
      }
    } catch (err) {
      showToast(err.message || 'Restore failed', 'error');
    } finally {
      setBusyAction(null);
      setRestoreVisible(false);
    }
  }

  async function toggleAppLock(value) {
    if (value) {
      const auth = await LocalAuthentication.authenticateAsync({ promptMessage: 'Authenticate to enable App Lock' });
      if (auth.success) {
        await commit({ ...state, profile: { ...profile, appLockEnabled: true } });
        showToast('App Lock enabled');
      } else {
        showToast('Authentication failed', 'error');
      }
    } else {
      await commit({ ...state, profile: { ...profile, appLockEnabled: false } });
      showToast('App Lock disabled');
    }
  }

  function setAlertDays(value) {
    const parsed = Number.parseInt(String(value).replace(/\D/g, ''), 10);
    const next = Number.isNaN(parsed) ? 1 : Math.max(1, Math.min(365, parsed));
    commit({ ...state, profile: { ...profile, alertDays: next } });
  }

  function adjustAlertDays(delta) {
    const next = Math.max(1, Math.min(365, Number(profile.alertDays || 30) + delta));
    commit({ ...state, profile: { ...profile, alertDays: next } });
  }

  return (
    <GlassScreen>
      <View style={styles.header}>
        <GlassButton icon="arrow-back" onPress={() => navigate(ROUTES.DASHBOARD)} accessibilityLabel="Go back" style={styles.backButton} contentStyle={styles.backButtonContent} />
        <View style={styles.headerCopy}>
          <Text style={[styles.title, { color: colors.text }]}>Settings</Text>
          <Text style={[styles.subtitle, { color: colors.textMuted }]}>Security, alerts, and backup</Text>
        </View>
      </View>

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <Section title="Security">
          <SettingsRow
            icon="lock-closed"
            iconColor="#A371F7"
            title="App Lock"
            subtitle={isBiometricSupported ? "Biometrics / PIN" : "No biometric hardware detected"}
            colors={colors}
            right={
              <Switch
                value={!!profile.appLockEnabled}
                onValueChange={toggleAppLock}
                disabled={!isBiometricSupported}
                trackColor={{ false: colors.borderHighlight, true: colors.primary }}
                thumbColor="#FFF"
              />
            }
          />
        </Section>

        <Section title="Alerts">
          <GlassSurface blur={false} strong style={styles.alertCard} contentStyle={styles.alertContent}>
            <View style={styles.alertTop}>
              <View style={[styles.iconBox, { backgroundColor: colors.primaryLight }]}>
                <Ionicons name="notifications" size={20} color={colors.primary} />
              </View>
              <View style={styles.alertCopy}>
                <Text style={[styles.itemName, { color: colors.text }]}>Alert Days</Text>
                <Text style={[styles.itemSub, { color: colors.textMuted }]}>Notify before a document expires.</Text>
              </View>
            </View>
            <View style={styles.alertControls}>
              <GlassButton icon="remove" onPress={() => adjustAlertDays(-1)} variant="primary" style={styles.stepper} contentStyle={styles.stepperContent} accessibilityLabel="Decrease alert days" />
              <GlassSurface blur={false} style={styles.daysInputSurface} contentStyle={styles.daysInputContent}>
                <TextInput
                  value={String(profile.alertDays || 30)}
                  onChangeText={setAlertDays}
                  keyboardType="number-pad"
                  style={[styles.daysInput, { color: colors.text }]}
                  accessibilityLabel="Alert days"
                />
              </GlassSurface>
              <GlassButton icon="add" onPress={() => adjustAlertDays(1)} variant="primary" style={styles.stepper} contentStyle={styles.stepperContent} accessibilityLabel="Increase alert days" />
            </View>
          </GlassSurface>

          <SettingsRow
            icon="globe"
            iconColor={colors.primary}
            title="Language"
            subtitle={profile.language || "English"}
            colors={colors}
            compact
          />
        </Section>

        <Section title="Data Management">
          <SettingsRow
            icon="cloud-upload"
            iconColor={colors.primary}
            title={busyAction === 'backup' ? "Preparing backup..." : "Backup to Cloud"}
            subtitle={`Last backup: ${state.lastBackupAt || 'Never'}`}
            colors={colors}
            onPress={handleBackup}
            disabled={!!busyAction}
            right={<Ionicons name="chevron-forward" size={18} color={colors.textMuted} />}
          />
          <SettingsRow
            icon="cloud-download"
            iconColor={colors.danger}
            title={busyAction === 'restore' ? "Restoring..." : "Restore Backup"}
            subtitle="Replace local data from a backup file."
            colors={colors}
            danger
            onPress={() => setRestoreVisible(true)}
            disabled={!!busyAction}
            right={<Ionicons name="chevron-forward" size={18} color={colors.textMuted} />}
          />
        </Section>

        <View style={styles.footer}>
          <View style={[styles.footerIcon, { backgroundColor: colors.primary }]}>
            <Ionicons name="shield-checkmark" size={20} color="#FFF" />
          </View>
          <Text style={[styles.footerTitle, { color: colors.text }]}>DocuTrak v1.0.0</Text>
          <Text style={[styles.footerSub, { color: colors.textMuted }]}>Track. Protect. Never Forget.</Text>
        </View>
      </ScrollView>

      <ConfirmSheet
        visible={restoreVisible}
        title="Restore backup?"
        message="This replaces all current local data with the selected backup file."
        confirmLabel="Restore"
        destructive
        onCancel={() => setRestoreVisible(false)}
        onConfirm={confirmRestore}
      />
    </GlassScreen>
  );
}

function Section({ title, children }) {
  const { colors } = useAppState();
  return (
    <View style={styles.section}>
      <Text style={[styles.sectionTitle, { color: colors.textMuted }]}>{title}</Text>
      <View style={styles.sectionStack}>{children}</View>
    </View>
  );
}

function SettingsRow({ icon, iconColor, title, subtitle, right, colors, onPress, danger, disabled, compact }) {
  const row = (
      <GlassSurface blur={false} strong style={[styles.rowSurface, disabled && styles.disabled]} contentStyle={styles.rowContent}>
        <View style={[styles.iconBox, { backgroundColor: danger ? colors.dangerGlass : colors.primaryLight }]}>
          <Ionicons name={icon} size={20} color={iconColor} />
        </View>
        <View style={styles.itemText}>
          <Text style={[styles.itemName, { color: danger ? colors.danger : colors.text }]} numberOfLines={1}>{title}</Text>
          {!!subtitle && <Text style={[styles.itemSub, { color: colors.textMuted }]} numberOfLines={compact ? 1 : 2}>{subtitle}</Text>}
        </View>
        {right}
      </GlassSurface>
  );

  if (onPress) {
    return (
      <TouchableOpacity onPress={onPress} disabled={disabled} activeOpacity={0.78} accessibilityRole="button">
        {row}
      </TouchableOpacity>
    );
  }

  return <View>{row}</View>;
}

const styles = StyleSheet.create({
  header: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 20, paddingTop: 16, paddingBottom: 12, gap: 14 },
  backButton: { width: 44, height: 44 },
  backButtonContent: { width: 44, height: 44, paddingHorizontal: 0, paddingVertical: 0 },
  headerCopy: { flex: 1 },
  title: { fontSize: 26, fontWeight: '900' },
  subtitle: { fontSize: 13, fontWeight: '700', marginTop: 3 },
  content: { padding: 20, paddingBottom: 42 },
  section: { marginBottom: 28 },
  sectionTitle: { fontSize: 12, fontWeight: '900', marginBottom: 10, marginLeft: 4, letterSpacing: 1.2, textTransform: 'uppercase' },
  sectionStack: { gap: 10 },
  rowSurface: { borderRadius: 22 },
  rowContent: { flexDirection: 'row', alignItems: 'center', padding: 15, minHeight: 72 },
  itemText: { flex: 1, minWidth: 0, marginRight: 10 },
  iconBox: { width: 38, height: 38, borderRadius: 14, justifyContent: 'center', alignItems: 'center', marginRight: 14 },
  itemName: { fontSize: 16, fontWeight: '800' },
  itemSub: { fontSize: 13, marginTop: 3, lineHeight: 18, fontWeight: '600' },
  alertCard: { borderRadius: 22 },
  alertContent: { padding: 15 },
  alertTop: { flexDirection: 'row', alignItems: 'center', marginBottom: 14 },
  alertCopy: { flex: 1 },
  alertControls: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  stepper: { width: 44, height: 44 },
  stepperContent: { width: 44, height: 44, paddingHorizontal: 0, paddingVertical: 0 },
  daysInputSurface: { flex: 1, borderRadius: 18 },
  daysInputContent: { minHeight: 48, justifyContent: 'center', alignItems: 'center' },
  daysInput: { width: '100%', textAlign: 'center', fontSize: 18, fontWeight: '900', paddingVertical: 10 },
  footer: { alignItems: 'center', paddingVertical: 30 },
  footerIcon: { width: 38, height: 38, borderRadius: 14, justifyContent: 'center', alignItems: 'center', marginBottom: 10 },
  footerTitle: { fontSize: 15, fontWeight: '800', marginBottom: 4 },
  footerSub: { fontSize: 13, fontWeight: '600' },
  disabled: { opacity: 0.55 },
});
