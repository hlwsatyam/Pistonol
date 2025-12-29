import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
 
  ActivityIndicator,
  RefreshControl,
  Dimensions,
  Modal,
  ScrollView
} from 'react-native';
import { Card, Divider } from 'react-native-paper';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { LineChart } from 'react-native-chart-kit';
import { SafeAreaView } from 'react-native-safe-area-context';

const DMRHistoryScreen = ({ route, navigation }) => {
  const { distributorId } = route.params;
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [selectedReport, setSelectedReport] = useState(null);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [user, setUser] = useState(null);
  const [summary, setSummary] = useState({
    totalSales: 0,
    avgSales: 0,
    totalDebtors: 0,
    totalCreditors: 0
  });

  const months = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  useEffect(() => {
    loadUserAndReports();
  }, [distributorId]);

  const loadUserAndReports = async () => {
    try {
      const userData = await AsyncStorage.getItem('user');
      if (userData) setUser(JSON.parse(userData));
      
      await fetchReports();
    } catch (error) {
      console.error('Error loading data:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const fetchReports = async () => {
    try {
      const response = await axios.get(`/dmr/admin/reports?distributorId=${distributorId}`);
      if (response.data.success) {
        const reportsData = response.data.data.monthlySales || [];
        setReports(reportsData.sort((a, b) => new Date(b.year, b.month) - new Date(a.year, a.month)));
        
        // Calculate summary
        if (reportsData.length > 0) {
          const totalSales = reportsData.reduce((sum, report) => sum + (report.totalMonthSale || 0), 0);
          const totalDebtors = reportsData.reduce((sum, report) => sum + (report.debtors || 0), 0);
          const totalCreditors = reportsData.reduce((sum, report) => sum + (report.creditors || 0), 0);
          
          setSummary({
            totalSales,
            avgSales: totalSales / reportsData.length,
            totalDebtors,
            totalCreditors
          });
        }
      }
    } catch (error) {
      console.error('Error fetching reports:', error);
    }
  };

  const onRefresh = () => {
    setRefreshing(true);
    fetchReports();
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-IN');
  };

  const formatCurrency = (amount) => {
    if (!amount) return '₹0';
    return `₹${amount.toLocaleString('en-IN')}`;
  };

  const getMonthName = (month) => {
    return months[month - 1] || 'N/A';
  };

  const renderReportCard = ({ item }) => (
    <TouchableOpacity onPress={() => {
      setSelectedReport(item);
      setShowDetailsModal(true);
    }}>
      <Card style={styles.reportCard}>
        <Card.Content>
          <View style={styles.cardHeader}>
            <View style={styles.monthBadge}>
              <Icon name="calendar-month" size={20} color="#4CAF50" />
              <Text style={styles.monthText}>
                {getMonthName(item.month)} {item.year}
              </Text>
            </View>
            <View style={[styles.statusBadge, { backgroundColor: item.status === 'submitted' ? '#4CAF50' : '#FF9800' }]}>
              <Text style={styles.statusText}>
                {item.status === 'submitted' ? 'Submitted' : 'Draft'}
              </Text>
            </View>
          </View>
          
          <Divider style={styles.divider} />
          
          <View style={styles.cardStats}>
            <View style={styles.statItem}>
              <Text style={styles.statLabel}>Monthly Sale</Text>
              <Text style={styles.statValue}>{formatCurrency(item.totalMonthSale)}</Text>
            </View>
            
            <View style={styles.statItem}>
              <Text style={styles.statLabel}>Debtors</Text>
              <Text style={[styles.statValue, { color: '#F44336' }]}>
                {formatCurrency(item.debtors)}
              </Text>
            </View>
            
            <View style={styles.statItem}>
              <Text style={styles.statLabel}>Creditors</Text>
              <Text style={[styles.statValue, { color: '#4CAF50' }]}>
                {formatCurrency(item.creditors)}
              </Text>
            </View>
          </View>
          
          <View style={styles.cardFooter}>
            <Text style={styles.dateText}>
              Updated: {formatDate(item.updatedAt)}
            </Text>
            <Icon name="chevron-right" size={20} color="#666" />
          </View>
        </Card.Content>
      </Card>
    </TouchableOpacity>
  );

  const renderSalesChart = () => {
    if (reports.length < 2) return null;
    
    const sortedReports = [...reports].sort((a, b) => new Date(a.year, a.month) - new Date(b.year, b.month));
    const labels = sortedReports.map(r => `${getMonthName(r.month).substring(0, 3)} ${r.year.toString().substring(2)}`);
    const data = sortedReports.map(r => r.totalMonthSale || 0);
    
    return (
      <View style={styles.chartContainer}>
        <Text style={styles.chartTitle}>Monthly Sales Trend</Text>
        <LineChart
          data={{
            labels,
            datasets: [{ data }]
          }}
          width={Dimensions.get('window').width - 40}
          height={220}
          chartConfig={{
            backgroundColor: '#ffffff',
            backgroundGradientFrom: '#ffffff',
            backgroundGradientTo: '#ffffff',
            decimalPlaces: 0,
            color: (opacity = 1) => `rgba(76, 175, 80, ${opacity})`,
            labelColor: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`,
            style: {
              borderRadius: 16
            },
            propsForDots: {
              r: '6',
              strokeWidth: '2',
              stroke: '#4CAF50'
            }
          }}
          bezier
          style={styles.chart}
        />
      </View>
    );
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#4CAF50" />
        <Text style={styles.loadingText}>Loading DMR Reports...</Text>
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Icon name="arrow-left" size={24} color="#333" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>DMR History</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={['#4CAF50']} />
        }
        showsVerticalScrollIndicator={false}
      >
        {/* Summary Cards */}
        <View style={styles.summaryContainer}>
          <View style={styles.summaryRow}>
            <View style={styles.summaryCard}>
              <Icon name="currency-inr" size={30} color="#4CAF50" />
              <Text style={styles.summaryValue}>{formatCurrency(summary.totalSales)}</Text>
              <Text style={styles.summaryLabel}>Total Sales</Text>
            </View>
            
            <View style={styles.summaryCard}>
              <Icon name="trending-up" size={30} color="#2196F3" />
              <Text style={styles.summaryValue}>{formatCurrency(summary.avgSales)}</Text>
              <Text style={styles.summaryLabel}>Avg Monthly</Text>
            </View>
          </View>
          
          <View style={styles.summaryRow}>
            <View style={styles.summaryCard}>
              <Icon name="account-arrow-left" size={30} color="#F44336" />
              <Text style={styles.summaryValue}>{formatCurrency(summary.totalDebtors)}</Text>
              <Text style={styles.summaryLabel}>Total Debtors</Text>
            </View>
            
            <View style={styles.summaryCard}>
              <Icon name="account-arrow-right" size={30} color="#FF9800" />
              <Text style={styles.summaryValue}>{formatCurrency(summary.totalCreditors)}</Text>
              <Text style={styles.summaryLabel}>Total Creditors</Text>
            </View>
          </View>
        </View>

        {/* Sales Chart */}
        {renderSalesChart()}

        {/* Reports Count */}
        <View style={styles.reportsHeader}>
          <Text style={styles.reportsTitle}>Monthly Reports ({reports.length})</Text>
          <View style={styles.countBadge}>
            <Text style={styles.countText}>{reports.length}</Text>
          </View>
        </View>

        {/* Reports List */}
        {reports.length > 0 ? (
          <FlatList
            data={reports}
            renderItem={renderReportCard}
            keyExtractor={(item, index) => `${item._id}-${index}`}
            scrollEnabled={false}
            contentContainerStyle={styles.listContainer}
          />
        ) : (
          <View style={styles.emptyContainer}>
            <Icon name="file-document-outline" size={80} color="#E0E0E0" />
            <Text style={styles.emptyTitle}>No DMR Reports Found</Text>
            <Text style={styles.emptySubtitle}>
              No monthly sales reports available for this distributor
            </Text>
          </View>
        )}
      </ScrollView>

      {/* Report Details Modal */}
      <Modal
        visible={showDetailsModal}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setShowDetailsModal(false)}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>
                {selectedReport && `${getMonthName(selectedReport.month)} ${selectedReport.year}`}
              </Text>
              <TouchableOpacity onPress={() => setShowDetailsModal(false)}>
                <Icon name="close" size={24} color="#666" />
              </TouchableOpacity>
            </View>
            
            <ScrollView style={styles.modalBody}>
              {selectedReport && (
                <>
                  {/* Status */}
                  <View style={styles.detailSection}>
                    <Text style={styles.detailSectionTitle}>Report Status</Text>
                    <View style={[styles.statusBadgeLarge, { 
                      backgroundColor: selectedReport.status === 'submitted' ? '#4CAF50' : '#FF9800' 
                    }]}>
                      <Text style={styles.statusTextLarge}>
                        {selectedReport.status === 'submitted' ? 'Submitted' : 'Draft'}
                      </Text>
                    </View>
                  </View>

                  {/* Financial Details */}
                  <View style={styles.detailSection}>
                    <Text style={styles.detailSectionTitle}>Financial Details</Text>
                    
                    <View style={styles.detailRow}>
                      <Text style={styles.detailLabel}>Position As On:</Text>
                      <Text style={styles.detailValue}>
                        {formatDate(selectedReport.positionAsOnDate)}
                      </Text>
                    </View>
                    
                    <View style={styles.detailRow}>
                      <Text style={styles.detailLabel}>Monthly Sale:</Text>
                      <Text style={styles.detailValue}>
                        {formatCurrency(selectedReport.totalMonthSale)}
                      </Text>
                    </View>
                    
                    <View style={styles.detailRow}>
                      <Text style={styles.detailLabel}>Sale Till Date:</Text>
                      <Text style={styles.detailValue}>
                        {formatCurrency(selectedReport.totalSaleTillDate)}
                      </Text>
                    </View>
                    
                    <View style={styles.detailRow}>
                      <Text style={styles.detailLabel}>Debtors:</Text>
                      <Text style={[styles.detailValue, { color: '#F44336' }]}>
                        {formatCurrency(selectedReport.debtors)}
                      </Text>
                    </View>
                    
                    <View style={styles.detailRow}>
                      <Text style={styles.detailLabel}>Creditors:</Text>
                      <Text style={[styles.detailValue, { color: '#4CAF50' }]}>
                        {formatCurrency(selectedReport.creditors)}
                      </Text>
                    </View>
                  </View>

                  {/* Assets */}
                  <View style={styles.detailSection}>
                    <Text style={styles.detailSectionTitle}>Assets</Text>
                    
                    <View style={styles.detailRow}>
                      <Text style={styles.detailLabel}>Total Stock:</Text>
                      <Text style={styles.detailValue}>
                        {formatCurrency(selectedReport.totalStock)}
                      </Text>
                    </View>
                    
                    <View style={styles.detailRow}>
                      <Text style={styles.detailLabel}>Cash at Bank:</Text>
                      <Text style={styles.detailValue}>
                        {formatCurrency(selectedReport.cashAtBank)}
                      </Text>
                    </View>
                    
                    <View style={styles.detailRow}>
                      <Text style={styles.detailLabel}>Cash in Hand:</Text>
                      <Text style={styles.detailValue}>
                        {formatCurrency(selectedReport.cashInHand)}
                      </Text>
                    </View>
                    
                    <View style={styles.detailRow}>
                      <Text style={styles.detailLabel}>Business Assets:</Text>
                      <Text style={styles.detailValue}>
                        {formatCurrency(selectedReport.purchaseOfBusinessAssets)}
                      </Text>
                    </View>
                  </View>

                  {/* Dates */}
                  <View style={styles.detailSection}>
                    <Text style={styles.detailSectionTitle}>Dates</Text>
                    
                    <View style={styles.detailRow}>
                      <Text style={styles.detailLabel}>Created:</Text>
                      <Text style={styles.detailValue}>
                        {formatDate(selectedReport.createdAt)}
                      </Text>
                    </View>
                    
                    <View style={styles.detailRow}>
                      <Text style={styles.detailLabel}>Last Updated:</Text>
                      <Text style={styles.detailValue}>
                        {formatDate(selectedReport.updatedAt)}
                      </Text>
                    </View>
                  </View>
                </>
              )}
            </ScrollView>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F5F5',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: '#666',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 15,
    backgroundColor: '#FFFFFF',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  backButton: {
    padding: 8,
    borderRadius: 20,
    backgroundColor: '#F0F0F0',
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#333',
  },
  summaryContainer: {
    padding: 15,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 15,
  },
  summaryCard: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 20,
    alignItems: 'center',
    marginHorizontal: 8,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  summaryValue: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
    marginTop: 10,
    marginBottom: 5,
  },
  summaryLabel: {
    fontSize: 12,
    color: '#666',
    textAlign: 'center',
  },
  chartContainer: {
    backgroundColor: '#FFFFFF',
    marginHorizontal: 15,
    marginBottom: 15,
    borderRadius: 12,
    padding: 15,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  chartTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 15,
  },
  chart: {
    marginVertical: 8,
    borderRadius: 16,
  },
  reportsHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    marginTop: 10,
    marginBottom: 15,
  },
  reportsTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  countBadge: {
    backgroundColor: '#4CAF50',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
  },
  countText: {
    color: '#FFFFFF',
    fontWeight: 'bold',
    fontSize: 14,
  },
  listContainer: {
    paddingHorizontal: 15,
    paddingBottom: 20,
  },
  reportCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    marginBottom: 12,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  monthBadge: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  monthText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginLeft: 8,
  },
  statusBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
  },
  statusText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: 'bold',
  },
  divider: {
    marginVertical: 10,
    backgroundColor: '#E0E0E0',
  },
  cardStats: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  statItem: {
    alignItems: 'center',
    flex: 1,
  },
  statLabel: {
    fontSize: 12,
    color: '#666',
    marginBottom: 4,
  },
  statValue: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
  },
  cardFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 10,
  },
  dateText: {
    fontSize: 12,
    color: '#999',
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
    paddingHorizontal: 40,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#666',
    marginTop: 20,
    marginBottom: 10,
    textAlign: 'center',
  },
  emptySubtitle: {
    fontSize: 14,
    color: '#999',
    textAlign: 'center',
    lineHeight: 20,
  },
  // Modal Styles
  modalContainer: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    width: '90%',
    maxHeight: '90%',
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
  },
  modalBody: {
    maxHeight: 500,
  },
  detailSection: {
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  detailSectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 15,
  },
  statusBadgeLarge: {
    alignSelf: 'flex-start',
    paddingHorizontal: 15,
    paddingVertical: 8,
    borderRadius: 10,
  },
  statusTextLarge: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: 'bold',
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  detailLabel: {
    fontSize: 14,
    color: '#666',
    flex: 1,
  },
  detailValue: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    flex: 1,
    textAlign: 'right',
  },
});

export default DMRHistoryScreen;