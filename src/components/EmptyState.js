import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../theme/theme';

export default function EmptyState({ icon = "folder-open-outline", title, subtitle }) {
  return (
    <View style={styles.container}>
      <Ionicons name={icon} size={64} color={colors.borderHighlight} />
      <Text style={styles.title}>{title}</Text>
      {subtitle && <Text style={styles.subtitle}>{subtitle}</Text>}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { alignItems: 'center', justifyContent: 'center', paddingTop: 80, paddingBottom: 40 },
  title: { color: colors.text, fontSize: 18, fontWeight: 'bold', marginTop: 16 },
  subtitle: { color: colors.textMuted, fontSize: 14, marginTop: 8, textAlign: 'center', paddingHorizontal: 40 },
});
