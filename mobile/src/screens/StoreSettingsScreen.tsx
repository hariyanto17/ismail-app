import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Modal,
  TextInput,
  Switch,
  ActivityIndicator,
} from 'react-native';
import { useSelector } from 'react-redux';
import { RootState } from '../redux/store';
import {
  useGetSettingsQuery,
  useUpdateSettingsMutation,
  useGetReportRecipientsQuery,
  useCreateReportRecipientMutation,
  useUpdateReportRecipientMutation,
  useDeleteReportRecipientMutation,
} from '../redux/apiSlice';
import { theme } from '../utils/theme';
import Button from '../components/Button';
import { UserIcon } from '../components/Icons';
import { useConfirmation } from '../components/ConfirmationProvider';

export const StoreSettingsScreen = () => {
  const { showConfirmation } = useConfirmation();
  const { user } = useSelector((state: RootState) => state.auth);
  const isAdmin = user?.role === 'ADMIN';

  // Settings Queries
  const { data: settingsResponse, isLoading: settingsLoading } = useGetSettingsQuery(undefined);
  const [updateSettings, { isLoading: isUpdatingSettings }] = useUpdateSettingsMutation();

  // Recipients Queries
  const { data: recipientsResponse, isLoading: recipientsLoading } = useGetReportRecipientsQuery(undefined);
  const [createRecipient] = useCreateReportRecipientMutation();
  const [updateRecipient] = useUpdateReportRecipientMutation();
  const [deleteRecipient] = useDeleteReportRecipientMutation();

  const recipients = recipientsResponse?.data || [];
  const settings = settingsResponse?.data || {};

  // Store Settings Form States
  const [storeName, setStoreName] = useState('');
  const [storeAddress, setStoreAddress] = useState('');
  const [storePhone, setStorePhone] = useState('');
  const [instagram, setInstagram] = useState('');
  const [openingTime, setOpeningTime] = useState('09:00');
  const [closingTime, setClosingTime] = useState('23:00');
  const [closingDay, setClosingDay] = useState(25);
  const [timezone, setTimezone] = useState('Asia/Makassar');

  // Load settings into state
  useEffect(() => {
    if (settingsResponse?.data) {
      const s = settingsResponse.data;
      setStoreName(s.store_name || '');
      setStoreAddress(s.store_address || '');
      setStorePhone(s.store_phone || '');
      setInstagram(s.instagram || '');
      setOpeningTime(s.opening_time || '09:00');
      setClosingTime(s.closing_time || '23:00');
      setClosingDay(s.closing_day || 25);
      setTimezone(s.timezone || 'Asia/Makassar');
    }
  }, [settingsResponse]);

  // Recipient Modal States
  const [recModalVisible, setRecModalVisible] = useState(false);
  const [editingRecId, setEditingRecId] = useState<string | null>(null);
  const [recName, setRecName] = useState('');
  const [recPhone, setRecPhone] = useState('');
  const [recReportType, setRecReportType] = useState<'DAILY' | 'CLOSING' | 'ALL'>('ALL');
  const [recIsActive, setRecIsActive] = useState(true);
  const [recErrors, setRecErrors] = useState<{ name?: string; phone?: string }>({});

  // Custom Time Picker Modal States
  const [timePickerTarget, setTimePickerTarget] = useState<'OPENING' | 'CLOSING' | null>(null);
  const [tempHour, setTempHour] = useState('09');
  const [tempMin, setTempMin] = useState('00');

  // Custom Closing Day Selector Modal States
  const [dayPickerVisible, setDayPickerVisible] = useState(false);

  // Time options (24h)
  const hours = Array.from({ length: 24 }, (_, i) => String(i).padStart(2, '0'));
  const minutes = ['00', '05', '10', '15', '20', '25', '30', '35', '40', '45', '50', '55'];

  const handleSaveSettings = async () => {
    if (!isAdmin) return;
    try {
      await updateSettings({
        store_name: storeName,
        store_address: storeAddress,
        store_phone: storePhone,
        instagram,
        opening_time: openingTime,
        closing_time: closingTime,
        closing_day: closingDay,
        timezone,
      }).unwrap();
      showConfirmation({
        title: 'Sukses',
        message: 'Pengaturan toko berhasil disimpan',
        confirmText: 'OK',
        variant: 'success',
      });
    } catch (err: any) {
      showConfirmation({
        title: 'Kesalahan',
        message: err?.data?.message || 'Gagal menyimpan pengaturan',
        confirmText: 'OK',
        variant: 'danger',
      });
    }
  };

  const handleOpenAddRecipient = () => {
    if (!isAdmin) return;
    setEditingRecId(null);
    setRecName('');
    setRecPhone('');
    setRecReportType('ALL');
    setRecIsActive(true);
    setRecErrors({});
    setRecModalVisible(true);
  };

  const handleOpenEditRecipient = (rec: any) => {
    if (!isAdmin) return;
    setEditingRecId(rec.id);
    setRecName(rec.name);
    setRecPhone(rec.phone);
    setRecReportType(rec.report_type);
    setRecIsActive(rec.is_active);
    setRecErrors({});
    setRecModalVisible(true);
  };

  const validateRecipient = () => {
    const newErrors: { name?: string; phone?: string } = {};
    if (!recName.trim()) {
      newErrors.name = 'Nama penerima wajib diisi';
    }
    const cleanPhone = recPhone.trim();
    if (!cleanPhone) {
      newErrors.phone = 'Nomor telepon wajib diisi';
    } else if (!/^62\d+$/.test(cleanPhone)) {
      newErrors.phone = 'Nomor telepon harus diawali 62 tanpa spasi, tanda + atau -';
    }
    setRecErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSaveRecipient = async () => {
    if (!validateRecipient()) return;
    const payload = {
      name: recName.trim(),
      phone: recPhone.trim(),
      report_type: recReportType,
      is_active: recIsActive,
    };
    try {
      if (editingRecId) {
        await updateRecipient({ id: editingRecId, ...payload }).unwrap();
        showConfirmation({
          title: 'Sukses',
          message: 'Penerima berhasil diubah',
          confirmText: 'OK',
          variant: 'success',
        });
      } else {
        const response = await createRecipient(payload).unwrap();
        console.log('RESPONSE', response);
        showConfirmation({
          title: 'Sukses',
          message: 'Penerima berhasil ditambahkan',
          confirmText: 'OK',
          variant: 'success',
        });
      }
      setRecModalVisible(false);
    } catch (err: any) {
      showConfirmation({
        title: 'Kesalahan',
        message: err?.data?.message || 'Gagal menyimpan penerima',
        confirmText: 'OK',
        variant: 'danger',
      });
    }
  };

  const handleToggleRecipient = async (rec: any, newVal: boolean) => {
    if (!isAdmin) return;
    try {
      await updateRecipient({
        id: rec.id,
        name: rec.name,
        phone: rec.phone,
        report_type: rec.report_type,
        is_active: newVal,
      }).unwrap();
    } catch (err) {
      showConfirmation({
        title: 'Kesalahan',
        message: 'Gagal mengubah status aktif',
        confirmText: 'OK',
        variant: 'danger',
      });
    }
  };

  const handleDeleteRecipient = (id: string) => {
    if (!isAdmin) return;
    showConfirmation({
      title: 'Hapus Penerima',
      message: 'Apakah Anda yakin ingin menghapus penerima laporan ini?',
      confirmText: 'Hapus',
      cancelText: 'Batal',
      variant: 'danger',
      onConfirm: async () => {
        try {
          await deleteRecipient(id).unwrap();
          showConfirmation({
            title: 'Sukses',
            message: 'Penerima berhasil dihapus',
            confirmText: 'OK',
            variant: 'success',
          });
        } catch (err) {
          showConfirmation({
            title: 'Kesalahan',
            message: 'Gagal menghapus penerima',
            confirmText: 'OK',
            variant: 'danger',
          });
        }
      },
    });
  };

  const openTimePicker = (target: 'OPENING' | 'CLOSING') => {
    if (!isAdmin) return;
    const timeStr = target === 'OPENING' ? openingTime : closingTime;
    const [h, m] = timeStr.split(':');
    setTempHour(h || '09');
    setTempMin(m || '00');
    setTimePickerTarget(target);
  };

  const saveTimePicker = () => {
    const timeStr = `${tempHour}:${tempMin}`;
    if (timePickerTarget === 'OPENING') {
      setOpeningTime(timeStr);
    } else {
      setClosingTime(timeStr);
    }
    setTimePickerTarget(null);
  };

  const getPeriodDescription = (day: number) => {
    if (day === 31) {
      return `1 Current Month\n↓\n31 Current Month`;
    }
    return `${day + 1} Previous Month\n↓\n${day} Current Month`;
  };

  const isLoading = settingsLoading || recipientsLoading;

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <View>
          <Text style={styles.headerTitle}>Pengaturan Toko</Text>
          <Text style={styles.headerSub}>Kelola detail POS, jam operasional, dan penerima laporan</Text>
        </View>
        {isAdmin && (
          <TouchableOpacity style={styles.saveHeaderBtn} onPress={handleSaveSettings} disabled={isUpdatingSettings}>
            {isUpdatingSettings ? (
              <ActivityIndicator size="small" color="#FFF" />
            ) : (
              <Text style={styles.saveHeaderBtnText}>Simpan</Text>
            )}
          </TouchableOpacity>
        )}
      </View>

      {isLoading ? (
        <View style={styles.loader}>
          <ActivityIndicator size="large" color="#0F5936" />
        </View>
      ) : (
        <ScrollView contentContainerStyle={styles.scrollContent}>
          {/* Card 1: Store Information */}
          <View style={styles.sectionCard}>
            <Text style={styles.cardHeader}>Informasi Toko</Text>
            <View style={styles.cardBody}>
              <Text style={styles.fieldLabel}>Nama Toko</Text>
              <TextInput
                style={[styles.inputField, !isAdmin ? styles.disabledInput : null]}
                value={storeName}
                onChangeText={setStoreName}
                editable={isAdmin}
                placeholder="Nama Toko"
              />

              <Text style={[styles.fieldLabel, { marginTop: 12 }]}>Alamat Toko</Text>
              <TextInput
                style={[styles.inputField, !isAdmin ? styles.disabledInput : null, { height: 70, textAlignVertical: 'top', paddingTop: 10 }]}
                value={storeAddress}
                onChangeText={setStoreAddress}
                editable={isAdmin}
                multiline
                placeholder="Alamat Toko"
              />

              <Text style={[styles.fieldLabel, { marginTop: 12 }]}>Telepon Toko</Text>
              <TextInput
                style={[styles.inputField, !isAdmin ? styles.disabledInput : null]}
                value={storePhone}
                onChangeText={setStorePhone}
                editable={isAdmin}
                keyboardType="phone-pad"
                placeholder="Nomor Telepon"
              />

              <Text style={[styles.fieldLabel, { marginTop: 12 }]}>Akun Instagram</Text>
              <TextInput
                style={[styles.inputField, !isAdmin ? styles.disabledInput : null]}
                value={instagram}
                onChangeText={setInstagram}
                editable={isAdmin}
                placeholder="@instagram"
              />
            </View>
          </View>

          {/* Card 2: Business Hours */}
          <View style={styles.sectionCard}>
            <Text style={styles.cardHeader}>Jam Operasional</Text>
            <View style={styles.cardBody}>
              <View style={styles.rowLayout}>
                <View style={{ flex: 1, marginRight: 8 }}>
                  <Text style={styles.fieldLabel}>Jam Buka</Text>
                  <TouchableOpacity
                    style={[styles.pickerTrigger, !isAdmin ? styles.disabledTrigger : null]}
                    onPress={() => openTimePicker('OPENING')}
                    disabled={!isAdmin}
                  >
                    <Text style={styles.pickerTriggerText}>{openingTime}</Text>
                  </TouchableOpacity>
                </View>

                <View style={{ flex: 1, marginLeft: 8 }}>
                  <Text style={styles.fieldLabel}>Jam Tutup</Text>
                  <TouchableOpacity
                    style={[styles.pickerTrigger, !isAdmin ? styles.disabledTrigger : null]}
                    onPress={() => openTimePicker('CLOSING')}
                    disabled={!isAdmin}
                  >
                    <Text style={styles.pickerTriggerText}>{closingTime}</Text>
                  </TouchableOpacity>
                </View>
              </View>
            </View>
          </View>

          {/* Card 3: Business Period */}
          <View style={styles.sectionCard}>
            <Text style={styles.cardHeader}>Periode Bisnis</Text>
            <View style={styles.cardBody}>
              <Text style={styles.fieldLabel}>Hari Tutup</Text>
              <TouchableOpacity
                style={[styles.pickerTrigger, !isAdmin ? styles.disabledTrigger : null]}
                onPress={() => isAdmin && setDayPickerVisible(true)}
                disabled={!isAdmin}
              >
                <Text style={styles.pickerTriggerText}>{closingDay}</Text>
              </TouchableOpacity>

              <View style={styles.helperBox}>
                <Text style={styles.helperHeader}>Rentang Periode:</Text>
                <Text style={styles.helperText}>{getPeriodDescription(closingDay)}</Text>
              </View>
            </View>
          </View>

          {/* Card 4: Timezone */}
          <View style={styles.sectionCard}>
            <Text style={styles.cardHeader}>Zona Waktu</Text>
            <View style={styles.cardBody}>
              <Text style={styles.fieldLabel}>Nama Zona Waktu</Text>
              <TextInput
                style={[styles.inputField, styles.disabledInput]}
                value={timezone}
                editable={false}
              />
            </View>
          </View>

          {/* Card 5: Report Recipients */}
          <View style={styles.sectionCard}>
            <View style={styles.recipientHeaderRow}>
              <Text style={styles.cardHeader}>Penerima Laporan</Text>
              {isAdmin && (
                <TouchableOpacity style={styles.addRecBtn} onPress={handleOpenAddRecipient}>
                  <Text style={styles.addRecBtnText}>+ Tambah</Text>
                </TouchableOpacity>
              )}
            </View>

            <View style={styles.cardBody}>
              {recipients.length === 0 ? (
                <Text style={styles.noRecipientsText}>Belum ada penerima laporan yang terdaftar.</Text>
              ) : (
                recipients.map((rec: any) => (
                  <View key={rec.id} style={styles.recipientRow}>
                    <View style={{ flex: 1 }}>
                      <Text style={styles.recName}>{rec.name}</Text>
                      <Text style={styles.recPhone}>{rec.phone}</Text>
                      <View style={styles.recBadges}>
                        <View style={styles.badgeChip}>
                          <Text style={styles.badgeChipText}>{rec.report_type}</Text>
                        </View>
                        <View style={[styles.badgeChip, rec.is_active ? styles.badgeChipActive : styles.badgeChipInactive]}>
                          <Text style={styles.badgeChipText}>{rec.is_active ? 'Aktif' : 'Tidak Aktif'}</Text>
                        </View>
                      </View>
                    </View>

                    <View style={styles.recActions}>
                      {isAdmin ? (
                        <>
                          <Switch
                            value={rec.is_active}
                            onValueChange={(val) => handleToggleRecipient(rec, val)}
                            thumbColor={rec.is_active ? '#0F5936' : '#9CA3AF'}
                            trackColor={{ false: '#E5E7EB', true: '#EAF5EF' }}
                          />
                          <TouchableOpacity onPress={() => handleOpenEditRecipient(rec)}>
                            <Text style={styles.recEditBtnText}>Ubah</Text>
                          </TouchableOpacity>
                          <TouchableOpacity onPress={() => handleDeleteRecipient(rec.id)}>
                            <Text style={styles.recDeleteBtnText}>Hapus</Text>
                          </TouchableOpacity>
                        </>
                      ) : (
                        <View style={[styles.badgeChip, rec.is_active ? styles.badgeChipActive : styles.badgeChipInactive]}>
                          <Text style={styles.badgeChipText}>{rec.is_active ? 'AKTIF' : 'NONAKTIF'}</Text>
                        </View>
                      )}
                    </View>
                  </View>
                ))
              )}
            </View>
          </View>
        </ScrollView>
      )}

      {/* Recipient Add/Edit Modal */}
      <Modal visible={recModalVisible} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>{editingRecId ? 'Ubah Penerima' : 'Tambah Penerima'}</Text>
              <TouchableOpacity onPress={() => setRecModalVisible(false)}>
                <Text style={styles.modalCloseText}>✕</Text>
              </TouchableOpacity>
            </View>

            <ScrollView>
              <Text style={styles.fieldLabel}>Nama</Text>
              <TextInput
                style={[styles.inputField, recErrors.name ? styles.inputError : null]}
                placeholder="Nama penerima"
                placeholderTextColor="#9CA3AF"
                value={recName}
                onChangeText={setRecName}
              />
              {recErrors.name && <Text style={styles.errorText}>{recErrors.name}</Text>}

              <Text style={styles.fieldLabel}>Nomor Telepon (diawali 62)</Text>
              <TextInput
                style={[styles.inputField, recErrors.phone ? styles.inputError : null]}
                placeholder="628xxxx"
                placeholderTextColor="#9CA3AF"
                keyboardType="phone-pad"
                value={recPhone}
                onChangeText={setRecPhone}
              />
              {recErrors.phone && <Text style={styles.errorText}>{recErrors.phone}</Text>}

              <Text style={[styles.fieldLabel, { marginTop: 12 }]}>Jenis Laporan</Text>
              <View style={styles.typeSelectorRow}>
                {(['DAILY', 'CLOSING', 'ALL'] as const).map((type) => (
                  <TouchableOpacity
                    key={type}
                    style={[styles.typeTab, recReportType === type ? styles.typeTabSelected : null]}
                    onPress={() => setRecReportType(type)}
                  >
                    <Text style={[styles.typeTabText, recReportType === type ? styles.typeTabTextSelected : null]}>
                      {type}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>

              <View style={styles.switchRow}>
                <Text style={styles.fieldLabel}>Status</Text>
                <Switch
                  value={recIsActive}
                  onValueChange={setRecIsActive}
                  thumbColor={recIsActive ? '#0F5936' : '#9CA3AF'}
                  trackColor={{ false: '#E5E7EB', true: '#EAF5EF' }}
                />
              </View>

              <View style={styles.modalActions}>
                <Button title="Simpan" onPress={handleSaveRecipient} style={{ marginBottom: 8 }} />
                <Button title="Batal" onPress={() => setRecModalVisible(false)} variant="secondary" />
              </View>
            </ScrollView>
          </View>
        </View>
      </Modal>

      {/* Custom Time Picker Modal */}
      <Modal visible={timePickerTarget !== null} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={styles.pickerCard}>
            <Text style={styles.pickerCardHeader}>
              Pilih Jam {timePickerTarget === 'OPENING' ? 'Buka' : 'Tutup'}
            </Text>

            <View style={styles.timeSelectContainer}>
              {/* Hours Column */}
              <View style={styles.timeColumn}>
                <Text style={styles.columnHeader}>Jam</Text>
                <ScrollView style={{ height: 180 }} showsVerticalScrollIndicator={false}>
                  {hours.map((h) => (
                    <TouchableOpacity
                      key={h}
                      style={[styles.timeOption, tempHour === h ? styles.timeOptionSelected : null]}
                      onPress={() => setTempHour(h)}
                    >
                      <Text style={[styles.timeOptionText, tempHour === h ? styles.timeOptionTextSelected : null]}>
                        {h}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </ScrollView>
              </View>

              <Text style={styles.timeDivider}>:</Text>

              {/* Minutes Column */}
              <View style={styles.timeColumn}>
                <Text style={styles.columnHeader}>Menit</Text>
                <ScrollView style={{ height: 180 }} showsVerticalScrollIndicator={false}>
                  {minutes.map((m) => (
                    <TouchableOpacity
                      key={m}
                      style={[styles.timeOption, tempMin === m ? styles.timeOptionSelected : null]}
                      onPress={() => setTempMin(m)}
                    >
                      <Text style={[styles.timeOptionText, tempMin === m ? styles.timeOptionTextSelected : null]}>
                        {m}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </ScrollView>
              </View>
            </View>

            <View style={styles.pickerActions}>
              <TouchableOpacity style={styles.pickerConfirmBtn} onPress={saveTimePicker}>
                <Text style={styles.pickerConfirmText}>OK</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.pickerCancelBtn} onPress={() => setTimePickerTarget(null)}>
                <Text style={styles.pickerCancelText}>Batal</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* Custom Closing Day Selector Modal */}
      <Modal visible={dayPickerVisible} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={styles.pickerCard}>
            <Text style={styles.pickerCardHeader}>Pilih Hari Tutup</Text>

            <View style={styles.dayGridContainer}>
              {Array.from({ length: 31 }, (_, i) => i + 1).map((day) => (
                <TouchableOpacity
                  key={day}
                  style={[styles.dayGridItem, closingDay === day ? styles.dayGridItemSelected : null]}
                  onPress={() => {
                    setClosingDay(day);
                    setDayPickerVisible(false);
                  }}
                >
                  <Text style={[styles.dayGridText, closingDay === day ? styles.dayGridTextSelected : null]}>
                    {day}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            <TouchableOpacity style={styles.pickerCancelBtn} onPress={() => setDayPickerVisible(false)}>
              <Text style={styles.pickerCancelText}>Batal</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F9FAFB',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#FFFFFF',
    paddingHorizontal: theme.spacing.lg,
    paddingTop: 50,
    paddingBottom: theme.spacing.md,
    borderBottomWidth: 1,
    borderColor: '#E5E7EB',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: '#1F2937',
  },
  headerSub: {
    fontSize: 11,
    color: '#6B7280',
    marginTop: 2,
  },
  saveHeaderBtn: {
    backgroundColor: '#0F5936',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 12,
  },
  saveHeaderBtnText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '700',
  },
  loader: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  scrollContent: {
    padding: theme.spacing.md,
    paddingBottom: 40,
  },
  sectionCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: theme.spacing.lg,
    marginBottom: theme.spacing.md,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.03,
    shadowRadius: 6,
    elevation: 1,
  },
  cardHeader: {
    fontSize: 16,
    fontWeight: '800',
    color: '#1F2937',
    marginBottom: theme.spacing.md,
  },
  cardBody: {
    width: '100%',
  },
  fieldLabel: {
    fontSize: 13,
    fontWeight: '700',
    color: '#374151',
    marginBottom: 6,
  },
  inputField: {
    backgroundColor: '#F9FAFB',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 12,
    paddingHorizontal: 12,
    height: 46,
    fontSize: 14,
    color: '#1F2937',
  },
  disabledInput: {
    backgroundColor: '#F3F4F6',
    color: '#9CA3AF',
  },
  rowLayout: {
    flexDirection: 'row',
  },
  pickerTrigger: {
    backgroundColor: '#F9FAFB',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 12,
    height: 46,
    justifyContent: 'center',
    paddingHorizontal: 12,
  },
  disabledTrigger: {
    backgroundColor: '#F3F4F6',
  },
  pickerTriggerText: {
    fontSize: 14,
    color: '#1F2937',
    fontWeight: '600',
  },
  helperBox: {
    backgroundColor: '#F9FAFB',
    borderRadius: 12,
    padding: theme.spacing.md,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    marginTop: 12,
  },
  helperHeader: {
    fontSize: 12,
    fontWeight: '700',
    color: '#0F5936',
    marginBottom: 4,
  },
  helperText: {
    fontSize: 12,
    color: '#4B5563',
    lineHeight: 18,
    fontWeight: '500',
  },
  recipientHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: theme.spacing.md,
  },
  addRecBtn: {
    backgroundColor: '#EAF5EF',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
  },
  addRecBtnText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#0F5936',
  },
  noRecipientsText: {
    fontSize: 13,
    color: '#9CA3AF',
    textAlign: 'center',
    paddingVertical: 20,
  },
  recipientRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderColor: '#F3F4F6',
  },
  recName: {
    fontSize: 14,
    fontWeight: '700',
    color: '#1F2937',
  },
  recPhone: {
    fontSize: 12,
    color: '#6B7280',
    marginTop: 2,
  },
  recBadges: {
    flexDirection: 'row',
    gap: 6,
    marginTop: 6,
  },
  badgeChip: {
    backgroundColor: '#F3F4F6',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 6,
  },
  badgeChipActive: {
    backgroundColor: '#EAF5EF',
  },
  badgeChipInactive: {
    backgroundColor: '#FEE2E2',
  },
  badgeChipText: {
    fontSize: 10,
    fontWeight: '700',
    color: '#4B5563',
  },
  recActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  recEditBtnText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#3B82F6',
  },
  recDeleteBtnText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#DC2626',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    padding: theme.spacing.lg,
  },
  modalContent: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: theme.spacing.lg,
    maxHeight: '90%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: theme.spacing.md,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1F2937',
  },
  modalCloseText: {
    fontSize: 18,
    color: '#9CA3AF',
  },
  inputError: {
    borderColor: '#DC2626',
  },
  errorText: {
    fontSize: 11,
    color: '#DC2626',
    marginTop: 4,
  },
  typeSelectorRow: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 12,
  },
  typeTab: {
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 6,
    backgroundColor: '#FFFFFF',
  },
  typeTabSelected: {
    backgroundColor: '#EAF5EF',
    borderColor: '#0F5936',
  },
  typeTabText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#4B5563',
  },
  typeTabTextSelected: {
    color: '#0F5936',
  },
  switchRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginVertical: 12,
  },
  modalActions: {
    marginTop: 16,
  },
  pickerCard: {
    width: '100%',
    maxWidth: 320,
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: theme.spacing.lg,
    alignItems: 'center',
    alignSelf: 'center',
  },
  pickerCardHeader: {
    fontSize: 16,
    fontWeight: '800',
    color: '#1F2937',
    marginBottom: 16,
    textAlign: 'center',
  },
  timeSelectContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%',
    marginBottom: 16,
  },
  timeColumn: {
    flex: 1,
    alignItems: 'center',
  },
  columnHeader: {
    fontSize: 11,
    fontWeight: '700',
    color: '#9CA3AF',
    marginBottom: 8,
    textTransform: 'uppercase',
  },
  timeOption: {
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 8,
    marginVertical: 2,
    width: 60,
    alignItems: 'center',
  },
  timeOptionSelected: {
    backgroundColor: '#EAF5EF',
  },
  timeOptionText: {
    fontSize: 15,
    fontWeight: '500',
    color: '#4B5563',
  },
  timeOptionTextSelected: {
    color: '#0F5936',
    fontWeight: '700',
  },
  timeDivider: {
    fontSize: 24,
    fontWeight: '700',
    color: '#9CA3AF',
    marginHorizontal: 12,
    paddingBottom: 20,
  },
  pickerActions: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 8,
    width: '100%',
  },
  pickerConfirmBtn: {
    flex: 1,
    backgroundColor: '#0F5936',
    height: 42,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  pickerConfirmText: {
    color: '#FFFFFF',
    fontWeight: '700',
    fontSize: 14,
  },
  pickerCancelBtn: {
    paddingVertical: 10,
    width: '100%',
    alignItems: 'center',
  },
  pickerCancelText: {
    color: '#DC2626',
    fontWeight: '700',
    fontSize: 14,
  },
  dayGridContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
    justifyContent: 'center',
    marginBottom: 16,
  },
  dayGridItem: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F3F4F6',
  },
  dayGridItemSelected: {
    backgroundColor: '#0F5936',
  },
  dayGridText: {
    fontSize: 13,
    color: '#4B5563',
    fontWeight: '600',
  },
  dayGridTextSelected: {
    color: '#FFFFFF',
    fontWeight: '700',
  },
});

export default StoreSettingsScreen;
