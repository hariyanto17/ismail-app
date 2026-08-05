import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  useWindowDimensions,
  ActivityIndicator,
  TouchableOpacity,
  Modal,
} from 'react-native';
import Svg, { Path, Circle, Text as SvgText, Line } from 'react-native-svg';
import { useGetMonthlyAnalyticsQuery } from '../redux/apiSlice';
import { theme } from '../utils/theme';
import {
  HistoryIcon,
  CashIcon,
  QrisIcon,
  InfoIcon,
} from '../components/Icons';

const months = [
  { value: 1, label: 'Januari' },
  { value: 2, label: 'Februari' },
  { value: 3, label: 'Maret' },
  { value: 4, label: 'April' },
  { value: 5, label: 'Mei' },
  { value: 6, label: 'Juni' },
  { value: 7, label: 'Juli' },
  { value: 8, label: 'Agustus' },
  { value: 9, label: 'September' },
  { value: 10, label: 'Oktober' },
  { value: 11, label: 'November' },
  { value: 12, label: 'Desember' },
];

const years = [2024, 2025, 2026, 2027, 2028];

export const MonthlyAnalyticsScreen = () => {
  const { width } = useWindowDimensions();
  const isTablet = width >= 768;

  const [selectedMonth, setSelectedMonth] = useState<number>(() => {
    return new Date().getMonth() + 1;
  });
  const [selectedYear, setSelectedYear] = useState<number>(() => {
    return new Date().getFullYear();
  });

  const [showMonthModal, setShowMonthModal] = useState(false);
  const [showYearModal, setShowYearModal] = useState(false);

  const { data: response, isLoading } = useGetMonthlyAnalyticsQuery({
    month: selectedMonth,
    year: selectedYear,
  });

  const analyticsData = response?.data || {
    businessPeriod: {
      startStr: '',
      endStr: '',
    },
    summary: {
      totalSales: 0,
      totalTransactions: 0,
      averageTransactionValue: 0,
      cashSales: 0,
      qrisSales: 0,
    },
    topProducts: [],
    lowProducts: [],
    hourlySales: [],
  };

  const { businessPeriod, summary, topProducts, lowProducts, hourlySales } = analyticsData;

  // Indonesian Date Formatter Helper
  const formatIndonesianDate = (dateString: string) => {
    if (!dateString) return '';
    const [y, m, d] = dateString.split('-');
    const monthNames = [
      'Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni',
      'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'
    ];
    return `${parseInt(d, 10)} ${monthNames[parseInt(m, 10) - 1]} ${y}`;
  };

  // Payments calculations
  const totalPayment = summary.cashSales + summary.qrisSales;
  const cashPercentage = totalPayment > 0 ? Math.round((summary.cashSales / totalPayment) * 100) : 0;
  const qrisPercentage = totalPayment > 0 ? Math.round((summary.qrisSales / totalPayment) * 100) : 0;

  // Line Chart Helper Calculations
  const chartHeight = 200;
  const chartWidth = isTablet ? width - 64 : width - 48;
  const paddingLeft = 45;
  const paddingRight = 20;
  const paddingTop = 25;
  const paddingBottom = 30;

  // Find max sales amount to scale Y-axis
  const salesAmounts = hourlySales.map((h: any) => h.salesAmount);
  const maxSales = Math.max(...salesAmounts, 10000); // fallback minimum scale

  // Busiest hour calculations
  let busiestHour = '';
  let busiestAmount = -1;
  hourlySales.forEach((h: any) => {
    if (h.salesAmount > busiestAmount) {
      busiestAmount = h.salesAmount;
      busiestHour = h.hour;
    }
  });

  // Calculate SVG Points for Line Chart
  const points: { x: number; y: number; label: string; amount: number; count: number }[] = [];
  if (hourlySales.length > 1) {
    const stepX = (chartWidth - paddingLeft - paddingRight) / (hourlySales.length - 1);
    hourlySales.forEach((h: any, idx: number) => {
      const x = paddingLeft + idx * stepX;
      const y =
        chartHeight -
        paddingBottom -
        (h.salesAmount / maxSales) * (chartHeight - paddingTop - paddingBottom);
      points.push({ x, y, label: h.hour, amount: h.salesAmount, count: h.transactionCount });
    });
  }

  // Draw SVG Path line
  let linePath = '';
  if (points.length > 0) {
    linePath = `M ${points[0].x} ${points[0].y}`;
    for (let i = 1; i < points.length; i++) {
      linePath += ` L ${points[i].x} ${points[i].y}`;
    }
  }

  return (
    <View style={styles.container}>
      {/* Month Year Selector Card */}
      <View style={styles.selectorCard}>
        <Text style={styles.selectorTitle}>Pilih Periode Laporan</Text>
        <View style={styles.pickerRow}>
          <TouchableOpacity style={styles.pickerField} onPress={() => setShowMonthModal(true)}>
            <Text style={styles.pickerFieldLabel}>Bulan</Text>
            <Text style={styles.pickerFieldValue}>{months[selectedMonth - 1].label} ▼</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.pickerField} onPress={() => setShowYearModal(true)}>
            <Text style={styles.pickerFieldLabel}>Tahun</Text>
            <Text style={styles.pickerFieldValue}>{selectedYear} ▼</Text>
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent}>
        {isLoading ? (
          <View style={styles.loadingBox}>
            <ActivityIndicator size="large" color="#0F5936" />
            <Text style={styles.loadingText}>Memuat Analisis Bulanan...</Text>
          </View>
        ) : (
          <View style={styles.dashboardContainer}>
            {/* Business Period Info */}
            {businessPeriod?.startStr && businessPeriod?.endStr ? (
              <View style={styles.periodCard}>
                <Text style={styles.periodHeader}>Periode Bisnis</Text>
                <Text style={styles.periodText}>
                  {formatIndonesianDate(businessPeriod.startStr)}
                </Text>
                <Text style={styles.periodSeparator}>sampai</Text>
                <Text style={styles.periodText}>
                  {formatIndonesianDate(businessPeriod.endStr)}
                </Text>
              </View>
            ) : null}

            {/* 1. Summary Cards */}
            <View style={[styles.summaryGrid, isTablet ? styles.summaryGridTablet : styles.summaryGridPhone]}>
              <View style={[styles.statCard, isTablet ? styles.statCardTablet : styles.statCardPhone]}>
                <View style={[styles.statIconBox, { backgroundColor: '#EAF5EF' }]}>
                  <HistoryIcon color="#0F5936" size={22} />
                </View>
                <Text style={styles.statValue}>Rp{summary.totalSales.toLocaleString('id-ID')}</Text>
                <Text style={styles.statLabel}>Total Penjualan</Text>
              </View>

              <View style={[styles.statCard, isTablet ? styles.statCardTablet : styles.statCardPhone]}>
                <View style={[styles.statIconBox, { backgroundColor: '#E0F2FE' }]}>
                  <InfoIcon color="#0284C7" size={22} />
                </View>
                <Text style={styles.statValue}>{summary.totalTransactions}</Text>
                <Text style={styles.statLabel}>Total Transaksi</Text>
              </View>

              <View style={[styles.statCard, isTablet ? styles.statCardTablet : styles.statCardPhone]}>
                <View style={[styles.statIconBox, { backgroundColor: '#FEF3C7' }]}>
                  <CashIcon color="#D97706" size={22} />
                </View>
                <Text style={styles.statValue}>Rp{summary.averageTransactionValue.toLocaleString('id-ID')}</Text>
                <Text style={styles.statLabel}>Rata-rata Transaksi</Text>
              </View>
            </View>

            {/* 2. Payment Composition */}
            <View style={styles.sectionCard}>
              <Text style={styles.sectionTitle}>Komposisi Pembayaran</Text>
              <View style={styles.paymentContainer}>
                <View style={styles.paymentRow}>
                  <View style={styles.paymentHeader}>
                    <Text style={styles.paymentLabel}>💵 Tunai (Cash)</Text>
                    <Text style={styles.paymentValue}>
                      Rp{summary.cashSales.toLocaleString('id-ID')} ({cashPercentage}%)
                    </Text>
                  </View>
                  <View style={styles.progressBarBg}>
                    <View style={[styles.progressBarFill, { width: `${cashPercentage}%`, backgroundColor: '#0F5936' }]} />
                  </View>
                </View>

                <View style={styles.paymentRow}>
                  <View style={styles.paymentHeader}>
                    <Text style={styles.paymentLabel}>📱 QRIS</Text>
                    <Text style={styles.paymentValue}>
                      Rp{summary.qrisSales.toLocaleString('id-ID')} ({qrisPercentage}%)
                    </Text>
                  </View>
                  <View style={styles.progressBarBg}>
                    <View style={[styles.progressBarFill, { width: `${qrisPercentage}%`, backgroundColor: '#3B82F6' }]} />
                  </View>
                </View>
              </View>
            </View>

            {/* 3. Peak Business Hours */}
            <View style={styles.sectionCard}>
              <Text style={styles.sectionTitle}>Jam Sibuk Bisnis (Akumulasi Periode)</Text>
              {hourlySales.length === 0 ? (
                <Text style={styles.emptyText}>Tidak ada data jam operasional.</Text>
              ) : (
                <View style={styles.chartContainer}>
                  <Svg width={chartWidth} height={chartHeight}>
                    {[0, 0.25, 0.5, 0.75, 1].map((ratio, i) => {
                      const y = paddingTop + ratio * (chartHeight - paddingTop - paddingBottom);
                      const value = Math.round(maxSales * (1 - ratio));
                      return (
                        <React.Fragment key={i}>
                          <Line
                            x1={paddingLeft}
                            y1={y}
                            x2={chartWidth - paddingRight}
                            y2={y}
                            stroke="#E5E7EB"
                            strokeWidth={1}
                            strokeDasharray="4 4"
                          />
                          <SvgText
                            x={paddingLeft - 8}
                            y={y + 4}
                            fontSize={10}
                            fill="#9CA3AF"
                            textAnchor="end"
                          >
                            {value >= 1000 ? `${(value / 1000).toFixed(0)}k` : value}
                          </SvgText>
                        </React.Fragment>
                      );
                    })}

                    {linePath ? (
                      <Path d={linePath} fill="none" stroke="#9CA3AF" strokeWidth={2} />
                    ) : null}

                    {points.map((p, idx) => {
                      const isBusiest = p.label === busiestHour && busiestAmount > 0;
                      const showLabel = points.length < 10 || idx % 2 === 0 || idx === points.length - 1;
                      return (
                        <React.Fragment key={idx}>
                          {showLabel && (
                            <SvgText
                              x={p.x}
                              y={chartHeight - 8}
                              fontSize={10}
                              fill="#9CA3AF"
                              textAnchor="middle"
                            >
                              {p.label}
                            </SvgText>
                          )}
                          <Circle
                            cx={p.x}
                            cy={p.y}
                            r={isBusiest ? 6 : 4}
                            fill={isBusiest ? '#0F5936' : '#FFFFFF'}
                            stroke={isBusiest ? '#FFFFFF' : '#0F5936'}
                            strokeWidth={2}
                          />
                        </React.Fragment>
                      );
                    })}
                  </Svg>
                  {busiestHour && busiestAmount > 0 ? (
                    <View style={styles.chartLegend}>
                      <Text style={styles.legendText}>
                        🔥 Jam Teramai: <Text style={styles.boldText}>{busiestHour}:00</Text> (Rp{busiestAmount.toLocaleString('id-ID')})
                      </Text>
                    </View>
                  ) : null}
                </View>
              )}
            </View>

            {/* Product Lists Section */}
            <View style={isTablet ? styles.sideBySideRow : styles.verticalStack}>
              {/* Best Selling Products */}
              <View style={[styles.sectionCard, isTablet ? styles.flexHalf : null]}>
                <Text style={styles.sectionTitle}>🏆 10 Produk Terlaris</Text>
                {topProducts.length === 0 ? (
                  <Text style={styles.emptyText}>Belum ada data penjualan produk periode ini.</Text>
                ) : (
                  <View style={styles.table}>
                    <View style={styles.tableHeader}>
                      <Text style={[styles.tableCol, styles.colRank]}>Rank</Text>
                      <Text style={[styles.tableCol, styles.colProduct]}>Produk</Text>
                      <Text style={[styles.tableCol, styles.colQty]}>Terjual</Text>
                    </View>
                    {topProducts.map((p: any) => (
                      <View key={p.ranking} style={styles.tableRow}>
                        <Text style={[styles.tableCell, styles.colRank, styles.rankText]}>#{p.ranking}</Text>
                        <Text style={[styles.tableCell, styles.colProduct, styles.boldCellText]}>{p.product}</Text>
                        <Text style={[styles.tableCell, styles.colQty]}>{p.qty} pcs</Text>
                      </View>
                    ))}
                  </View>
                )}
              </View>

              {/* Lowest Selling Products */}
              <View style={[styles.sectionCard, isTablet ? styles.flexHalf : null]}>
                <Text style={styles.sectionTitle}>💤 10 Produk Paling Jarang Terjual</Text>
                {lowProducts.length === 0 ? (
                  <Text style={styles.emptyText}>Belum ada data produk slow moving periode ini.</Text>
                ) : (
                  <View style={styles.table}>
                    <View style={styles.tableHeader}>
                      <Text style={[styles.tableCol, styles.colProduct]}>Produk</Text>
                      <Text style={[styles.tableCol, styles.colQty]}>Terjual</Text>
                    </View>
                    {lowProducts.map((p: any, idx: number) => (
                      <View key={idx} style={styles.tableRow}>
                        <Text style={[styles.tableCell, styles.colProduct]}>{p.product}</Text>
                        <Text style={[styles.tableCell, styles.colQty]}>{p.qty} pcs</Text>
                      </View>
                    ))}
                  </View>
                )}
              </View>
            </View>
          </View>
        )}
      </ScrollView>

      {/* Month Modal */}
      <Modal visible={showMonthModal} transparent animationType="fade" onRequestClose={() => setShowMonthModal(false)}>
        <TouchableOpacity style={styles.modalOverlay} activeOpacity={1} onPress={() => setShowMonthModal(false)}>
          <View style={styles.modalContent}>
            <Text style={styles.modalHeader}>Pilih Bulan</Text>
            <View style={styles.gridContainer}>
              {months.map((m) => (
                <TouchableOpacity
                  key={m.value}
                  style={[
                    styles.gridItem,
                    selectedMonth === m.value ? styles.gridItemActive : null,
                  ]}
                  onPress={() => {
                    setSelectedMonth(m.value);
                    setShowMonthModal(false);
                  }}
                >
                  <Text
                    style={[
                      styles.gridItemText,
                      selectedMonth === m.value ? styles.gridItemTextActive : null,
                    ]}
                  >
                    {m.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        </TouchableOpacity>
      </Modal>

      {/* Year Modal */}
      <Modal visible={showYearModal} transparent animationType="fade" onRequestClose={() => setShowYearModal(false)}>
        <TouchableOpacity style={styles.modalOverlay} activeOpacity={1} onPress={() => setShowYearModal(false)}>
          <View style={styles.modalContent}>
            <Text style={styles.modalHeader}>Pilih Tahun</Text>
            <View style={styles.gridContainer}>
              {years.map((y) => (
                <TouchableOpacity
                  key={y}
                  style={[
                    styles.gridItem,
                    selectedYear === y ? styles.gridItemActive : null,
                  ]}
                  onPress={() => {
                    setSelectedYear(y);
                    setShowYearModal(false);
                  }}
                >
                  <Text
                    style={[
                      styles.gridItemText,
                      selectedYear === y ? styles.gridItemTextActive : null,
                    ]}
                  >
                    {y}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        </TouchableOpacity>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F9FAFB',
  },
  selectorCard: {
    backgroundColor: '#FFFFFF',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  selectorTitle: {
    fontSize: 12,
    fontWeight: '700',
    color: '#6B7280',
    textTransform: 'uppercase',
    marginBottom: 8,
  },
  pickerRow: {
    flexDirection: 'row',
    gap: 12,
  },
  pickerField: {
    flex: 1,
    backgroundColor: '#F3F4F6',
    borderRadius: 8,
    padding: 10,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  pickerFieldLabel: {
    fontSize: 10,
    color: '#6B7280',
    fontWeight: '600',
  },
  pickerFieldValue: {
    fontSize: 14,
    fontWeight: '700',
    color: '#1F2937',
    marginTop: 2,
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 40,
  },
  loadingBox: {
    paddingVertical: 80,
    alignItems: 'center',
    justifyContent: 'center',
  },
  loadingText: {
    marginTop: 12,
    color: '#6B7280',
    fontSize: 14,
  },
  dashboardContainer: {
    gap: 16,
  },
  periodCard: {
    backgroundColor: '#0F5936',
    borderRadius: 16,
    padding: 20,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  periodHeader: {
    fontSize: 12,
    fontWeight: '700',
    color: '#EAF5EF',
    textTransform: 'uppercase',
    letterSpacing: 1.5,
    marginBottom: 8,
  },
  periodText: {
    fontSize: 18,
    fontWeight: '800',
    color: '#FFFFFF',
  },
  periodSeparator: {
    fontSize: 12,
    color: '#EAF5EF',
    marginVertical: 4,
    fontStyle: 'italic',
  },
  summaryGrid: {
    justifyContent: 'space-between',
    gap: 12,
  },
  summaryGridPhone: {
    flexDirection: 'column',
  },
  summaryGridTablet: {
    flexDirection: 'row',
  },
  statCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.03,
    shadowRadius: 6,
    elevation: 2,
  },
  statCardPhone: {
    width: '100%',
  },
  statCardTablet: {
    flex: 1,
  },
  statIconBox: {
    width: 38,
    height: 38,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 10,
  },
  statValue: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1F2937',
  },
  statLabel: {
    fontSize: 12,
    color: '#6B7280',
    marginTop: 2,
    fontWeight: '600',
  },
  sectionCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.03,
    shadowRadius: 6,
    elevation: 2,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: '#374151',
    marginBottom: 16,
  },
  paymentContainer: {
    gap: 16,
  },
  paymentRow: {
    gap: 6,
  },
  paymentHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  paymentLabel: {
    fontSize: 13,
    fontWeight: '600',
    color: '#4B5563',
  },
  paymentValue: {
    fontSize: 13,
    fontWeight: '700',
    color: '#1F2937',
  },
  progressBarBg: {
    height: 8,
    backgroundColor: '#F3F4F6',
    borderRadius: 4,
    overflow: 'hidden',
  },
  progressBarFill: {
    height: '100%',
    borderRadius: 4,
  },
  chartContainer: {
    alignItems: 'center',
  },
  chartLegend: {
    marginTop: 12,
    backgroundColor: '#EAF5EF',
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 20,
    alignSelf: 'center',
  },
  legendText: {
    fontSize: 12,
    color: '#0F5936',
  },
  boldText: {
    fontWeight: '700',
  },
  sideBySideRow: {
    flexDirection: 'row',
    gap: 16,
  },
  verticalStack: {
    flexDirection: 'column',
    gap: 16,
  },
  flexHalf: {
    flex: 1,
  },
  emptyText: {
    textAlign: 'center',
    color: '#9CA3AF',
    fontSize: 13,
    paddingVertical: 20,
  },
  table: {
    width: '100%',
  },
  tableHeader: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
    paddingBottom: 8,
    marginBottom: 8,
  },
  tableCol: {
    fontSize: 11,
    fontWeight: '700',
    color: '#9CA3AF',
    textTransform: 'uppercase',
  },
  colRank: {
    width: 50,
  },
  colProduct: {
    flex: 1,
  },
  colQty: {
    width: 60,
    textAlign: 'right',
  },
  tableRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  tableCell: {
    fontSize: 13,
    color: '#4B5563',
  },
  rankText: {
    fontWeight: '700',
    color: '#0F5936',
  },
  boldCellText: {
    fontWeight: '600',
    color: '#1F2937',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.4)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    width: '85%',
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 10,
    elevation: 5,
  },
  modalHeader: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1F2937',
    marginBottom: 16,
    textAlign: 'center',
  },
  gridContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    justifyContent: 'space-between',
  },
  gridItem: {
    width: '30%',
    paddingVertical: 10,
    backgroundColor: '#F3F4F6',
    borderRadius: 8,
    alignItems: 'center',
    marginBottom: 4,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  gridItemActive: {
    backgroundColor: '#0F5936',
    borderColor: '#0F5936',
  },
  gridItemText: {
    fontSize: 12,
    color: '#4B5563',
    fontWeight: '600',
  },
  gridItemTextActive: {
    color: '#FFFFFF',
    fontWeight: '700',
  },
});

export default MonthlyAnalyticsScreen;
