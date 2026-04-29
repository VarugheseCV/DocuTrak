import { useEffect, useRef, useCallback } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Animated } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Swipeable from 'react-native-gesture-handler/Swipeable';
import { useTheme, useAppNavigation } from '../../context/AppContext';
import { ROUTES } from '../../navigation/routes';
import { formatRelativeExpiryDate } from '../../domain/documents';

export default function DocumentCard({ item, index = 0, onDelete }) {
  const { colors } = useTheme();
  const navigate = useAppNavigation();
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(20)).current;

  useEffect(() => {
    const delay = Math.min(index * 50, 400);
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 300,
        delay,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 300,
        delay,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  const isExpired = item.daysRemaining < 0;
  const iconBg = isExpired ? colors.dangerLight : colors.warningLight;
  const iconColor = isExpired ? colors.danger : colors.accent;
  const badgeColor = isExpired ? colors.danger : colors.accent;
  
  const badgeText = formatRelativeExpiryDate(item.daysRemaining);

  const renderRightActions = useCallback(() => (
    <View style={{ flexDirection: 'row' }}>
      <TouchableOpacity style={[styles.actionBtnEdit, { backgroundColor: colors.primary }]} onPress={() => navigate(ROUTES.ADD_DOCUMENT, { editDocId: item.id })}>
        <Ionicons name="pencil" size={24} color="#FFF" />
      </TouchableOpacity>
      <TouchableOpacity style={[styles.actionBtnDelete, { backgroundColor: colors.danger }]} onPress={() => onDelete(item.id)}>
        <Ionicons name="trash" size={24} color="#FFF" />
      </TouchableOpacity>
    </View>
  ), [colors, navigate, item.id, onDelete]);

  return (
    <Animated.View style={{ opacity: fadeAnim, transform: [{ translateY: slideAnim }] }}>
      <Swipeable renderRightActions={renderRightActions}>
        <TouchableOpacity onPress={() => navigate(ROUTES.DOCUMENT_DETAIL, { id: item.id })} style={[styles.listItem, { backgroundColor: colors.surfaceElevated, borderColor: colors.border }]} activeOpacity={0.7}>
          <View style={[styles.itemIcon, { backgroundColor: iconBg }]}>
            <Ionicons name="document-text" size={22} color={iconColor} />
          </View>
          <View style={styles.itemLeft}>
            <Text style={[styles.itemName, { color: colors.text }]}>{item.documentType?.name || "Document"}</Text>
            <Text style={[styles.itemSub, { color: colors.textMuted }]}>{item.entity?.name || "Entity"}</Text>
          </View>
          <View style={{ alignItems: 'flex-end' }}>
            <Text style={[styles.itemDate, { color: colors.text }]}>{item.expiryDate}</Text>
            <Text style={[styles.itemBadge, { color: badgeColor }]}>{badgeText}</Text>
          </View>
        </TouchableOpacity>
      </Swipeable>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  listItem: {
    flexDirection: 'row', alignItems: 'center', padding: 16, borderRadius: 20,
    marginBottom: 12, borderWidth: 1,
  },
  itemIcon: { width: 48, height: 48, borderRadius: 16, justifyContent: 'center', alignItems: 'center', marginRight: 16 },
  itemLeft: { flex: 1 },
  itemName: { fontSize: 17, fontWeight: '800' },
  itemSub: { fontSize: 14, marginTop: 4, fontWeight: '500' },
  itemDate: { fontSize: 15, fontWeight: '800' },
  itemBadge: { fontSize: 12, marginTop: 4, fontWeight: '700' },
  actionBtnEdit: { justifyContent: 'center', alignItems: 'center', width: 70, marginBottom: 12, borderRadius: 20, marginLeft: 10 },
  actionBtnDelete: { justifyContent: 'center', alignItems: 'center', width: 70, marginBottom: 12, borderRadius: 20, marginLeft: 10 },
});
