import React from 'react';
import { TouchableOpacity, Text, StyleSheet, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useAppState } from '../context/AppContext';

export default function FAB({ label, onPress, icon = "add" }) {
  const { colors } = useAppState();

  return (
    <View style={[styles.wrapper, { shadowColor: colors.primary }]}>
      <TouchableOpacity style={styles.container} activeOpacity={0.8} onPress={onPress}>
        <LinearGradient colors={[colors.primary, colors.primary + "CC"]} style={styles.gradient} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}>
          <Ionicons name={icon} size={24} color="#FFF" />
          {label && <Text style={[styles.label, { color: "#FFF" }]}>{label}</Text>}
        </LinearGradient>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    position: 'absolute',
    bottom: 20,
    right: 20,
    shadowOpacity: 0.3,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 4 },
    elevation: 8,
  },
  container: { borderRadius: 30, overflow: 'hidden' },
  gradient: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 20,
  },
  label: { fontWeight: 'bold', fontSize: 15, marginLeft: 8 },
});
