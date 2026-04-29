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
        <TouchableOpacity onPress={() => navigate(ROUTES.DOCUMENT_DETAIL, { id: item.id })} style={[styles.listItem, { backgroundColor: colors.surface }]} activeOpacity={0.7}>
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
    flexDirection: 'row', alignItems: 'center', padding: 14, borderRadius: 16,
    marginBottom: 8,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 2,
  },
  itemIcon: { width: 44, height: 44, borderRadius: 12, justifyContent: 'center', alignItems: 'center', marginRight: 14 },
  itemLeft: { flex: 1 },
  itemName: { fontSize: 16, fontWeight: '700' },
  itemSub: { fontSize: 13, marginTop: 2, fontWeight: '500' },
  itemDate: { fontSize: 14, fontWeight: '700' },
  itemBadge: { fontSize: 12, marginTop: 2, fontWeight: '600' },
  actionBtnEdit: { justifyContent: 'center', alignItems: 'center', width: 64, marginBottom: 8, borderRadius: 16, marginLeft: 8 },
  actionBtnDelete: { justifyContent: 'center', alignItems: 'center', width: 64, marginBottom: 8, borderRadius: 16, marginLeft: 8 },
});
