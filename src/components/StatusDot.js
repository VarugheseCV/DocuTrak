import { View, StyleSheet } from 'react-native';

export default function StatusDot({ color, size = 8 }) {
  return (
    <View style={styles.container}>
      <View style={[styles.dot, { backgroundColor: color, width: size, height: size, borderRadius: size / 2 }]} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { marginRight: 12, justifyContent: 'center', alignItems: 'center' },
  dot: {},
});
