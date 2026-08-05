import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity } from 'react-native';
import { theme } from '../utils/theme';
import PrinterService, { BluetoothDevice } from '../services/PrinterService';
import Button from '../components/Button';
import { useConfirmation } from '../components/ConfirmationProvider';

export const SettingsScreen = ({ navigation }: any) => {
  const [devices, setDevices] = useState<BluetoothDevice[]>([]);
  const [loading, setLoading] = useState(false);
  const [connectedDeviceName, setConnectedDeviceName] = useState<string | null>(null);
  const { showConfirmation } = useConfirmation();

  const fetchDevices = async () => {
    setLoading(true);
    try {
      const list = await PrinterService.getPairedDevices();
      setDevices(list);
    } catch (error) {
      showConfirmation({
        title: 'Kesalahan Bluetooth',
        message: 'Gagal mengambil daftar perangkat tersambung.',
        confirmText: 'OK',
        variant: 'danger',
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDevices();
    checkConnection();
  }, []);

  const checkConnection = async () => {
    const connected = await PrinterService.isConnected();
    if (!connected) {
      setConnectedDeviceName(null);
    }
  };

  const handleConnect = async (device: BluetoothDevice) => {
    setLoading(true);
    try {
      const success = await PrinterService.connect(device);
      if (success) {
        setConnectedDeviceName(device.name);
        showConfirmation({
          title: 'Printer Terhubung',
          message: `Berhasil terhubung ke ${device.name}`,
          confirmText: 'OK',
          variant: 'success',
        });
      } else {
        showConfirmation({
          title: 'Koneksi Gagal',
          message: `Tidak dapat terhubung ke ${device.name}`,
          confirmText: 'OK',
          variant: 'danger',
        });
      }
    } catch (error) {
      showConfirmation({
        title: 'Kesalahan Koneksi',
        message: 'Terjadi kesalahan saat menyambungkan.',
        confirmText: 'OK',
        variant: 'danger',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleDisconnect = async () => {
    await PrinterService.disconnect();
    setConnectedDeviceName(null);
    showConfirmation({
      title: 'Terputus',
      message: 'Printer terputus.',
      confirmText: 'OK',
      variant: 'warning',
    });
  };

  const handleTestPrint = async () => {
    setLoading(true);
    try {
      await PrinterService.printTestPage();
      showConfirmation({
        title: 'Sukses',
        message: 'Halaman uji coba berhasil dicetak.',
        confirmText: 'OK',
        variant: 'success',
      });
    } catch (error: any) {
      showConfirmation({
        title: 'Kesalahan Printer',
        message: error?.message || 'Gagal mencetak halaman uji coba.',
        confirmText: 'OK',
        variant: 'danger',
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.topHeader}>
        <Text style={styles.title}>Pengaturan</Text>
      </View>

      <View style={styles.content}>
        <Text style={styles.sectionTitle}>Printer Bluetooth</Text>

        <View style={styles.statusBox}>
          <Text style={styles.statusLabel}>Status Koneksi:</Text>
          <Text style={[styles.statusValue, connectedDeviceName ? styles.connected : styles.disconnected]}>
            {connectedDeviceName ? `Terhubung ke ${connectedDeviceName}` : 'Terputus'}
          </Text>
        </View>

        {connectedDeviceName ? (
          <View style={styles.actionsBox}>
            <Button title={loading ? 'Mencetak...' : 'Cetak Halaman Uji Coba'} onPress={handleTestPrint} variant="secondary" style={styles.btn} disabled={loading} />
            <Button title="Putuskan Printer" onPress={handleDisconnect} variant="danger" style={styles.btn} disabled={loading} />
          </View>
        ) : (
          <View style={styles.pairContainer}>
            <View style={styles.listHeader}>
              <Text style={styles.listTitle}>Perangkat Terpasang</Text>
              <TouchableOpacity onPress={fetchDevices} disabled={loading}>
                <Text style={styles.refreshBtnText}>{loading ? 'Menyegarkan...' : '🔄 Segarkan'}</Text>
              </TouchableOpacity>
            </View>

            <FlatList
              data={devices}
              keyExtractor={(item) => item.address}
              renderItem={({ item }) => (
                <TouchableOpacity
                  style={styles.deviceRow}
                  onPress={() => handleConnect(item)}
                  activeOpacity={0.8}
                >
                  <Text style={styles.deviceName}>{item.name}</Text>
                  <Text style={styles.deviceAddress}>{item.address}</Text>
                </TouchableOpacity>
              )}
              ListEmptyComponent={
                <Text style={styles.emptyText}>Tidak ditemukan perangkat bluetooth yang terpasang.</Text>
              }
            />
          </View>
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  topHeader: {
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
  content: {
    padding: theme.spacing.lg,
    flex: 1,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: theme.colors.textMuted,
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginBottom: theme.spacing.sm,
  },
  statusBox: {
    backgroundColor: theme.colors.surface,
    padding: theme.spacing.md,
    borderRadius: theme.borderRadius.md,
    borderWidth: 1,
    borderColor: theme.colors.border,
    marginBottom: theme.spacing.md,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  statusLabel: {
    color: theme.colors.textMuted,
    fontSize: 14,
  },
  statusValue: {
    fontSize: 14,
    fontWeight: '700',
  },
  connected: {
    color: theme.colors.secondary,
  },
  disconnected: {
    color: theme.colors.danger,
  },
  actionsBox: {
    marginTop: theme.spacing.md,
  },
  btn: {
    marginVertical: theme.spacing.xs,
  },
  pairContainer: {
    flex: 1,
  },
  listHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginVertical: theme.spacing.sm,
  },
  listTitle: {
    color: theme.colors.text,
    fontWeight: '600',
  },
  refreshBtnText: {
    color: theme.colors.primary,
    fontWeight: '600',
  },
  deviceRow: {
    backgroundColor: theme.colors.surface,
    padding: theme.spacing.md,
    borderRadius: theme.borderRadius.md,
    borderWidth: 1,
    borderColor: theme.colors.border,
    marginBottom: theme.spacing.xs,
  },
  deviceName: {
    color: theme.colors.text,
    fontSize: 15,
    fontWeight: '600',
  },
  deviceAddress: {
    color: theme.colors.textMuted,
    fontSize: 12,
    marginTop: 2,
  },
  emptyText: {
    color: theme.colors.textMuted,
    textAlign: 'center',
    marginTop: theme.spacing.xl,
  },
});
export default SettingsScreen;
