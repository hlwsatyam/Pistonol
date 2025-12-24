import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
  StatusBar,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import Icon2 from 'react-native-vector-icons/FontAwesome5';
import LinearGradient from 'react-native-linear-gradient';
import {useNavigation} from '@react-navigation/native';
import {useQuery} from '@tanstack/react-query';
import axios from 'axios';
 
import {formatDate} from '../../locale/Locale';
import { SafeAreaView } from 'react-native-safe-area-context';

const History = ({route}) => {
  const navigation = useNavigation();
  const {user} = route.params;

  const fetchHistory = async () => {
    try {
      const response = await axios.get(`/qrcodes/history/${user._id}`);
      return response.data;
    } catch (error) {
      throw new Error('Failed to fetch transaction history');
    }
  };

  const {
    data: transactions,
    isLoading,
    isError,
    error
  } = useQuery({
    queryKey: ['walletHistory', user._id],
    queryFn: fetchHistory,
  });

  console.log('User:', user);
  console.log('Transactions:', transactions);
  console.log('Loading:', isLoading, 'Error:', isError);

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <StatusBar backgroundColor="#4e4376" barStyle="light-content" />
        <LinearGradient
          colors={['#4e4376', '#2b5876']}
          style={StyleSheet.absoluteFill}
        />
        <ActivityIndicator size="large" color="#fff" />
        <Text style={styles.loadingText}>Loading History...</Text>
      </View>
    );
  }

  if (isError) {
    return (
      <View style={styles.errorContainer}>
        <StatusBar backgroundColor="#dc3545" barStyle="light-content" />
        <LinearGradient
          colors={['#dc3545', '#ff6b6b']}
          style={StyleSheet.absoluteFill}
        />
        <Icon name="error-outline" size={60} color="#fff" />
        <Text style={styles.errorTitle}>Oops!</Text>
        <Text style={styles.errorText}>
          {error?.message || 'Failed to load transaction history'}
        </Text>
        <TouchableOpacity 
          style={styles.retryButton}
          onPress={() => window.location.reload()}
        >
          <Text style={styles.retryButtonText}>Retry</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar backgroundColor="#4e4376" barStyle="light-content" />
      
      {/* Header */}
      <LinearGradient
        colors={['#4e4376', '#2b5876']}
        start={{x: 0, y: 0}}
        end={{x: 1, y: 0}}
        style={styles.header}
      >
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          style={styles.backButton}>
          <Icon name="arrow-back" size={28} color="#fff" />
        </TouchableOpacity>
        <View style={styles.headerTitleContainer}>
          <Icon2 name="history" size={22} color="#fff" style={styles.headerIcon} />
          <Text style={styles.headerTitle}>Transaction History</Text>
        </View>
        <View style={styles.headerRight}>
          <Text style={styles.userName}>
            {user.username || user.name || 'User'}
          </Text>
        </View>
      </LinearGradient>

      {/* User Info Summary */}
      <View style={styles.userInfoCard}>
        <View style={styles.userInfoRow}>
          <View style={styles.infoItem}>
            <Text style={styles.infoLabel}>Wallet Balance</Text>
            <Text style={styles.walletBalance}>₹{user.wallet || 0}</Text>
          </View>
          <View style={styles.infoItem}>
            <Text style={styles.infoLabel}>Total Scans</Text>
            <Text style={styles.scanCount}>{transactions?.length || 0}</Text>
          </View>
        </View>
      </View>

      {/* Transaction List */}
      <ScrollView 
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
      >
        {transactions?.length > 0 ? (
          <View style={styles.transactionList}>
            <Text style={styles.sectionTitle}>
              Recent Transactions ({transactions.length})
            </Text>
            
            {transactions.map((txn, index) => (
              <View 
                key={txn._id} 
                style={[
                  styles.transactionCard,
                  index === transactions.length - 1 && styles.lastCard
                ]}
              >
                <View style={styles.transactionLeft}>
                  <View style={[
                    styles.transactionIcon,
                    txn.client === 'customer' ? styles.scanIcon : styles.transferIcon
                  ]}>
                    <Icon2
                      name={txn.client === 'customer' ? 'qrcode' : 'exchange-alt'}
                      size={18}
                      color="#fff"
                    />
                  </View>
                  <View style={styles.transactionDetails}>
                    <Text style={styles.transactionType}>
                      {txn.client === 'customer' ? 'QR Code Scan' : 'Wallet Transfer'}
                    </Text>
                    <View style={styles.transactionMeta}>
                      <Text style={styles.batchText}>
                        Batch: {txn.batchNumber || 'N/A'}
                      </Text>
                      <Text style={styles.codeText}>
                        Code: {txn.uniqueCode?.substring(0, 6)}...
                      </Text>
                    </View>
                    <Text style={styles.transactionTime}>
                      {formatDate(txn.scannedAt || txn.createdAt)}
                    </Text>
                  </View>
                </View>
                
                <View style={styles.transactionRight}>
                  <Text style={[
                    styles.transactionAmount,
                    {color: txn.value > 0 ? '#28a745' : '#dc3545'}
                  ]}>
                    {txn.value > 0 ? '+' : ''}₹{txn.value}
                  </Text>
                  <View style={[
                    styles.statusBadge,
                    txn.status === 'used' ? styles.statusUsed : styles.statusPending
                  ]}>
                    <Text style={styles.statusText}>
                      {txn.status === 'used' ? 'Used' : 'Pending'}
                    </Text>
                  </View>
                </View>
              </View>
            ))}
          </View>
        ) : (
          <View style={styles.emptyContainer}>
            <Icon name="history" size={80} color="#ccc" />
            <Text style={styles.emptyTitle}>No Transactions Yet</Text>
            <Text style={styles.emptyText}>
              You haven't scanned any QR codes yet. Start scanning to see your history here.
            </Text>
          </View>
        )}
        
        {/* Summary */}
        {transactions?.length > 0 && (
          <View style={styles.summaryCard}>
            <Text style={styles.summaryTitle}>Summary</Text>
            <View style={styles.summaryRow}>
              <View style={styles.summaryItem}>
                <Text style={styles.summaryLabel}>Total Value</Text>
                <Text style={styles.summaryValue}>
                  ₹{transactions.reduce((sum, txn) => sum + (txn.value || 0), 0)}
                </Text>
              </View>
              <View style={styles.summaryDivider} />
              <View style={styles.summaryItem}>
                <Text style={styles.summaryLabel}>Successful Scans</Text>
                <Text style={styles.summaryValue}>
                  {transactions.filter(t => t.status === 'used').length}
                </Text>
              </View>
            </View>
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  
  // Loading State
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    color: '#fff',
    fontSize: 16,
    marginTop: 15,
    fontWeight: '500',
  },
  
  // Error State
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  errorTitle: {
    fontSize: 24,
    color: '#fff',
    fontWeight: 'bold',
    marginTop: 20,
    marginBottom: 10,
  },
  errorText: {
    fontSize: 16,
    color: '#fff',
    textAlign: 'center',
    marginBottom: 30,
    paddingHorizontal: 20,
  },
  retryButton: {
    backgroundColor: '#fff',
    paddingHorizontal: 30,
    paddingVertical: 12,
    borderRadius: 25,
  },
  retryButtonText: {
    color: '#dc3545',
    fontSize: 16,
    fontWeight: '600',
  },
  
  // Header
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 5,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    justifyContent: 'center',
  },
  headerIcon: {
    marginRight: 10,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#fff',
  },
  headerRight: {
    width: 80,
  },
  userName: {
    fontSize: 12,
    color: '#fff',
    fontWeight: '500',
    textAlign: 'right',
  },
  
  // User Info Card
  userInfoCard: {
    backgroundColor: '#fff',
    margin: 16,
    borderRadius: 12,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  userInfoRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
  },
  infoItem: {
    alignItems: 'center',
  },
  infoLabel: {
    fontSize: 12,
    color: '#666',
    marginBottom: 4,
    fontWeight: '500',
  },
  walletBalance: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#28a745',
  },
  scanCount: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#4e4376',
  },
  
  // Scroll View
  scrollView: {
    flex: 1,
  },
  
  // Transaction List
  transactionList: {
    paddingHorizontal: 16,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 16,
    marginTop: 8,
  },
  transactionCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#eee',
  },
  lastCard: {
    marginBottom: 16,
  },
  transactionLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  transactionIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  scanIcon: {
    backgroundColor: '#4e4376',
  },
  transferIcon: {
    backgroundColor: '#28a745',
  },
  transactionDetails: {
    flex: 1,
  },
  transactionType: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 4,
  },
  transactionMeta: {
    flexDirection: 'row',
    marginBottom: 4,
  },
  batchText: {
    fontSize: 12,
    color: '#666',
    marginRight: 12,
    backgroundColor: '#f0f0f0',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  codeText: {
    fontSize: 12,
    color: '#666',
    backgroundColor: '#f0f0f0',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  transactionTime: {
    fontSize: 11,
    color: '#999',
  },
  transactionRight: {
    alignItems: 'flex-end',
  },
  transactionAmount: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 6,
  },
  statusBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusUsed: {
    backgroundColor: '#d4edda',
  },
  statusPending: {
    backgroundColor: '#fff3cd',
  },
  statusText: {
    fontSize: 10,
    fontWeight: '600',
    color: '#333',
  },
  
  // Empty State
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
    paddingHorizontal: 40,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#666',
    marginTop: 20,
    marginBottom: 10,
  },
  emptyText: {
    fontSize: 14,
    color: '#999',
    textAlign: 'center',
    lineHeight: 20,
  },
  
  // Summary Card
  summaryCard: {
    backgroundColor: '#fff',
    marginHorizontal: 16,
    marginBottom: 24,
    borderRadius: 12,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  summaryTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 16,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
  },
  summaryItem: {
    alignItems: 'center',
    flex: 1,
  },
  summaryDivider: {
    width: 1,
    height: 40,
    backgroundColor: '#eee',
  },
  summaryLabel: {
    fontSize: 12,
    color: '#666',
    marginBottom: 4,
  },
  summaryValue: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#4e4376',
  },
});

export default History;