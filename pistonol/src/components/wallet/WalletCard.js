import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  StyleSheet,
  Dimensions
} from 'react-native';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';
import Icon from 'react-native-vector-icons/MaterialIcons';

const { width } = Dimensions.get('window');

const WalletCard = ( {reciever=null}) => {
  const [walletData, setWalletData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState(null);

  const fetchWalletData = async () => {
    try {
      const userData = await AsyncStorage.getItem('user');
      if (userData) {
        const parsedUser = JSON.parse(userData);
        setUser(parsedUser);
        const response = await axios.get(
          `/transactions/wallet-balance/${parsedUser._id}`
        );
        console.log(response.data)
        if (response.data.success) {
          setWalletData(response.data);
        }
      }
    } catch (error) {
      console.error('Error fetching wallet data:', error);
      Alert.alert('Error', 'Failed to fetch wallet data');
    } finally {
      setLoading(false);
    }
  };

  useFocusEffect(
    React.useCallback(() => {
      fetchWalletData();
    }, [])
  );

const navigation=useNavigation()
  const handleTransferPress = () => {
      navigation.navigate('TransferToCompany', {
      receiver: reciever // Make sure the key matches what TransferFunds expects
    });
  };

  const handleHistoryPress = () => {
    navigation.navigate('TransactionHistory'
 
 

    );
  };




  if (loading) {
    return (
      <View style={styles.card}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="small" color="#FFFFFF" />
          <Text style={styles.loadingText}>Loading Wallet...</Text>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.card}>
      {/* Main Content Row */}
      <View style={styles.mainRow}>
        
        {/* Balance Section */}
        <View style={styles.balanceSection}>
          <Icon name="account-balance-wallet" size={20} color="#FFFFFF" />
          <Text style={styles.balanceLabel}>Available Balance</Text>
          <Text style={styles.balanceAmount}>
            ₹{walletData?.wallet?.toFixed(2) || '0.00'}
          </Text>
          <Text style={styles.userName}>{user?.name    || 'User'}</Text>
        </View>

        {/* Vertical Divider */}
        <View style={styles.divider} />

        {/* Actions Section */}
        <View style={styles.actionsSection}>
          <TouchableOpacity
            style={styles.transferButton}
            onPress={handleTransferPress}
          >
            <Icon name="swap-horiz" size={16} color="#FFFFFF" />
            <Text style={styles.transferText}>Transfer</Text>
          </TouchableOpacity>
          
          <TouchableOpacity
            style={styles.historyButton}
            onPress={handleHistoryPress}
          >
            <Icon name="history" size={16} color="#DC2626" />
            <Text style={styles.historyText}>History</Text>
          </TouchableOpacity>
        </View>

        {/* Vertical Divider */}
        <View style={styles.divider} />

        {/* User Info Section */}
        <View style={styles.userSection}>
          <View style={styles.userBadge}>
            <Icon name="person" size={14} color="#FFFFFF" />
            <Text style={styles.username}>{user?.username}</Text>
          </View>
          <Text style={styles.userRole}>{user?.role?.toUpperCase()}</Text>
          <Icon name="verified-user" size={16} color="#FFFFFF" style={styles.verifiedIcon} />
        </View>

      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: 'linear-gradient(135deg, #3B82F6 0%, #DC2626 100%)',
    backgroundColor: '#3B82F6', // Fallback
    borderRadius: 20,
    padding: 16,
    marginHorizontal: 16,
    marginVertical: 12,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  mainRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  balanceSection: {
    flex: 1,
    alignItems: 'flex-start',
  },
  balanceLabel: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '500',
    marginTop: 4,
    opacity: 0.9,
  },
  balanceAmount: {
    color: '#FFFFFF',
    fontSize: 20,
    fontWeight: 'bold',
    marginTop: 2,
  },
  userName: {
    color: '#FFFFFF',
    fontSize: 11,
    opacity: 0.8,
    marginTop: 2,
  },
  divider: {
    width: 1,
    height: 40,
    backgroundColor: '#FFFFFF',
    opacity: 0.3,
    marginHorizontal: 12,
  },
  actionsSection: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  transferButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 8,
    marginBottom: 6,
    minWidth: 80,
    justifyContent: 'center',
  },
  transferText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '600',
    marginLeft: 4,
  },
  historyButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 8,
    minWidth: 80,
    justifyContent: 'center',
  },
  historyText: {
    color: '#DC2626',
    fontSize: 12,
    fontWeight: '600',
    marginLeft: 4,
  },
  userSection: {
    flex: 1,
    alignItems: 'flex-end',
  },
  userBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderRadius: 8,
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  username: {
    color: '#FFFFFF',
    fontSize: 11,
    fontWeight: '600',
    marginLeft: 4,
  },
  userRole: {
    color: '#FFFFFF',
    fontSize: 10,
    fontWeight: '700',
    marginTop: 4,
    opacity: 0.9,
  },
  verifiedIcon: {
    marginTop: 4,
  },
  loadingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 8,
  },
  loadingText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '500',
    marginLeft: 8,
  },
});

export default WalletCard;