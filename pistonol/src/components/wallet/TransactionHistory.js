import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  RefreshControl,
  StyleSheet,
  StatusBar,
  Dimensions
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';
import Icon from 'react-native-vector-icons/MaterialIcons';
import LinearGradient from 'react-native-linear-gradient';

const { width } = Dimensions.get('window');

const TransactionHistory = ({ navigation }) => {
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [user, setUser] = useState(null);
console.log(user)
  useEffect(() => {
    loadUserData();
    fetchTransactions();
  }, []);

  const loadUserData = async () => {
    try {
      const userData = await AsyncStorage.getItem('user');
      if (userData) {
        setUser(JSON.parse(userData));
      }
    } catch (error) {
      console.error('Error loading user data:', error);
    }
  };

  const fetchTransactions = async () => {
    try {
      const userData = await AsyncStorage.getItem('user');
      if (userData) {
        const parsedUser = JSON.parse(userData);
        const response = await axios.get(
          `/transactions/user-transactions/${parsedUser._id}`
        );
        
        if (response.data.success) {
          setTransactions(response.data.transactions);
        }
      }
    } catch (error) {
      console.error('Error fetching transactions:', error);
      Alert.alert('Error', 'Failed to fetch transaction history');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const onRefresh = () => {
    setRefreshing(true);
    fetchTransactions();
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-IN', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getTransactionType = (transaction) => {
    if (transaction.sender._id === user?._id) {
      return { type: 'Sent', color: '#EF4444', icon: 'arrow-upward' };
    } else {
      return { type: 'Received', color: '#10B981', icon: 'arrow-downward' };
    }
  };

  const getTransactionParty = (transaction) => {
    console.log(transaction)
    if (transaction.sender._id === user?._id) {
      return `To: ${transaction.receiver.name  || transaction.receiver.username  }`;
    } else {
      return `From: ${transaction.sender.name || transaction.sender.username   }`;
    }
  };

  const getTransactionIcon = (transaction) => {
    if (transaction.type === 'transfer') {
      return 'swap-horiz';
    } else if (transaction.type === 'payment') {
      return 'payment';
    } else {
      return 'receipt';
    }
  };

  // Calculate summary statistics
  const totalSent = transactions
    .filter(t => t.sender._id === user?._id)
    .reduce((sum, t) => sum + t.amount, 0);

  const totalReceived = transactions
    .filter(t => t.sender._id !== user?._id)
    .reduce((sum, t) => sum + t.amount, 0);

  if (loading) {
    return (
      <View style={styles.container}>
        <StatusBar backgroundColor="#3B82F6" barStyle="light-content" />
        <LinearGradient
          colors={['blue', 'blue']}
          style={styles.header}
        >
          <View style={styles.headerContent}>
            <TouchableOpacity
              onPress={() => navigation.goBack()}
              style={styles.backButton}
            >
              <Icon name="arrow-back" size={24} color="#FFFFFF" />
            </TouchableOpacity>
            <Text style={styles.headerTitle}>Transaction History</Text>
            <View style={styles.placeholderIcon} />
          </View>
        </LinearGradient>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#3B82F6" />
          <Text style={styles.loadingText}>Loading Transactions...</Text>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <StatusBar backgroundColor="#3B82F6" barStyle="light-content" />
      
      {/* Header */}
      <LinearGradient
        colors={['blue', 'blue']}
        style={styles.header}
      >
        <View style={styles.headerContent}>
          <TouchableOpacity
            onPress={() => navigation.goBack()}
            style={styles.backButton}
          >
            <Icon name="arrow-back" size={24} color="#FFFFFF" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Transaction History</Text>
          <Icon name="history" size={24} color="#FFFFFF" />
        </View>
      </LinearGradient>

      {/* Summary Cards */}
      {transactions.length > 0 && (
        <View style={styles.summaryContainer}>
          <View style={styles.summaryCard}>
            <View style={[styles.summaryIcon, { backgroundColor: '#ECFDF5' }]}>
              <Icon name="arrow-downward" size={20} color="#10B981" />
            </View>
            <View style={styles.summaryText}>
              <Text style={styles.summaryLabel}>Received</Text>
              <Text style={[styles.summaryAmount, { color: '#10B981' }]}>
                ₹{totalReceived.toFixed(2)}
              </Text>
            </View>
          </View>

          <View style={styles.summaryCard}>
            <View style={[styles.summaryIcon, { backgroundColor: '#FEF2F2' }]}>
              <Icon name="arrow-upward" size={20} color="#EF4444" />
            </View>
            <View style={styles.summaryText}>
              <Text style={styles.summaryLabel}>Sent</Text>
              <Text style={[styles.summaryAmount, { color: '#EF4444' }]}>
                ₹{totalSent.toFixed(2)}
              </Text>
            </View>
          </View>
        </View>
      )}

      <ScrollView
        style={styles.scrollView}
        refreshControl={
          <RefreshControl 
            refreshing={refreshing} 
            onRefresh={onRefresh}
            colors={['#3B82F6']}
            tintColor="#3B82F6"
          />
        }
        showsVerticalScrollIndicator={false}
      >
        {transactions.length === 0 ? (
          <View style={styles.emptyContainer}>
            <View style={styles.emptyIcon}>
              <Icon name="receipt-long" size={60} color="#9CA3AF" />
            </View>
            <Text style={styles.emptyTitle}>No Transactions</Text>
            <Text style={styles.emptyText}>
              Your transaction history will appear here
            </Text>
            <TouchableOpacity 
              style={styles.refreshButton}
              onPress={fetchTransactions}
            >
              <Text style={styles.refreshText}>Refresh</Text>
            </TouchableOpacity>
          </View>
        ) : (
          transactions.map((transaction, index) => {
            const transactionType = getTransactionType(transaction);
            const isSent = transactionType.type === 'Sent';
            
            return (
              <View
                key={transaction._id}
                style={[
                  styles.transactionCard,
                  index === transactions.length - 1 && styles.lastCard
                ]}
              >
                <View style={styles.transactionLeft}>
                  <View 
                    style={[
                      styles.transactionIcon,
                      { backgroundColor: isSent ? '#FEF2F2' : '#ECFDF5' }
                    ]}
                  >
                    <Icon 
                      name={getTransactionIcon(transaction)} 
                      size={20} 
                      color={transactionType.color} 
                    />
                  </View>
                  <View style={styles.transactionDetails}>
                    <Text style={styles.transactionParty}>
                      {getTransactionParty(transaction)}
                    </Text>
                    <Text style={styles.transactionDate}>
                      {formatDate(transaction.createdAt)}
                    </Text>
                    <Text style={styles.transactionType}>
                      {transaction.type?.toUpperCase()}
                    </Text>
                  </View>
                </View>
                
                <View style={styles.transactionRight}>
                  <Text style={[styles.transactionAmount, { color: transactionType.color }]}>
                    {isSent ? '-' : '+'}₹{transaction.amount.toFixed(2)}
                  </Text>
                  <View style={styles.transactionStatus}>
                    <Icon 
                      name={transactionType.icon} 
                      size={16} 
                      color={transactionType.color} 
                    />
                    <Text style={[styles.statusText, { color: transactionType.color }]}>
                      {transactionType.type}
                    </Text>
                  </View>
                </View>
              </View>
            );
          })
        )}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  header: {
    paddingTop: Platform.OS === 'ios' ? 60 : 40,
    paddingBottom: 20,
    paddingHorizontal: 20,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  backButton: {
    padding: 4,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#FFFFFF',
    flex: 1,
    textAlign: 'center',
    marginLeft: -24,
  },
  placeholderIcon: {
    width: 24,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F8FAFC',
  },
  loadingText: {
    marginTop: 12,
    fontSize: 16,
    color: '#6B7280',
    fontWeight: '500',
  },
  summaryContainer: {
    flexDirection: 'row',
    padding: 16,
    paddingBottom: 8,
  },
  summaryCard: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    marginHorizontal: 4,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  summaryIcon: {
    width: 40,
    height: 40,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  summaryText: {
    flex: 1,
  },
  summaryLabel: {
    fontSize: 12,
    color: '#6B7280',
    marginBottom: 4,
  },
  summaryAmount: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  scrollView: {
    flex: 1,
    padding: 16,
  },
  transactionCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  lastCard: {
    marginBottom: 0,
  },
  transactionLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  transactionIcon: {
    width: 44,
    height: 44,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  transactionDetails: {
    flex: 1,
  },
  transactionParty: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1F2937',
    marginBottom: 4,
  },
  transactionDate: {
    fontSize: 12,
    color: '#6B7280',
    marginBottom: 4,
  },
  transactionType: {
    fontSize: 10,
    color: '#9CA3AF',
    fontWeight: '500',
  },
  transactionRight: {
    alignItems: 'flex-end',
  },
  transactionAmount: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 6,
  },
  transactionStatus: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  statusText: {
    fontSize: 12,
    fontWeight: '600',
    marginLeft: 4,
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
    paddingHorizontal: 40,
  },
  emptyIcon: {
    marginBottom: 20,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#374151',
    marginBottom: 8,
  },
  emptyText: {
    fontSize: 14,
    color: '#6B7280',
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: 24,
  },
  refreshButton: {
    backgroundColor: '#3B82F6',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 12,
  },
  refreshText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
  },
});

export default TransactionHistory;