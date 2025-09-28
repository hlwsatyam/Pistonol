import React, {useState} from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Animated,
  ScrollView,
  Easing,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import Icon2 from 'react-native-vector-icons/FontAwesome5';
import LinearGradient from 'react-native-linear-gradient';
import {useNavigation} from '@react-navigation/native';
import ThemeWithBg from '../../Skeleton/ThemeWithBg';
import {formatDate} from '../../locale/Locale';

const WalletScreen = ({route}) => {
  const navigation = useNavigation();
  const [balance] = useState(12580.5);
  const [showDetails, setShowDetails] = useState(false);
  const spinValue = new Animated.Value(0);
  const fadeAnim = new Animated.Value(0);

  const {user} = route.params;
  
  
  // const [transactions] = useState([
  //   {
  //     id: 1,
  //     type: 'credit',

  //     description: 'Coupn Scanned',
  //     date: 'Today, 10:45 AM',
  //     icon: 'money-bill-wave',
  //   },
  //   {
  //     id: 2,
  //     type: 'debit',

  //     description: 'Wallet Transfredd',
  //     date: 'Yesterday, 2:30 PM',
  //     icon: 'gas-pump',
  //   },
  // ]);

  const [transactions] = useState(() => {
    const list = [];

    if (user?.lastScannedAt) {
      list.push({
        id: 1,
        type: 'credit',
        description: 'Coupon Scanned',
        date: formatDate(user.lastScannedAt),
        icon: 'money-bill-wave',
      });
    }

    if (user?.lastTransferedAt) {
      list.push({
        id: 2,
        type: 'debit',
        description: 'Wallet Transferred',
        date: formatDate(user.lastTransferedAt),
        icon: 'gas-pump',
      });
    }

    return list;
  });

  const rotateCard = () => {
    Animated.timing(spinValue, {
      toValue: 1,
      duration: 800,
      easing: Easing.elastic(1),
      useNativeDriver: true,
    }).start(() => {
      spinValue.setValue(0);
      setShowDetails(!showDetails);
    });
  };

  const rotateData = spinValue.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '360deg'],
  });

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
          <Text style={styles.headerTitle}>Pistonol Wallet</Text>
        </View>

        {/* Wallet Card */}
        <Animated.View style={[styles.walletCard, {opacity: fadeAnim}]}>
          <TouchableOpacity onPress={rotateCard} activeOpacity={0.9}>
            <Animated.View style={{transform: [{rotateY: rotateData}]}}>
              <LinearGradient
                colors={
                  showDetails
                    ? ['#1a2a6c', '#b21f1f', '#fdbb2d']
                    : ['#2b5876', '#4e4376']
                }
                style={styles.cardGradient}
                start={{x: 0, y: 0}}
                end={{x: 1, y: 1}}>
                {showDetails ? (
                  <View style={styles.cardBack}>
                    <Text style={styles.cardBackText}>Pistonol Premium</Text>
                    <Icon2
                      name="crown"
                      size={30}
                      color="#FFD700"
                      style={styles.crownIcon}
                    />
                    <Text style={styles.cardBackText}>
                      Member Since {formatDate(user.createdAt)}
                    </Text>
                  </View>
                ) : (
                  <View style={styles.cardFront}>
                    <Text style={styles.balanceText}>Current Balance</Text>
                    <Text style={styles.amountText}>
                      ₹{user?.wallet?.toLocaleString('en-IN')}
                    </Text>
                    <View style={styles.cardNumberContainer}>
                      <Text style={styles.cardNumber}>
                        •••• •••• •••• {user.username.slice(-4)}
                      </Text>
                      <Icon name="sim-card" size={24} color="#FFF" />
                    </View>
                    <Text style={styles.cardHolder}>PISTONOL WALLET</Text>
                  </View>
                )}
              </LinearGradient>
            </Animated.View>
          </TouchableOpacity>
        </Animated.View>

        {/* Action Buttons */}
        <Animated.View style={[styles.actionContainer, {opacity: fadeAnim}]}>
          <TouchableOpacity
            style={styles.actionButton}
            onPress={() => navigation.navigate('TransferScreen'  ,  {user}    )}>
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
            onPress={() => navigation.navigate('walletHistory'  , {user}    )}
            style={styles.actionButton}>
            <LinearGradient
              colors={['#a18cd1', '#fbc2eb']}
              style={styles.buttonGradient}
              start={{x: 0, y: 0}}
              end={{x: 1, y: 0}}>
              <Icon name="history" size={24} color="#FFF" />
              <Text style={styles.buttonText}>History</Text>
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
              <Icon name="add" size={24} color="#FFF" />
              <Text style={styles.buttonText}>Privacy</Text>
            </LinearGradient>
          </TouchableOpacity>
        </Animated.View>

        {/* Recent Transactions */}
        <Animated.View
          style={[styles.transactionContainer, {opacity: fadeAnim}]}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Recent Transactions</Text>
          </View>

          {transactions.map(txn => (
            <View key={txn.id} style={styles.transactionCard}>
              <View
                style={[
                  styles.transactionIcon,
                  {
                    backgroundColor:
                      txn.type === 'credit' ? '#4CAF50' : '#F44336',
                  },
                ]}>
                <Icon2 name={txn.icon} size={18} color="#FFF" />
              </View>
              <View style={styles.transactionDetails}>
                <Text style={styles.transactionDesc}>{txn.description}</Text>
                <Text style={styles.transactionDate}>{txn.date}</Text>
              </View>
            </View>
          ))}
        </Animated.View>
      </ScrollView>
    </ThemeWithBg>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
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
  notificationButton: {
    position: 'relative',
  },
  notificationBadge: {
    position: 'absolute',
    right: -5,
    top: -5,
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: '#FF5252',
  },
  walletCard: {
    marginHorizontal: 20,
    marginTop: 10,
    marginBottom: 25,
    borderRadius: 15,
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 5},
    shadowOpacity: 0.3,
    shadowRadius: 10,
  },
  cardGradient: {
    borderRadius: 15,
    padding: 20,
    height: 200,
    justifyContent: 'center',
  },
  cardFront: {
    alignItems: 'center',
  },
  balanceText: {
    color: 'rgba(255,255,255,0.8)',
    fontSize: 16,
    marginBottom: 5,
  },
  amountText: {
    color: '#FFF',
    fontSize: 36,
    fontWeight: 'bold',
    marginBottom: 20,
  },
  cardNumberContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 15,
  },
  cardNumber: {
    color: '#FFF',
    fontSize: 18,
    letterSpacing: 2,
    marginRight: 10,
  },
  cardHolder: {
    color: 'rgba(255,255,255,0.7)',
    fontSize: 14,
    letterSpacing: 1,
  },
  cardBack: {
    alignItems: 'center',
    justifyContent: 'center',
    height: '100%',
  },
  cardBackText: {
    color: '#FFF',
    fontSize: 13,
    fontWeight: '500',
    marginVertical: 5,
  },
  crownIcon: {
    marginVertical: 15,
  },
  actionContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    marginBottom: 30,
  },
  actionButton: {
    width: '30%',
    borderRadius: 12,
    elevation: 3,
    overflow: 'hidden',
  },
  buttonGradient: {
    paddingVertical: 15,
    alignItems: 'center',
  },
  buttonText: {
    color: '#FFF',
    fontWeight: '600',
    marginTop: 5,
  },
  transactionContainer: {
    marginHorizontal: 20,
    backgroundColor: '#FFF',
    borderRadius: 15,
    padding: 15,
    elevation: 3,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 15,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  seeAllText: {
    color: '#6200EE',
    fontWeight: '500',
  },
  transactionCard: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
  },
  transactionIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#6200EE',
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
});

export default WalletScreen;
