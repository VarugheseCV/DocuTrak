import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../theme/theme';
import { daysUntil } from '../domain/documents';

export default function EntityDetailScreen({ state, onNavigate, params }) {
  const entity = state.entities.find(e => e.id === params.id);
  
  if (!entity) return null;

  const records = state.documentRecords
    .filter(r => r.entityId === entity.id && r.status === "Active")
    .map(record => ({
      ...record,
      documentType: state.documentTypes.find(dt => dt.id === record.documentTypeId),
      daysRemaining: daysUntil(record.expiryDate)
    }))
    .sort((a, b) => a.daysRemaining - b.daysRemaining);

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => onNavigate("entities")}>
          <Ionicons name="arrow-back" size={24} color={colors.text} />
        </TouchableOpacity>
        <Text style={styles.title}>{entity.name}</Text>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        {records.length === 0 ? (
          <Text style={styles.emptyText}>No documents found for this entity.</Text>
        ) : (
          records.map(item => {
            const isExpired = item.daysRemaining < 0;
            const isExpiringSoon = item.daysRemaining >= 0 && item.daysRemaining <= (state.profile?.alertDays || 30);
            
            let statusColor = colors.success;
            if (isExpired) statusColor = colors.danger;
            else if (isExpiringSoon) statusColor = colors.warning;

            return (
              <TouchableOpacity 
                key={item.id} 
                style={styles.listItem} 
                onPress={() => onNavigate("documentDetail", { id: item.id })}
              >
                <View style={styles.itemLeft}>
                  <Text style={styles.itemName}>{item.documentType?.name || "Document"}</Text>
                  <Text style={[styles.itemDate, { color: statusColor }]}>{item.expiryDate}</Text>
                </View>
                <Ionicons name="chevron-forward" size={20} color={colors.textMuted} />
              </TouchableOpacity>
            );
          })
        )}
      </ScrollView>

      <TouchableOpacity style={styles.fab} onPress={() => onNavigate("addDocument")}>
        <Ionicons name="add" size={30} color={colors.surface} />
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 15,
    backgroundColor: colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  title: { fontSize: 20, fontWeight: 'bold', color: colors.text },
  content: { padding: 16, paddingBottom: 100 },
  emptyText: { textAlign: 'center', marginTop: 40, color: colors.textMuted, fontSize: 16 },
  listItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: colors.surface,
    padding: 16,
    borderRadius: 12,
    marginBottom: 8,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 5,
    shadowOffset: { width: 0, height: 2 },
    elevation: 2,
  },
  itemLeft: { flex: 1 },
  itemName: { fontSize: 16, fontWeight: '600', color: colors.text },
  itemDate: { fontSize: 14, fontWeight: 'bold', marginTop: 4 },
  fab: {
    position: 'absolute',
    bottom: 30,
    right: 20,
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOpacity: 0.3,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 4 },
    elevation: 6,
  }
});
