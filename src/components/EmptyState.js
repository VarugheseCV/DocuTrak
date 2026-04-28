import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useAppState } from '../context/AppContext';

export default function EmptyState({ icon = "folder-open-outline", title, subtitle }) {
  const { colors } = useAppState();

  return (
    <View style={styles.container}>
      <Ionicons name={icon} size={64} color={colors.borderHighlight} />
      <Text style={[styles.title, { color: colors.text }]}>{title}</Text>
      {subtitle && <Text style={[styles.subtitle, { color: colors.textMuted }]}>{subtitle}</Text>}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { alignItems: 'center', justifyContent: 'center', paddingTop: 80, paddingBottom: 40 },
  title: { fontSize: 18, fontWeight: 'bold', marginTop: 16 },
  subtitle: { fontSize: 14, marginTop: 8, textAlign: 'center', paddingHorizontal: 40 },
});
