import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Animated,
  ScrollView,
  ActivityIndicator,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import Icon2 from 'react-native-vector-icons/FontAwesome5';
import LinearGradient from 'react-native-linear-gradient';
import {useNavigation} from '@react-navigation/native';
import {useQuery} from '@tanstack/react-query';
import axios from 'axios';
import ThemeWithBg from '../../Skeleton/ThemeWithBg';
import {formatDate} from '../../locale/Locale';

const History = ({route}) => {
  const navigation = useNavigation();
  const fadeAnim = new Animated.Value(0);
  const {user} = route.params;

  const animateIn = () => {
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 1000,
      useNativeDriver: true,
    }).start();
  };

  React.useEffect(() => {
    animateIn();
  }, []);

  const fetchHistory = async () => {
    const response = await axios.get(`/qrcodes/history/${user._id}`);
    return response.data;
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
  console.log(transactions,  error,   isLoading, isError);
  if (isLoading) {
    return (
      <ThemeWithBg>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#4e4376" />
        </View>
      </ThemeWithBg>
    );
  }

  if (isError) {
    return (
      <ThemeWithBg>
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>Failed to load history</Text>
        </View>
      </ThemeWithBg>
    );
  }

  return (
    <ThemeWithBg>
      <ScrollView contentContainerStyle={styles.scrollContainer}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity
            onPress={() => navigation.goBack()}
            style={styles.backButton}>
            <Icon name="arrow-back" size={28} color="#333" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Transaction History</Text>
        </View>

        {/* Transaction List */}
        <Animated.View
          style={[styles.transactionContainer, {opacity: fadeAnim}]}>
          {transactions?.length > 0 ? (
            transactions.map(txn => (
              <View key={txn._id} style={styles.transactionCard}>
                <View
                  style={[
                    styles.transactionIcon,
                    {
                      backgroundColor:
                        txn.user === user._id ? '#4CAF50' : '#F44336',
                    },
                  ]}>
                  <Icon2
                    name={
                      txn.user === user._id ? 'money-bill-wave' : 'gas-pump'
                    }
                    size={18}
                    color="#FFF"
                  />
                </View>
                <View style={styles.transactionDetails}>
                  <Text style={styles.transactionDesc}>
                    {txn.user === user._id
                      ? 'Coupon Scanned'
                      : 'Wallet Transfer'}
                  </Text>
                  <Text style={styles.transactionDate}>
                    {formatDate(txn.scannedAt)}
                  </Text>
                </View>
                <Text
                  style={[
                    styles.transactionAmount,
                    txn.user === user._id
                      ? styles.creditAmount
                      : styles.debitAmount,
                  ]}>
                  {txn.user === user._id ? '+' : '-'}₹{txn.value}
                </Text>
              </View>
            ))
          ) : (
            <View style={styles.emptyContainer}>
              <Icon name="history" size={50} color="#888" />
              <Text style={styles.emptyText}>No transactions found</Text>
            </View>
          )}
        </Animated.View>
      </ScrollView>
    </ThemeWithBg>
  );
};

const styles = StyleSheet.create({
  scrollContainer: {
    paddingBottom: 30,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 20,
  },
  backButton: {
    marginRight: 15,
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#333',
    flex: 1,
  },
  transactionContainer: {
    marginHorizontal: 20,
    backgroundColor: '#FFF',
    borderRadius: 15,
    padding: 15,
    elevation: 3,
    minHeight: 200,
  },
  transactionCard: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  transactionIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 15,
  },
  transactionDetails: {
    flex: 1,
  },
  transactionDesc: {
    fontSize: 15,
    fontWeight: '500',
    color: '#333',
  },
  transactionDate: {
    fontSize: 12,
    color: '#888',
    marginTop: 3,
  },
  transactionAmount: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  creditAmount: {
    color: '#4CAF50',
  },
  debitAmount: {
    color: '#F44336',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  errorText: {
    color: '#F44336',
    fontSize: 18,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 50,
  },
  emptyText: {
    marginTop: 15,
    fontSize: 16,
    color: '#888',
  },
});

export default History;
