import React, { useEffect, useRef } from 'react';
import { View, StyleSheet, Dimensions, Animated, Easing } from 'react-native';

const { width } = Dimensions.get('window');

function SkeletonBone({ width: boneWidth, height, borderRadius = 12, style, colors }) {
  const pulseAnim = useRef(new Animated.Value(0.3)).current;

  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, { toValue: 0.7, duration: 800, easing: Easing.inOut(Easing.ease), useNativeDriver: true }),
        Animated.timing(pulseAnim, { toValue: 0.3, duration: 800, easing: Easing.inOut(Easing.ease), useNativeDriver: true }),
      ])
    ).start();
  }, []);

  return (
    <Animated.View style={[
      { width: boneWidth, height, borderRadius, backgroundColor: colors.surfaceElevated, opacity: pulseAnim },
      style,
    ]} />
  );
}

export default function SkeletonLoader({ colors }) {
  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      {/* Fake Header */}
      <View style={styles.header}>
        <View>
          <SkeletonBone width={140} height={28} colors={colors} style={{ marginBottom: 8 }} />
          <SkeletonBone width={100} height={16} colors={colors} />
        </View>
        <SkeletonBone width={40} height={40} borderRadius={20} colors={colors} />
      </View>

      {/* Fake Hero Banner */}
      <SkeletonBone width={width - 40} height={130} borderRadius={24} colors={colors} style={{ marginHorizontal: 20, marginTop: 10 }} />

      {/* Fake Stats */}
      <View style={styles.statsRow}>
        <SkeletonBone width={(width - 56) / 2} height={80} borderRadius={20} colors={colors} />
        <SkeletonBone width={(width - 56) / 2} height={80} borderRadius={20} colors={colors} />
      </View>

      {/* Fake Quick Actions */}
      <View style={styles.quickActions}>
        <SkeletonBone width={60} height={80} colors={colors} />
        <SkeletonBone width={60} height={80} colors={colors} />
        <SkeletonBone width={60} height={80} colors={colors} />
        <SkeletonBone width={60} height={80} colors={colors} />
      </View>

      {/* Fake List Items */}
      <View style={{ paddingHorizontal: 20, marginTop: 20 }}>
        <SkeletonBone width={120} height={20} colors={colors} style={{ marginBottom: 16 }} />
        <SkeletonBone width={width - 40} height={70} borderRadius={16} colors={colors} style={{ marginBottom: 12 }} />
        <SkeletonBone width={width - 40} height={70} borderRadius={16} colors={colors} style={{ marginBottom: 12 }} />
        <SkeletonBone width={width - 40} height={70} borderRadius={16} colors={colors} style={{ marginBottom: 12 }} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, paddingTop: 60 },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 20, marginBottom: 20 },
  statsRow: { flexDirection: 'row', justifyContent: 'space-between', paddingHorizontal: 20, marginTop: 20 },
  quickActions: { flexDirection: 'row', justifyContent: 'space-between', paddingHorizontal: 20, marginTop: 30 }
});
