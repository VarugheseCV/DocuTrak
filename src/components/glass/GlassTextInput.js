import { Text, TextInput, StyleSheet, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import GlassSurface from './GlassSurface';
import { useTheme } from '../../context/AppContext';

export default function GlassTextInput({
  label,
  icon,
  error,
  helper,
  style,
  inputStyle,
  multiline,
  ...props
}) {
  const { colors } = useTheme();
  const borderColor = error ? colors.danger : colors.glassBorder;

  return (
    <View style={style}>
      {label && <Text style={[styles.label, { color: colors.text }]}>{label}</Text>}
      <GlassSurface
        strong
        blur={false}
        style={[styles.surface, { borderRadius: 18, shadowOpacity: error ? 0.16 : 0.1 }]}
        contentStyle={[styles.content, { borderColor }]}
      >
        {icon && <Ionicons name={icon} size={20} color={error ? colors.danger : colors.primary} style={styles.icon} />}
        <TextInput
          {...props}
          multiline={multiline}
          placeholderTextColor={colors.textMuted}
          style={[
            styles.input,
            multiline && styles.multiline,
            { color: colors.text },
            inputStyle,
          ]}
        />
      </GlassSurface>
      {!!(error || helper) && (
        <Text style={[styles.helper, { color: error ? colors.danger : colors.textMuted }]}>
          {error || helper}
        </Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  label: {
    fontSize: 13,
    fontWeight: '800',
    marginBottom: 10,
    marginLeft: 4,
  },
  surface: {
    borderRadius: 18,
  },
  content: {
    minHeight: 54,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 14,
    borderWidth: 1,
    borderRadius: 18,
  },
  icon: {
    marginRight: 10,
  },
  input: {
    flex: 1,
    paddingVertical: 13,
    fontSize: 15,
    fontWeight: '600',
  },
  multiline: {
    minHeight: 110,
    paddingTop: 14,
    textAlignVertical: 'top',
  },
  helper: {
    fontSize: 12,
    lineHeight: 16,
    marginTop: 8,
    marginLeft: 4,
    fontWeight: '600',
  },
});
