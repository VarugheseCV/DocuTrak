import { Image, Modal, StyleSheet, Text, View } from 'react-native';
import GlassButton from './GlassButton';
import GlassSurface from './GlassSurface';
import { useTheme } from '../../context/AppContext';

export default function ImageViewerModal({ visible, image, title, subtitle, onClose }) {
  const { colors } = useTheme();

  return (
    <Modal visible={visible} animationType="fade" onRequestClose={onClose}>
      <View style={[styles.container, { backgroundColor: colors.background }]}>
        <View style={styles.header}>
          <GlassSurface strong style={styles.meta} contentStyle={styles.metaContent}>
            <Text style={[styles.title, { color: colors.text }]} numberOfLines={1}>{title || 'Document image'}</Text>
            {!!subtitle && <Text style={[styles.subtitle, { color: colors.textMuted }]} numberOfLines={1}>{subtitle}</Text>}
          </GlassSurface>
          <GlassButton icon="close" onPress={onClose} accessibilityLabel="Close image viewer" />
        </View>
        {image && <Image source={{ uri: image.uri }} style={styles.image} resizeMode="contain" />}
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: 48,
    paddingHorizontal: 16,
    paddingBottom: 24,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 16,
  },
  meta: {
    flex: 1,
    borderRadius: 18,
  },
  metaContent: {
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  title: {
    fontSize: 15,
    fontWeight: '900',
  },
  subtitle: {
    fontSize: 12,
    fontWeight: '700',
    marginTop: 3,
  },
  image: {
    flex: 1,
    width: '100%',
  },
});
