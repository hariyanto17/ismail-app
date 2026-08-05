import React, { useState } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, Modal, TextInput } from 'react-native';
import {
  useGetUsersQuery,
  useCreateUserMutation,
  useUpdateUserMutation,
  useDeleteUserMutation,
} from '../redux/apiSlice';
import { theme } from '../utils/theme';
import Button from '../components/Button';
import { useConfirmation } from '../components/ConfirmationProvider';

export const UsersScreen = () => {
  const { data: usersRes, isLoading } = useGetUsersQuery(undefined);
  const [createUser] = useCreateUserMutation();
  const [updateUser] = useUpdateUserMutation();
  const [deleteUser] = useDeleteUserMutation();
  const { showConfirmation } = useConfirmation();

  const [modalVisible, setModalVisible] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  // Form fields
  const [username, setUsername] = useState('');
  const [fullName, setFullName] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState<'ADMIN' | 'CASHIER'>('CASHIER');
  const [isActive, setIsActive] = useState(true);


  const users = usersRes?.data || [];

  const handleOpenAdd = () => {
    setEditingId(null);
    setUsername('');
    setFullName('');
    setPassword('');
    setRole('CASHIER');
    setIsActive(true);
    setModalVisible(true);
  };

  const handleOpenEdit = (user: any) => {
    setEditingId(user.id);
    setUsername(user.username);
    setFullName(user.full_name);
    setPassword('');
    setRole(user.role);
    setIsActive(user.is_active !== false);
    setModalVisible(true);
  };

  const handleSave = async () => {
    if (!username.trim() || !fullName.trim()) {
      showConfirmation({
        title: 'Kesalahan Validasi',
        message: 'Username dan Nama Lengkap wajib diisi',
        confirmText: 'OK',
        variant: 'warning',
      });
      return;
    }

    if (!editingId && !password) {
      showConfirmation({
        title: 'Kesalahan Validasi',
        message: 'Kata sandi wajib diisi untuk pengguna baru',
        confirmText: 'OK',
        variant: 'warning',
      });
      return;
    }

    try {
      const payload: any = {
        username,
        full_name: fullName,
        role,
        is_active: isActive,
      };

      if (password) {
        payload.password = password;
      }

      if (editingId) {
        await updateUser({ id: editingId, ...payload }).unwrap();
      } else {
        await createUser(payload).unwrap();
      }
      setModalVisible(false);
    } catch (err: any) {
      showConfirmation({
        title: 'Gagal Menyimpan',
        message: err?.data?.message || 'Terjadi kesalahan',
        confirmText: 'OK',
        variant: 'danger',
      });
    }
  };

  const handleDelete = (id: string) => {
    showConfirmation({
      title: 'Konfirmasi Hapus',
      message: 'Apakah Anda yakin ingin menghapus profil pengguna ini?',
      confirmText: 'Hapus',
      cancelText: 'Batal',
      variant: 'danger',
      onConfirm: async () => {
        try {
          await deleteUser(id).unwrap();
        } catch (err: any) {
          showConfirmation({
            title: 'Gagal Menghapus',
            message: err?.data?.message || 'Terjadi kesalahan',
            confirmText: 'OK',
            variant: 'danger',
          });
        }
      },
    });
  };

  return (
    <View style={styles.container}>
      <View style={styles.topHeader}>
        <Text style={styles.title}>Pengguna</Text>
        <TouchableOpacity style={styles.addBtn} onPress={handleOpenAdd}>
          <Text style={styles.addBtnText}>+ Tambah</Text>
        </TouchableOpacity>
      </View>

      {isLoading ? (
        <Text style={styles.loadingText}>Memuat pengguna...</Text>
      ) : (
        <FlatList
          data={users}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.listContainer}
          renderItem={({ item }) => (
            <View style={styles.itemRow}>
              <View style={styles.userInfo}>
                <Text style={styles.itemName}>{item.full_name}</Text>
                <Text style={styles.itemMeta}>
                  @{item.username} • {item.role} • {item.is_active !== false ? 'Aktif' : 'Nonaktif'}
                </Text>
              </View>
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
            <Text style={styles.modalTitle}>{editingId ? 'Ubah Pengguna' : 'Pengguna Baru'}</Text>
            
            <TextInput
              style={styles.input}
              placeholder="Username"
              placeholderTextColor={theme.colors.textMuted}
              value={username}
              onChangeText={setUsername}
              autoCapitalize="none"
            />

            <TextInput
              style={styles.input}
              placeholder="Nama Lengkap"
              placeholderTextColor={theme.colors.textMuted}
              value={fullName}
              onChangeText={setFullName}
            />

            <TextInput
              style={styles.input}
              placeholder={editingId ? 'Kata Sandi Baru (opsional)' : 'Kata Sandi'}
              placeholderTextColor={theme.colors.textMuted}
              secureTextEntry
              value={password}
              onChangeText={setPassword}
              autoCapitalize="none"
            />

            <Text style={styles.label}>Pilih Peran</Text>
            <View style={styles.roleContainer}>
              <TouchableOpacity
                style={[styles.roleBtn, role === 'CASHIER' ? styles.roleBtnSelected : null]}
                onPress={() => setRole('CASHIER')}
              >
                <Text style={[styles.roleTextLabel, role === 'CASHIER' ? styles.roleTextSelected : null]}>
                  Kasir
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.roleBtn, role === 'ADMIN' ? styles.roleBtnSelected : null]}
                onPress={() => setRole('ADMIN')}
              >
                <Text style={[styles.roleTextLabel, role === 'ADMIN' ? styles.roleTextSelected : null]}>
                  Admin
                </Text>
              </TouchableOpacity>
            </View>

            <Text style={styles.label}>Status Pengguna</Text>
            <View style={styles.roleContainer}>
              <TouchableOpacity
                style={[styles.roleBtn, isActive ? styles.roleBtnSelected : null]}
                onPress={() => setIsActive(true)}
              >
                <Text style={[styles.roleTextLabel, isActive ? styles.roleTextSelected : null]}>
                  Aktif
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.roleBtn, !isActive ? styles.roleBtnSelected : null]}
                onPress={() => setIsActive(false)}
              >
                <Text style={[styles.roleTextLabel, !isActive ? styles.roleTextSelected : null]}>
                  Nonaktif
                </Text>
              </TouchableOpacity>
            </View>

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
  userInfo: {
    flex: 1,
  },
  itemName: {
    color: theme.colors.text,
    fontSize: 16,
    fontWeight: '600',
  },
  itemMeta: {
    color: theme.colors.textMuted,
    fontSize: 12,
    marginTop: 2,
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
    width: '85%',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: theme.colors.text,
    marginBottom: theme.spacing.md,
  },
  label: {
    color: theme.colors.text,
    fontSize: 14,
    fontWeight: '600',
    marginBottom: theme.spacing.xs,
    marginTop: theme.spacing.xs,
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
    marginBottom: theme.spacing.sm,
  },
  roleContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: theme.spacing.md,
  },
  roleBtn: {
    width: '48%',
    backgroundColor: theme.colors.surfaceLight,
    paddingVertical: theme.spacing.sm,
    borderRadius: theme.borderRadius.md,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'transparent',
  },
  roleBtnSelected: {
    backgroundColor: theme.colors.primary,
    borderColor: theme.colors.text,
  },
  roleTextLabel: {
    color: theme.colors.textMuted,
    fontSize: 14,
    fontWeight: '600',
  },
  roleTextSelected: {
    color: theme.colors.text,
  },
  modalActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  halfBtn: {
    width: '48%',
  },
});
export default UsersScreen;
