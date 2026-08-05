import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from 'react-native';
import { useChangePasswordMutation } from '../redux/apiSlice';
import { theme } from '../utils/theme';
import { useConfirmation } from '../components/ConfirmationProvider';

export const ChangePasswordScreen = ({ navigation }: any) => {
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  
  const [changePassword, { isLoading }] = useChangePasswordMutation();
  const { showConfirmation } = useConfirmation();

  const handleSave = async () => {
    if (!currentPassword || !newPassword || !confirmPassword) {
      showConfirmation({
        title: 'Validasi Gagal',
        message: 'Semua kolom kata sandi harus diisi.',
        confirmText: 'OK',
        variant: 'warning',
      });
      return;
    }

    if (newPassword !== confirmPassword) {
      showConfirmation({
        title: 'Validasi Gagal',
        message: 'Kata sandi baru dan konfirmasi kata sandi tidak cocok.',
        confirmText: 'OK',
        variant: 'warning',
      });
      return;
    }

    if (newPassword.length < 6) {
      showConfirmation({
        title: 'Validasi Gagal',
        message: 'Kata sandi baru harus minimal 6 karakter.',
        confirmText: 'OK',
        variant: 'warning',
      });
      return;
    }

    if (currentPassword === newPassword) {
      showConfirmation({
        title: 'Validasi Gagal',
        message: 'Kata sandi baru tidak boleh sama dengan kata sandi saat ini.',
        confirmText: 'OK',
        variant: 'warning',
      });
      return;
    }

    try {
      await changePassword({
        currentPassword,
        newPassword,
        confirmPassword,
      }).unwrap();

      showConfirmation({
        title: 'Berhasil',
        message: 'Kata sandi Anda berhasil diperbarui.',
        confirmText: 'OK',
        variant: 'success',
        onConfirm: () => {
          navigation.goBack();
        },
      });
    } catch (err: any) {
      showConfirmation({
        title: 'Gagal Memperbarui',
        message: err?.data?.message || 'Gagal mengubah kata sandi. Periksa kembali kata sandi saat ini.',
        confirmText: 'OK',
        variant: 'danger',
      });
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={styles.container}
    >
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.card}>
          <Text style={styles.instructions}>
            Untuk menjaga keamanan akun Anda, silakan ubah kata sandi bawaan atau perbarui kata sandi lama secara berkala.
          </Text>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Kata Sandi Saat Ini</Text>
            <TextInput
              style={styles.input}
              placeholder="Masukkan kata sandi lama"
              placeholderTextColor="#9CA3AF"
              secureTextEntry
              value={currentPassword}
              onChangeText={setCurrentPassword}
              autoCapitalize="none"
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Kata Sandi Baru</Text>
            <TextInput
              style={styles.input}
              placeholder="Masukkan kata sandi baru (min. 6 karakter)"
              placeholderTextColor="#9CA3AF"
              secureTextEntry
              value={newPassword}
              onChangeText={setNewPassword}
              autoCapitalize="none"
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Konfirmasi Kata Sandi Baru</Text>
            <TextInput
              style={styles.input}
              placeholder="Ulangi kata sandi baru"
              placeholderTextColor="#9CA3AF"
              secureTextEntry
              value={confirmPassword}
              onChangeText={setConfirmPassword}
              autoCapitalize="none"
            />
          </View>

          <TouchableOpacity
            style={styles.submitButton}
            onPress={handleSave}
            disabled={isLoading}
            activeOpacity={0.8}
          >
            {isLoading ? (
              <ActivityIndicator color="#FFFFFF" />
            ) : (
              <Text style={styles.submitButtonText}>Simpan Perubahan</Text>
            )}
          </TouchableOpacity>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F9FAFB',
  },
  scrollContent: {
    padding: theme.spacing.lg,
  },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: theme.spacing.lg,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  instructions: {
    fontSize: 14,
    color: '#6B7280',
    lineHeight: 20,
    marginBottom: 24,
  },
  inputGroup: {
    marginBottom: 18,
  },
  label: {
    fontSize: 13,
    fontWeight: '700',
    color: '#374151',
    marginBottom: 8,
  },
  input: {
    height: 48,
    borderWidth: 1,
    borderColor: '#D1D5DB',
    borderRadius: 10,
    paddingHorizontal: 14,
    fontSize: 15,
    color: '#1F2937',
    backgroundColor: '#F9FAFB',
  },
  submitButton: {
    backgroundColor: '#0F5936',
    height: 48,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 12,
  },
  submitButtonText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '700',
  },
});

export default ChangePasswordScreen;
