import { useRef, useState } from 'react';
import { Dimensions, Image, Modal, Platform, ScrollView, StyleSheet, Text, View } from 'react-native';
import GlassButton from './GlassButton';
import GlassSurface from './GlassSurface';
import { useTheme } from '../../context/AppContext';

const { width: SCREEN_W, height: SCREEN_H } = Dimensions.get('window');

export default function ImageViewerModal({ visible, image, title, subtitle, onClose }) {
  const { colors } = useTheme();
  const scrollRef = useRef(null);
  const [zoomed, setZoomed] = useState(false);

  function handleDoubleTap() {
    if (!scrollRef.current) return;
    if (zoomed) {
      scrollRef.current.scrollResponderZoomTo({ x: 0, y: 0, width: SCREEN_W, height: SCREEN_H, animated: true });
    } else {
      scrollRef.current.scrollResponderZoomTo({ x: SCREEN_W / 4, y: SCREEN_H / 4, width: SCREEN_W / 2, height: SCREEN_H / 2, animated: true });
    }
    setZoomed(z => !z);
  }

  function handleClose() {
    setZoomed(false);
    onClose();
  }

  return (
    <Modal visible={visible} animationType="fade" onRequestClose={handleClose}>
      <View style={[styles.container, { backgroundColor: colors.background }]}>
        <View style={styles.header}>
          <GlassSurface strong style={styles.meta} contentStyle={styles.metaContent}>
            <Text style={[styles.title, { color: colors.text }]} numberOfLines={1}>{title || 'Document image'}</Text>
            {!!subtitle && <Text style={[styles.subtitle, { color: colors.textMuted }]} numberOfLines={1}>{subtitle}</Text>}
          </GlassSurface>
          <GlassButton icon="close" onPress={handleClose} accessibilityLabel="Close image viewer" />
        </View>
        {image && (
          <ScrollView
            ref={scrollRef}
            style={styles.scrollView}
            contentContainerStyle={styles.scrollContent}
            maximumZoomScale={4}
            minimumZoomScale={1}
            showsHorizontalScrollIndicator={false}
            showsVerticalScrollIndicator={false}
            bouncesZoom
            centerContent
          >
            <DoubleTapWrapper onDoubleTap={handleDoubleTap}>
              <Image source={{ uri: image.uri }} style={styles.image} resizeMode="contain" />
            </DoubleTapWrapper>
          </ScrollView>
        )}
        <Text style={[styles.hint, { color: colors.textSecondary }]}>Pinch to zoom · Double-tap to toggle</Text>
      </View>
    </Modal>
  );
}

/**
 * Simple double-tap detector that works on both iOS and Android
 * without requiring additional gesture handler wrappers.
 */
function DoubleTapWrapper({ children, onDoubleTap }) {
  const lastTap = useRef(0);

  function handlePress() {
    const now = Date.now();
    if (now - lastTap.current < 320) {
      onDoubleTap();
      lastTap.current = 0;
    } else {
      lastTap.current = now;
    }
  }

  return (
    <View onStartShouldSetResponder={() => true} onResponderRelease={handlePress} style={styles.tapWrapper}>
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: Platform.OS === 'ios' ? 56 : 44,
    paddingHorizontal: 16,
    paddingBottom: 24,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 12,
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
  scrollView: {
    flex: 1,
    borderRadius: 18,
    overflow: 'hidden',
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  tapWrapper: {
    width: SCREEN_W - 32,
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  image: {
    width: SCREEN_W - 32,
    height: SCREEN_H - 200,
  },
  hint: {
    fontSize: 11,
    fontWeight: '700',
    textAlign: 'center',
    marginTop: 10,
  },
});
