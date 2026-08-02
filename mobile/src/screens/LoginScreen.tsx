import React from 'react';
import { View, Text, StyleSheet, KeyboardAvoidingView, Platform, ScrollView, Alert } from 'react-native';
import { useForm, Controller } from 'react-hook-form';
import { useDispatch } from 'react-redux';
import { useLoginMutation } from '../redux/apiSlice';
import { setCredentials } from '../redux/authSlice';
import { theme } from '../utils/theme';
import Input from '../components/Input';
import Button from '../components/Button';

export const LoginScreen = () => {
  const dispatch = useDispatch();
  const [login, { isLoading }] = useLoginMutation();

  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm({
    defaultValues: {
      username: '',
      password: '',
    },
  });

  const onSubmit = async (data: any) => {
    try {
      const response = await login(data).unwrap();
      if (response.success) {
        dispatch(
          setCredentials({
            user: response.data.user,
            token: response.data.accessToken,
            refreshToken: response.data.refreshToken,
          })
        );
      } else {
        Alert.alert('Masuk Gagal', response.message || 'Kesalahan tidak diketahui');
      }
    } catch (err: any) {
      const errMsg = err?.data?.message || 'Tidak dapat terhubung ke server';
      Alert.alert('Kesalahan Masuk', errMsg);
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={styles.container}
    >
      <ScrollView contentContainerStyle={styles.scrollContainer} keyboardShouldPersistTaps="handled">
        <View style={styles.headerContainer}>
          <Text style={styles.logo}>⚡ POS</Text>
          <Text style={styles.title}>Simple POS MVP</Text>
          <Text style={styles.subtitle}>Masuk untuk mulai mengelola penjualan</Text>
        </View>

        <View style={styles.formCard}>
          <Controller
            control={control}
            rules={{ required: 'Username wajib diisi' }}
            name="username"
            render={({ field: { onChange, onBlur, value } }) => (
              <Input
                label="Username"
                placeholder="Masukkan username"
                onBlur={onBlur}
                onChangeText={onChange}
                value={value}
                autoCapitalize="none"
                error={errors.username?.message}
              />
            )}
          />

          <Controller
            control={control}
            rules={{ required: 'Kata sandi wajib diisi' }}
            name="password"
            render={({ field: { onChange, onBlur, value } }) => (
              <Input
                label="Kata Sandi"
                placeholder="Masukkan kata sandi"
                secureTextEntry
                onBlur={onBlur}
                onChangeText={onChange}
                value={value}
                autoCapitalize="none"
                error={errors.password?.message}
              />
            )}
          />

          <Button
            title="Masuk"
            onPress={handleSubmit(onSubmit)}
            isLoading={isLoading}
            style={styles.loginBtn}
          />
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  scrollContainer: {
    flexGrow: 1,
    justifyContent: 'center',
    padding: theme.spacing.lg,
  },
  headerContainer: {
    alignItems: 'center',
    marginBottom: theme.spacing.xl,
  },
  logo: {
    fontSize: 48,
    fontWeight: '800',
    color: theme.colors.primary,
    marginBottom: theme.spacing.xs,
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    color: theme.colors.text,
  },
  subtitle: {
    fontSize: 14,
    color: theme.colors.textMuted,
    marginTop: theme.spacing.xs,
  },
  formCard: {
    backgroundColor: theme.colors.surface,
    padding: theme.spacing.lg,
    borderRadius: theme.borderRadius.lg,
    borderWidth: 1,
    borderColor: theme.colors.border,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 5,
  },
  loginBtn: {
    marginTop: theme.spacing.md,
  },
});
export default LoginScreen;
