import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Modal } from 'react-native';
import { theme } from '../utils/theme';
import { LeftIcon, RightIcon, CalendarIcon } from './Icons';

interface DateSelectorProps {
  selectedDate: Date;
  onChange: (date: Date) => void;
  loading?: boolean;
}

export const DateSelector: React.FC<DateSelectorProps> = ({ selectedDate, onChange, loading = false }) => {
  const [pickerVisible, setPickerVisible] = useState(false);
  const [pickerYear, setPickerYear] = useState(selectedDate.getFullYear());
  const [pickerMonth, setPickerMonth] = useState(selectedDate.getMonth()); // 0-11

  const today = new Date();
  
  const getMidnight = (d: Date) => {
    return new Date(d.getFullYear(), d.getMonth(), d.getDate(), 0, 0, 0, 0);
  };

  const isToday = getMidnight(selectedDate).getTime() >= getMidnight(today).getTime();

  const handlePrevDay = () => {
    if (loading) return;
    const newDate = new Date(selectedDate);
    newDate.setDate(newDate.getDate() - 1);
    onChange(newDate);
  };

  const handleNextDay = () => {
    if (loading || isToday) return;
    const newDate = new Date(selectedDate);
    newDate.setDate(newDate.getDate() + 1);
    onChange(newDate);
  };

  const formatIndoDate = (date: Date) => {
    const months = [
      'Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni',
      'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'
    ];
    return `${date.getDate()} ${months[date.getMonth()]} ${date.getFullYear()}`;
  };

  const getMonthName = (monthIdx: number) => {
    const months = [
      'Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni',
      'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'
    ];
    return months[monthIdx];
  };

  const generateDays = () => {
    const firstDay = new Date(pickerYear, pickerMonth, 1);
    let startDayIdx = firstDay.getDay() - 1;
    if (startDayIdx < 0) startDayIdx = 6;
    const totalDays = new Date(pickerYear, pickerMonth + 1, 0).getDate();

    const days = [];
    for (let i = 0; i < startDayIdx; i++) {
      days.push(null);
    }
    for (let i = 1; i <= totalDays; i++) {
      days.push(new Date(pickerYear, pickerMonth, i));
    }
    return days;
  };

  const selectCalendarDay = (date: Date) => {
    onChange(date);
    setPickerVisible(false);
  };

  const handleMonthPrev = () => {
    if (pickerMonth === 0) {
      setPickerMonth(11);
      setPickerYear(pickerYear - 1);
    } else {
      setPickerMonth(pickerMonth - 1);
    }
  };

  const handleMonthNext = () => {
    if (pickerMonth === 11) {
      setPickerMonth(0);
      setPickerYear(pickerYear + 1);
    } else {
      setPickerMonth(pickerMonth + 1);
    }
  };

  const calendarDays = generateDays();
  const weekLabels = ['Se', 'Se', 'Ra', 'Ka', 'Ju', 'Sa', 'Mi'];

  return (
    <View style={styles.container}>
      <View style={styles.selectorCard}>
        <View style={styles.selectorBar}>
          <TouchableOpacity
            style={[styles.arrowButton, loading ? styles.disabled : null]}
            onPress={handlePrevDay}
            disabled={loading}
          >
            <LeftIcon color="#0F5936" size={20} />
          </TouchableOpacity>
          
          <Text style={styles.dateLabel}>{formatIndoDate(selectedDate)}</Text>
          
          <TouchableOpacity
            style={[styles.arrowButton, (loading || isToday) ? styles.disabled : null]}
            onPress={handleNextDay}
            disabled={loading || isToday}
          >
            <RightIcon color={isToday ? '#D1D5DB' : '#0F5936'} size={20} />
          </TouchableOpacity>
        </View>

        <TouchableOpacity
          style={[styles.pickerTrigger, loading ? styles.disabled : null]}
          onPress={() => {
            setPickerYear(selectedDate.getFullYear());
            setPickerMonth(selectedDate.getMonth());
            setPickerVisible(true);
          }}
          disabled={loading}
        >
          <CalendarIcon color="#6B7280" size={16} />
          <Text style={styles.pickerTriggerText}>Pilih Tanggal</Text>
        </TouchableOpacity>
      </View>

      {/* Calendar Picker Modal */}
      <Modal visible={pickerVisible} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={styles.calendarCard}>
            <View style={styles.calendarHeader}>
              <TouchableOpacity onPress={handleMonthPrev}>
                <LeftIcon color="#0F5936" size={20} />
              </TouchableOpacity>
              <Text style={styles.monthYearLabel}>{getMonthName(pickerMonth)} {pickerYear}</Text>
              <TouchableOpacity onPress={handleMonthNext}>
                <RightIcon color="#0F5936" size={20} />
              </TouchableOpacity>
            </View>

            <View style={styles.weekLabelsRow}>
              {weekLabels.map((label, idx) => (
                <Text key={idx} style={styles.weekLabel}>{label}</Text>
              ))}
            </View>

            <View style={styles.daysGrid}>
              {calendarDays.map((day, idx) => {
                if (day === null) {
                  return <View key={idx} style={styles.dayBoxEmpty} />;
                }
                const isSelected = getMidnight(day).getTime() === getMidnight(selectedDate).getTime();
                const isFuture = getMidnight(day).getTime() > getMidnight(today).getTime();

                return (
                  <TouchableOpacity
                    key={idx}
                    style={[
                      styles.dayBox,
                      isSelected ? styles.dayBoxSelected : null,
                      isFuture ? styles.dayBoxDisabled : null
                    ]}
                    onPress={() => !isFuture && selectCalendarDay(day)}
                    disabled={isFuture}
                  >
                    <Text style={[
                      styles.dayText,
                      isSelected ? styles.dayTextSelected : null,
                      isFuture ? styles.dayTextDisabled : null
                    ]}>
                      {day.getDate()}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>

            <TouchableOpacity style={styles.closeButton} onPress={() => setPickerVisible(false)}>
              <Text style={styles.closeButtonText}>Batal</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingVertical: theme.spacing.md,
    paddingHorizontal: theme.spacing.lg,
    backgroundColor: '#F9FAFB',
  },
  selectorCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: theme.spacing.md,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  selectorBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: theme.spacing.md,
  },
  arrowButton: {
    width: 44,
    height: 44,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 22,
    backgroundColor: '#EAF5EF',
  },
  dateLabel: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1F2937',
  },
  pickerTrigger: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#F3F4F6',
    paddingVertical: 10,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    gap: 8,
  },
  pickerTriggerText: {
    fontSize: 14,
    color: '#4B5563',
    fontWeight: '600',
  },
  disabled: {
    opacity: 0.5,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: theme.spacing.lg,
  },
  calendarCard: {
    width: '100%',
    maxWidth: 340,
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: theme.spacing.md,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 16,
    elevation: 5,
  },
  calendarHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    width: '100%',
    marginBottom: theme.spacing.md,
  },
  monthYearLabel: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1F2937',
  },
  weekLabelsRow: {
    flexDirection: 'row',
    width: '100%',
    justifyContent: 'space-around',
    marginBottom: 8,
  },
  weekLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: '#9CA3AF',
    width: 36,
    textAlign: 'center',
  },
  daysGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    width: '100%',
    justifyContent: 'flex-start',
  },
  dayBox: {
    width: 36,
    height: 36,
    margin: 4,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 18,
  },
  dayBoxEmpty: {
    width: 36,
    height: 36,
    margin: 4,
  },
  dayBoxSelected: {
    backgroundColor: '#0F5936',
  },
  dayBoxDisabled: {
    opacity: 0.3,
  },
  dayText: {
    fontSize: 13,
    color: '#374151',
    fontWeight: '500',
  },
  dayTextSelected: {
    color: '#FFFFFF',
    fontWeight: '700',
  },
  dayTextDisabled: {
    color: '#9CA3AF',
  },
  closeButton: {
    marginTop: theme.spacing.md,
    paddingVertical: 8,
    paddingHorizontal: theme.spacing.lg,
  },
  closeButtonText: {
    fontSize: 14,
    color: '#DC2626',
    fontWeight: '600',
  },
});
