import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../theme/theme';

export default function ScreenHeader({ title, onBack, rightAction, subtitle }) {
  return (
    <View style={[styles.container, !onBack && styles.containerFlush]}>
      {onBack ? (
        <TouchableOpacity
          onPress={onBack}
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          accessibilityRole="button"
          accessibilityLabel="Go back"
        >
          <Ionicons name="arrow-back" size={24} color={colors.text} />
        </TouchableOpacity>
      ) : (
        <View style={{ width: 24 }} />
      )}
      <View style={styles.center}>
        {subtitle && <Text style={styles.subtitle}>{subtitle}</Text>}
        <Text style={styles.title} numberOfLines={1}>{title}</Text>
      </View>
      {rightAction || <View style={{ width: 24 }} />}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 15,
    backgroundColor: colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  containerFlush: {
    backgroundColor: 'transparent',
    borderBottomWidth: 0,
  },
  center: { flex: 1, alignItems: 'center' },
  subtitle: { fontSize: 11, fontWeight: '800', color: colors.primary, letterSpacing: 2, marginBottom: 2 },
  title: { fontSize: 20, fontWeight: 'bold', color: colors.text },
});
