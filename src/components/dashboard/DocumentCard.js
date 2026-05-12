import { useEffect, useRef, useCallback } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Animated } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Swipeable from 'react-native-gesture-handler/Swipeable';
import { useTheme, useAppNavigation } from '../../context/AppContext';
import { ROUTES } from '../../navigation/routes';
import { formatRelativeExpiryDate } from '../../domain/documents';
import GlassSurface from '../glass/GlassSurface';

export default function DocumentCard({ item, index = 0, onDelete }) {
  const { colors } = useTheme();
  const navigate = useAppNavigation();
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(20)).current;

  useEffect(() => {
    const delay = Math.min(index * 50, 400);
    Animated.parallel([
      Animated.timing(fadeAnim, { toValue: 1, duration: 300, delay, useNativeDriver: true }),
      Animated.timing(slideAnim, { toValue: 0, duration: 300, delay, useNativeDriver: true }),
    ]).start();
  }, []);

  const isExpired = item.daysRemaining < 0;
  const iconBg = isExpired ? colors.dangerGlass : colors.warningGlass;
  const iconColor = isExpired ? colors.danger : colors.warning;
  const badgeText = formatRelativeExpiryDate(item.daysRemaining);

  const renderRightActions = useCallback(() => (
    <View style={styles.actions}>
      <TouchableOpacity
        style={[styles.actionBtn, { backgroundColor: colors.primary }]}
        onPress={() => navigate(ROUTES.ADD_DOCUMENT, { editDocId: item.id })}
        accessibilityRole="button"
        accessibilityLabel="Edit document"
      >
        <Ionicons name="pencil" size={23} color="#FFF" />
      </TouchableOpacity>
      <TouchableOpacity
        style={[styles.actionBtn, { backgroundColor: colors.danger }]}
        onPress={() => onDelete(item.id)}
        accessibilityRole="button"
        accessibilityLabel="Delete document"
      >
        <Ionicons name="trash" size={23} color="#FFF" />
      </TouchableOpacity>
    </View>
  ), [colors, navigate, item.id, onDelete]);

  return (
    <Animated.View style={{ opacity: fadeAnim, transform: [{ translateY: slideAnim }] }}>
      <Swipeable renderRightActions={renderRightActions}>
        <TouchableOpacity
          onPress={() => navigate(ROUTES.DOCUMENT_DETAIL, { id: item.id })}
          activeOpacity={0.76}
          accessibilityRole="button"
          accessibilityLabel={`${item.documentType?.name || 'Document'} for ${item.entity?.name || 'Entity'}`}
          accessibilityHint="Opens document details. Swipe left for edit and delete actions."
        >
          <GlassSurface blur={false} strong style={styles.listItem} contentStyle={styles.itemContent}>
            <View style={[styles.statusRail, { backgroundColor: iconColor }]} />
            <View style={[styles.itemIcon, { backgroundColor: iconBg }]}>
              <Ionicons name="document-text" size={22} color={iconColor} />
            </View>
            <View style={styles.itemLeft}>
              <Text style={[styles.itemName, { color: colors.text }]} numberOfLines={1}>{item.documentType?.name || "Document"}</Text>
              <Text style={[styles.itemSub, { color: colors.textMuted }]} numberOfLines={1}>{item.entity?.name || "Entity"}</Text>
            </View>
            <View style={styles.itemRight}>
              <Text style={[styles.itemDate, { color: colors.text }]} numberOfLines={1}>{item.expiryDate}</Text>
              <Text style={[styles.itemBadge, { color: iconColor }]} numberOfLines={1}>{badgeText}</Text>
            </View>
            <Ionicons name="chevron-back" size={14} color={colors.textSecondary} style={styles.swipeHint} />
          </GlassSurface>
        </TouchableOpacity>
      </Swipeable>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  listItem: {
    borderRadius: 20,
    marginBottom: 10,
  },
  itemContent: {
    minHeight: 74,
    flexDirection: 'row',
    alignItems: 'center',
    padding: 14,
    paddingLeft: 16,
  },
  statusRail: {
    position: 'absolute',
    left: 0,
    top: 16,
    bottom: 16,
    width: 4,
    borderTopRightRadius: 3,
    borderBottomRightRadius: 3,
  },
  itemIcon: {
    width: 44,
    height: 44,
    borderRadius: 15,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 14,
  },
  itemLeft: {
    flex: 1,
    minWidth: 0,
  },
  itemRight: {
    alignItems: 'flex-end',
    marginLeft: 10,
    maxWidth: 112,
  },
  itemName: {
    fontSize: 16,
    fontWeight: '800',
  },
  itemSub: {
    fontSize: 13,
    marginTop: 3,
    fontWeight: '600',
  },
  itemDate: {
    fontSize: 13,
    fontWeight: '800',
  },
  itemBadge: {
    fontSize: 11,
    marginTop: 3,
    fontWeight: '800',
  },
  swipeHint: {
    marginLeft: 6,
    opacity: 0.65,
  },
  actions: {
    flexDirection: 'row',
    marginBottom: 10,
  },
  actionBtn: {
    justifyContent: 'center',
    alignItems: 'center',
    width: 62,
    borderRadius: 18,
    marginLeft: 8,
  },
});
