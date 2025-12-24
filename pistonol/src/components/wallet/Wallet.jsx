import React, {useState, useCallback, useRef} from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
  StatusBar,
  RefreshControl,
  FlatList,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import Icon2 from 'react-native-vector-icons/FontAwesome5';
import LinearGradient from 'react-native-linear-gradient';
import {useNavigation, useFocusEffect} from '@react-navigation/native';
import axios from 'axios';
import {formatDate} from '../../locale/Locale';
import { SafeAreaView } from 'react-native-safe-area-context';

const WalletScreen = ({route}) => {
  const navigation = useNavigation();
  const {user} = route.params;
  
  const [balance, setBalance] = useState(user?.wallet || 0);
  const [showDetails, setShowDetails] = useState(false);
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [error, setError] = useState(null);
  
  const flatListRef = useRef(null);

  const fetchTransactions = async (pageNum = 1, isRefresh = false) => {
    try {
      if (isRefresh) {
        setRefreshing(true);
      } else if (pageNum === 1) {
        setLoading(true);
      } else {
        setLoadingMore(true);
      }

      const response = await axios.get(`/transactions/user-transactions/${user._id}`);

      if (response.data.success) {
        const allTransactions = response.data.transactions || [];
        
        // For infinite scroll, we'll slice the data based on page
        const startIndex = (pageNum - 1) * 10;
        const endIndex = startIndex + 10;
        const pageTransactions = allTransactions.slice(startIndex, endIndex);

        if (isRefresh || pageNum === 1) {
          setTransactions(pageTransactions);
        } else {
          setTransactions(prev => [...prev, ...pageTransactions]);
        }
        
        // Check if we have more data
        setHasMore(endIndex < allTransactions.length);
        setError(null);
      }
    } catch (err) {
      console.error('Error fetching transactions:', err);
      setError('Failed to load transactions');
    } finally {
      setLoading(false);
      setRefreshing(false);
      setLoadingMore(false);
    }
  };

  // Fetch on focus
  useFocusEffect(
    useCallback(() => {
      fetchTransactions(1, false);
      setPage(1);
      return () => {
        // Cleanup if needed
      };
    }, [user._id])
  );

  const onRefresh = () => {
    setPage(1);
    fetchTransactions(1, true);
  };

  const loadMore = () => {
    if (hasMore && !loadingMore && !loading) {
      const nextPage = page + 1;
      setPage(nextPage);
      fetchTransactions(nextPage, false);
    }
  };

  const getTransactionIcon = (type, isSender) => {
    if (type === 'scan') {
      return { icon: 'qrcode', color: '#4CAF50' };
    } else if (type === 'deposit') {
      return { icon: 'money-check-alt', color: '#2196F3' };
    } else if (type === 'transfer') {
      return isSender ? { icon: 'arrow-up', color: '#F44336' } : { icon: 'arrow-down', color: '#4CAF50' };
    }
    return { icon: 'exchange-alt', color: '#9C27B0' };
  };

  const getTransactionTitle = (transaction) => {
    if (transaction.type === 'scan') {
      return 'QR Code Scan';
    } else if (transaction.type === 'deposit') {
      return 'Deposit';
    } else if (transaction.type === 'transfer') {
      const isSender = transaction.sender._id === user._id;
      return isSender ? `Sent to ${transaction.receiver?.name || transaction.receiver?.username || 'User'}` 
                      : `Received from ${transaction.sender?.name || transaction.sender?.username || 'User'}`;
    }
    return transaction.description || 'Transaction';
  };

  const getAmountColor = (transaction) => {
    if (transaction.type === 'transfer') {
      return transaction.sender._id === user._id ? '#F44336' : '#4CAF50';
    } else if (transaction.type === 'deposit') {
      return '#4CAF50';
    } else if (transaction.type === 'scan') {
      return '#4CAF50';
    }
    return '#333';
  };

  const getAmountSign = (transaction) => {
    if (transaction.type === 'transfer') {
      return transaction.sender._id === user._id ? '-' : '+';
    } else if (transaction.type === 'deposit' || transaction.type === 'scan') {
      return '+';
    }
    return '';
  };

  const renderTransactionItem = ({item: transaction, index}) => {
    const iconInfo = getTransactionIcon(transaction.type, transaction.sender._id === user._id);
    const isSender = transaction.sender._id === user._id;
    
    return (
      <TouchableOpacity 
        key={transaction._id}
        style={[
          styles.transactionCard,
          index === transactions.length - 1 && styles.lastCard
        ]}
        onPress={() => {
          // Navigate to transaction detail if needed
        }}
      >
        <View style={[
          styles.transactionIcon,
          { backgroundColor: iconInfo.color }
        ]}>
          <Icon2 name={iconInfo.icon} size={18} color="#FFF" />
        </View>
        
        <View style={styles.transactionDetails}>
          <Text style={styles.transactionTitle}>
            {getTransactionTitle(transaction)}
          </Text>
          {transaction.description && (
            <Text style={styles.transactionDesc} numberOfLines={1}>
              {transaction.description}
            </Text>
          )}
          <Text style={styles.transactionDate}>
            {formatDate(transaction.createdAt)}
          </Text>
        </View>
        
        <Text style={[
          styles.transactionAmount,
          { color: getAmountColor(transaction) }
        ]}>
          {getAmountSign(transaction)}₹{transaction.amount.toLocaleString('en-IN')}
        </Text>
      </TouchableOpacity>
    );
  };

  const renderFooter = () => {
    if (loadingMore) {
      return (
        <View style={styles.loadingMoreContainer}>
          <ActivityIndicator size="small" color="#4e4376" />
          <Text style={styles.loadingMoreText}>Loading more...</Text>
        </View>
      );
    }
    
    if (!hasMore && transactions.length > 0) {
      return (
        <View style={styles.noMoreContainer}>
          <Text style={styles.noMoreText}>No more transactions</Text>
        </View>
      );
    }
    
    return null;
  };

  const renderEmptyList = () => {
    if (loading) {
      return (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="small" color="#4e4376" />
          <Text style={styles.loadingText}>Loading transactions...</Text>
        </View>
      );
    }
    
    if (error) {
      return (
        <View style={styles.errorContainer}>
          <Icon name="error-outline" size={40} color="#dc3545" />
          <Text style={styles.errorText}>{error}</Text>
          <TouchableOpacity style={styles.retryButton} onPress={onRefresh}>
            <Text style={styles.retryButtonText}>Retry</Text>
          </TouchableOpacity>
        </View>
      );
    }
    
    return (
      <View style={styles.emptyContainer}>
        <Icon name="receipt" size={60} color="#ccc" />
        <Text style={styles.emptyTitle}>No Transactions</Text>
        <Text style={styles.emptyText}>
          You haven't made any transactions yet
        </Text>
      </View>
    );
  };

  if (loading && transactions.length === 0) {
    return (
      <View style={styles.fullLoadingContainer}>
        <StatusBar backgroundColor="#4e4376" barStyle="light-content" />
        <LinearGradient
          colors={['#4e4376', '#2b5876']}
          style={StyleSheet.absoluteFill}
        />
        <ActivityIndicator size="large" color="#fff" />
        <Text style={styles.fullLoadingText}>Loading Wallet...</Text>
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
          <Icon2 name="wallet" size={22} color="#fff" style={styles.headerIcon} />
          <Text style={styles.headerTitle}>Pistonol Wallet</Text>
        </View>
        <TouchableOpacity 
          onPress={() => navigation.navigate('Terms')}
          style={styles.privacyButton}
        >
          <Icon name="privacy-tip" size={22} color="#fff" />
        </TouchableOpacity>
      </LinearGradient>

      {/* Wallet Card */}
      <TouchableOpacity 
        onPress={() => setShowDetails(!showDetails)}
        activeOpacity={0.9}
        style={styles.walletCardContainer}
      >
        <LinearGradient
          colors={showDetails ? ['#1a2a6c', '#b21f1f', '#fdbb2d'] : ['#2b5876', '#4e4376']}
          style={styles.cardGradient}
          start={{x: 0, y: 0}}
          end={{x: 1, y: 1}}
        >
          {showDetails ? (
            <View style={styles.cardBack}>
              <Icon2 name="crown" size={30} color="#FFD700" style={styles.crownIcon} />
              <Text style={styles.cardBackTitle}>Premium Account</Text>
              <Text style={styles.cardBackText}>Member since {formatDate(user.createdAt)}</Text>
              <Text style={styles.cardBackText}>{user.username}</Text>
              {user.isVerify && (
                <View style={styles.verifiedBadge}>
                  <Icon name="verified" size={16} color="#fff" />
                  <Text style={styles.verifiedText}>Verified</Text>
                </View>
              )}
            </View>
          ) : (
            <View style={styles.cardFront}>
           
              <View style={styles.cardInfoRow}>
                <Icon name="credit-card" size={20} color="rgba(255,255,255,0.8)" />
                <Text style={styles.cardNumber}>•••• •••• •••• {user.username.slice(-4)}</Text>
              </View>
              <View style={styles.cardInfoRow}>
                <Icon name="person" size={18} color="rgba(255,255,255,0.8)" />
                <Text style={styles.cardHolder}>{user.name || user.username || 'User'}</Text>
              </View>
            </View>
          )}
        </LinearGradient>
      </TouchableOpacity>

      {/* Action Buttons */}
      <View style={styles.actionContainer}>
        <TouchableOpacity
          style={styles.actionButton}
          onPress={() => navigation.navigate('TransferScreen', { user })}>
          <LinearGradient
            colors={['#00b09b', '#96c93d']}
            style={styles.buttonGradient}
            start={{x: 0, y: 0}}
            end={{x: 1, y: 0}}>
            <Icon name="send" size={24} color="#FFF" />
            <Text style={styles.buttonText}>Transfer</Text>
          </LinearGradient>
        </TouchableOpacity>

        <TouchableOpacity
          onPress={() => navigation.navigate('walletHistory', { user })}
          style={styles.actionButton}>
          <LinearGradient
            colors={['#a18cd1', '#fbc2eb']}
            style={styles.buttonGradient}
            start={{x: 0, y: 0}}
            end={{x: 1, y: 0}}>
            <Icon name="history" size={24} color="#FFF" />
            <Text style={styles.buttonText}>QR Scan History</Text>
          </LinearGradient>
        </TouchableOpacity>

        <TouchableOpacity
          onPress={() => navigation.navigate('Terms')}
          style={styles.actionButton}>
          <LinearGradient
            colors={['#ff758c', '#ff7eb3']}
            style={styles.buttonGradient}
            start={{x: 0, y: 0}}
            end={{x: 1, y: 0}}>
            <Icon name="security" size={24} color="#FFF" />
            <Text style={styles.buttonText}>Security</Text>
          </LinearGradient>
        </TouchableOpacity>
      </View>

      {/* Recent Transactions with FlatList */}
      <View style={styles.transactionSection}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Recent Transactions</Text>
       
        </View>

        <FlatList
          ref={flatListRef}
          data={transactions}
          renderItem={renderTransactionItem}
          keyExtractor={(item, index) => `${item._id}_${index}`}
          contentContainerStyle={styles.flatListContent}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              colors={['#4e4376']}
              tintColor="#4e4376"
            />
          }
          onEndReached={loadMore}
          onEndReachedThreshold={0.5}
          ListFooterComponent={renderFooter}
          ListEmptyComponent={renderEmptyList}
          removeClippedSubviews={true}
          initialNumToRender={10}
          maxToRenderPerBatch={10}
          windowSize={21}
        />
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  
  // Full Loading
  fullLoadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  fullLoadingText: {
    color: '#fff',
    fontSize: 16,
    marginTop: 15,
    fontWeight: '500',
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
  },
  headerIcon: {
    marginRight: 10,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#fff',
  },
  privacyButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  
  // Wallet Card
  walletCardContainer: {
    marginHorizontal: 16,
    marginTop: 20,
    marginBottom: 20,
    borderRadius: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 8,
  },
  cardGradient: {
    borderRadius: 16,
    padding: 24,
    minHeight: 180,
    justifyContent: 'center',
  },
  cardFront: {
    alignItems: 'center',
  },
  balanceText: {
    color: 'rgba(255,255,255,0.9)',
    fontSize: 14,
    fontWeight: '500',
    marginBottom: 8,
  },
  amountText: {
    color: '#FFF',
    fontSize: 36,
    fontWeight: 'bold',
    marginBottom: 24,
  },
  cardInfoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  cardNumber: {
    color: 'rgba(255,255,255,0.9)',
    fontSize: 14,
    marginLeft: 10,
    fontWeight: '500',
  },
  cardHolder: {
    color: 'rgba(255,255,255,0.9)',
    fontSize: 14,
    marginLeft: 10,
    fontWeight: '500',
  },
  cardBack: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  cardBackTitle: {
    color: '#FFF',
    fontSize: 18,
    fontWeight: 'bold',
    marginTop: 10,
    marginBottom: 5,
  },
  cardBackText: {
    color: 'rgba(255,255,255,0.9)',
    fontSize: 13,
    marginVertical: 4,
  },
  crownIcon: {
    marginBottom: 10,
  },
  verifiedBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(76, 175, 80, 0.3)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
    marginTop: 10,
  },
  verifiedText: {
    color: '#FFF',
    fontSize: 12,
    fontWeight: '600',
    marginLeft: 6,
  },
  
  // Action Buttons
  actionContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    marginBottom: 24,
  },
  actionButton: {
    width: '30%',
    borderRadius: 12,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 3,
  },
  buttonGradient: {
    paddingVertical: 14,
    alignItems: 'center',
  },
  buttonText: {
    color: '#FFF',
    fontWeight: '600',
    fontSize: 12,
    marginTop: 6,
  },
  
  // Transaction Section
  transactionSection: {
    flex: 1,
    backgroundColor: '#fff',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingTop: 20,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  seeAllText: {
    color: '#4e4376',
    fontWeight: '600',
    fontSize: 14,
  },
  
  // FlatList
  flatListContent: {
    paddingHorizontal: 16,
    paddingBottom: 20,
  },
  transactionCard: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  lastCard: {
    borderBottomWidth: 0,
  },
  transactionIcon: {
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  transactionDetails: {
    flex: 1,
  },
  transactionTitle: {
    fontSize: 15,
    fontWeight: '600',
    color: '#333',
    marginBottom: 4,
  },
  transactionDesc: {
    fontSize: 12,
    color: '#666',
    marginBottom: 4,
  },
  transactionDate: {
    fontSize: 11,
    color: '#999',
  },
  transactionAmount: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  
  // Loading More
  loadingMoreContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 20,
  },
  loadingMoreText: {
    marginLeft: 10,
    color: '#666',
    fontSize: 14,
  },
  
  // No More Data
  noMoreContainer: {
    alignItems: 'center',
    paddingVertical: 20,
    borderTopWidth: 1,
    borderTopColor: '#f0f0f0',
    marginTop: 10,
  },
  noMoreText: {
    color: '#999',
    fontSize: 14,
  },
  
  // Loading State
  loadingContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 40,
  },
  loadingText: {
    color: '#666',
    fontSize: 14,
    marginTop: 10,
  },
  
  // Error State
  errorContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 40,
    paddingHorizontal: 20,
  },
  errorText: {
    color: '#dc3545',
    fontSize: 16,
    textAlign: 'center',
    marginTop: 10,
    marginBottom: 20,
  },
  retryButton: {
    backgroundColor: '#4e4376',
    paddingHorizontal: 30,
    paddingVertical: 12,
    borderRadius: 25,
  },
  retryButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  
  // Empty State
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
    paddingHorizontal: 40,
  },
  emptyTitle: {
    fontSize: 18,
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
});

export default WalletScreen;