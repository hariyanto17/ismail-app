import React, { useState } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, Alert, Modal, TextInput } from 'react-native';
import {
  useGetCategoriesQuery,
  useCreateCategoryMutation,
  useUpdateCategoryMutation,
  useDeleteCategoryMutation,
} from '../redux/apiSlice';
import { theme } from '../utils/theme';
import Button from '../components/Button';

export const CategoriesScreen = () => {
  const { data: response, isLoading } = useGetCategoriesQuery(undefined);
  const [createCategory] = useCreateCategoryMutation();
  const [updateCategory] = useUpdateCategoryMutation();
  const [deleteCategory] = useDeleteCategoryMutation();

  const [modalVisible, setModalVisible] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [categoryName, setCategoryName] = useState('');

  const categories = response?.data || [];

  const handleOpenAdd = () => {
    setEditingId(null);
    setCategoryName('');
    setModalVisible(true);
  };

  const handleOpenEdit = (category: any) => {
    setEditingId(category.id);
    setCategoryName(category.name);
    setModalVisible(true);
  };

  const handleSave = async () => {
    if (!categoryName.trim()) {
      Alert.alert('Kesalahan Validasi', 'Nama kategori tidak boleh kosong');
      return;
    }

    try {
      if (editingId) {
        await updateCategory({ id: editingId, name: categoryName }).unwrap();
      } else {
        await createCategory({ name: categoryName }).unwrap();
      }
      setModalVisible(false);
    } catch (err: any) {
      Alert.alert('Gagal Menyimpan', err?.data?.message || 'Terjadi kesalahan');
    }
  };

  const handleDelete = (id: string) => {
    Alert.alert('Konfirmasi Hapus', 'Apakah Anda yakin ingin menghapus kategori ini?', [
      { text: 'Batal', style: 'cancel' },
      {
        text: 'Hapus',
        style: 'destructive',
        onPress: async () => {
          try {
            await deleteCategory(id).unwrap();
          } catch (err: any) {
            Alert.alert('Gagal Menghapus', err?.data?.message || 'Terjadi kesalahan');
          }
        },
      },
    ]);
  };

  return (
    <View style={styles.container}>
      <View style={styles.topHeader}>
        <Text style={styles.title}>Kategori</Text>
        <TouchableOpacity style={styles.addBtn} onPress={handleOpenAdd}>
          <Text style={styles.addBtnText}>+ Tambah</Text>
        </TouchableOpacity>
      </View>

      {isLoading ? (
        <Text style={styles.loadingText}>Memuat kategori...</Text>
      ) : (
        <FlatList
          data={categories}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.listContainer}
          renderItem={({ item }) => (
            <View style={styles.itemRow}>
              <Text style={styles.itemName}>{item.name}</Text>
              <View style={styles.actions}>
                <TouchableOpacity
                  style={[styles.actionBtn, styles.editBtn]}
                  onPress={() => handleOpenEdit(item)}
                >
                  <Text style={styles.actionText}>Ubah</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.actionBtn, styles.deleteBtn]}
                  onPress={() => handleDelete(item.id)}
                >
                  <Text style={styles.actionText}>Hapus</Text>
                </TouchableOpacity>
              </View>
            </View>
          )}
        />
      )}

      <Modal visible={modalVisible} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>{editingId ? 'Ubah Kategori' : 'Kategori Baru'}</Text>
            <TextInput
              style={styles.input}
              placeholder="Nama Kategori"
              placeholderTextColor={theme.colors.textMuted}
              value={categoryName}
              onChangeText={setCategoryName}
              autoFocus
            />
            <View style={styles.modalActions}>
              <Button
                title="Batal"
                variant="danger"
                onPress={() => setModalVisible(false)}
                style={styles.halfBtn}
              />
              <Button title="Simpan" onPress={handleSave} style={styles.halfBtn} />
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  topHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: theme.spacing.lg,
    paddingTop: 60,
    paddingBottom: theme.spacing.md,
    borderBottomWidth: 1,
    borderColor: theme.colors.border,
  },
  title: {
    fontSize: 22,
    fontWeight: '700',
    color: theme.colors.text,
  },
  addBtn: {
    backgroundColor: theme.colors.primary,
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.sm,
    borderRadius: theme.borderRadius.md,
  },
  addBtnText: {
    color: theme.colors.text,
    fontWeight: '700',
  },
  loadingText: {
    color: theme.colors.textMuted,
    textAlign: 'center',
    marginTop: theme.spacing.xl,
  },
  listContainer: {
    padding: theme.spacing.lg,
  },
  itemRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: theme.colors.surface,
    padding: theme.spacing.md,
    borderRadius: theme.borderRadius.md,
    borderWidth: 1,
    borderColor: theme.colors.border,
    marginBottom: theme.spacing.sm,
  },
  itemName: {
    color: theme.colors.text,
    fontSize: 16,
    fontWeight: '600',
  },
  actions: {
    flexDirection: 'row',
  },
  actionBtn: {
    paddingHorizontal: theme.spacing.sm,
    paddingVertical: 6,
    borderRadius: theme.borderRadius.sm,
    marginLeft: theme.spacing.xs,
  },
  editBtn: {
    backgroundColor: theme.colors.surfaceLight,
  },
  deleteBtn: {
    backgroundColor: theme.colors.danger,
  },
  actionText: {
    color: theme.colors.text,
    fontSize: 12,
    fontWeight: '600',
  },
  modalOverlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(15, 23, 42, 0.85)',
  },
  modalContent: {
    backgroundColor: theme.colors.surface,
    padding: theme.spacing.lg,
    borderRadius: theme.borderRadius.lg,
    borderWidth: 1,
    borderColor: theme.colors.border,
    width: '80%',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: theme.colors.text,
    marginBottom: theme.spacing.md,
  },
  input: {
    backgroundColor: theme.colors.background,
    borderColor: theme.colors.border,
    borderWidth: 1,
    borderRadius: theme.borderRadius.md,
    color: theme.colors.text,
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.sm,
    fontSize: 16,
    marginBottom: theme.spacing.md,
  },
  modalActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  halfBtn: {
    width: '48%',
  },
});
export default CategoriesScreen;
