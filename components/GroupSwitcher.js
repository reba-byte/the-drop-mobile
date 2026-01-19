import { Modal, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native'
import { useGroup } from '../context/GroupContext'

export default function GroupSwitcher({ visible, onClose }) {
  const { groups, selectedGroup, selectGroup } = useGroup()

  function handleSelectGroup(group, member) {
    selectGroup(group, member)
    onClose()
  }

  return (
    <Modal
      visible={visible}
      transparent={true}
      animationType="slide"
      onRequestClose={onClose}
    >
      <View style={styles.modalOverlay}>
        <View style={styles.modalContent}>
          <View style={styles.header}>
            <Text style={styles.title}>Switch Group</Text>
            <TouchableOpacity onPress={onClose} style={styles.closeButton}>
              <Text style={styles.closeButtonText}>✕</Text>
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.groupList}>
            {groups.map((memberRecord) => {
              const group = memberRecord.group
              const isSelected = selectedGroup?.id === group.id
              
              return (
                <TouchableOpacity
                  key={group.id}
                  style={[
                    styles.groupCard,
                    isSelected && styles.groupCardSelected
                  ]}
                  onPress={() => handleSelectGroup(group, memberRecord)}
                >
                  <View style={styles.groupInfo}>
                    <View style={styles.groupHeader}>
                      <Text style={styles.groupName}>{group.name}</Text>
                      {memberRecord.is_curator && (
                        <View style={styles.curatorBadge}>
                          <Text style={styles.curatorBadgeText}>Curator</Text>
                        </View>
                      )}
                    </View>
                    <Text style={styles.groupMeta}>
                      {memberRecord.emoji} {memberRecord.name} • {group.group_type}
                    </Text>
                    <Text style={styles.groupInvite}>Code: {group.invite_code}</Text>
                  </View>
                  {isSelected && (
                    <View style={styles.selectedIcon}>
                      <Text style={styles.selectedIconText}>✓</Text>
                    </View>
                  )}
                </TouchableOpacity>
              )
            })}
          </ScrollView>

          {groups.length === 0 && (
            <View style={styles.emptyState}>
              <Text style={styles.emptyText}>No groups yet</Text>
            </View>
          )}
        </View>
      </View>
    </Modal>
  )
}

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: '#1e293b',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    maxHeight: '80%',
    paddingBottom: 40,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#334155',
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#fff',
  },
  closeButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#334155',
    justifyContent: 'center',
    alignItems: 'center',
  },
  closeButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  groupList: {
    padding: 20,
  },
  groupCard: {
    backgroundColor: '#0f172a',
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: 'transparent',
  },
  groupCardSelected: {
    borderColor: '#10b981',
    backgroundColor: '#064e3b',
  },
  groupInfo: {
    flex: 1,
  },
  groupHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
    gap: 8,
  },
  groupName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#fff',
  },
  curatorBadge: {
    backgroundColor: '#3b82f6',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
  },
  curatorBadgeText: {
    fontSize: 10,
    color: '#fff',
    fontWeight: '600',
  },
  groupMeta: {
    fontSize: 14,
    color: '#94a3b8',
    marginBottom: 4,
  },
  groupInvite: {
    fontSize: 12,
    color: '#64748b',
    fontFamily: 'monospace',
  },
  selectedIcon: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#10b981',
    justifyContent: 'center',
    alignItems: 'center',
  },
  selectedIconText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  emptyState: {
    padding: 40,
    alignItems: 'center',
  },
  emptyText: {
    color: '#64748b',
    fontSize: 16,
  },
})