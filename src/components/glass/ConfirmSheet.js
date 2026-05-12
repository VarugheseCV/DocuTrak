import { Modal, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import GlassSurface from './GlassSurface';
import GlassButton from './GlassButton';
import { useTheme } from '../../context/AppContext';

export default function ConfirmSheet({
  visible,
  title,
  message,
  confirmLabel = 'Confirm',
  cancelLabel = 'Cancel',
  destructive = false,
  onCancel,
  onConfirm,
}) {
  const { colors } = useTheme();

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onCancel}>
      <TouchableOpacity style={styles.overlay} activeOpacity={1} onPress={onCancel}>
        <TouchableOpacity activeOpacity={1} style={styles.sheetWrap}>
          <GlassSurface strong style={styles.sheet} contentStyle={styles.content}>
            <Text style={[styles.title, { color: colors.text }]}>{title}</Text>
            {!!message && <Text style={[styles.message, { color: colors.textMuted }]}>{message}</Text>}
            <View style={styles.actions}>
              <GlassButton label={cancelLabel} onPress={onCancel} style={styles.action} />
              <GlassButton
                label={confirmLabel}
                variant={destructive ? 'danger' : 'primary'}
                onPress={onConfirm}
                style={styles.action}
              />
            </View>
          </GlassSurface>
        </TouchableOpacity>
      </TouchableOpacity>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    justifyContent: 'flex-end',
    backgroundColor: 'rgba(0, 0, 0, 0.48)',
    padding: 18,
  },
  sheetWrap: {
    width: '100%',
  },
  sheet: {
    borderRadius: 26,
  },
  content: {
    padding: 20,
  },
  title: {
    fontSize: 20,
    fontWeight: '900',
    marginBottom: 8,
  },
  message: {
    fontSize: 14,
    lineHeight: 21,
    fontWeight: '600',
  },
  actions: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 20,
  },
  action: {
    flex: 1,
  },
});
