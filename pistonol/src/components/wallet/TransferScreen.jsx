import React, {useState} from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Animated,
  ScrollView,
  TextInput,
  Alert,
  ActivityIndicator,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import LinearGradient from 'react-native-linear-gradient';
import {useNavigation, useRoute} from '@react-navigation/native';
import {useMutation, useQueryClient} from '@tanstack/react-query';
import axios from 'axios';
import ThemeWithBg from '../../Skeleton/ThemeWithBg';

const TransferScreen = ({route}) => {
  const navigation = useNavigation();
//   const route = useRoute();
  const {user} = route.params;
  const queryClient = useQueryClient();
  const fadeAnim = new Animated.Value(0);
  const [amount, setAmount] = useState('');
  const [username, setUsername] = useState('');
  const [isTransferring, setIsTransferring] = useState(false);

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

  const transferMutation = useMutation({
    mutationFn: transferFunds,
    onSuccess: () => {
      queryClient.invalidateQueries(['user', user._id]);
      queryClient.invalidateQueries(['walletHistory', user._id]);
      Alert.alert(
        'Success',
        'Transfer completed successfully!',
        [
          {
            text: 'OK',
            onPress: () => navigation.navigate('Wallet', {user}),
          },
        ],
        {cancelable: false},
      );
    },
    onError: error => {
      Alert.alert(
        'Transfer Failed',
        error.response?.data?.message || 'Something went wrong',
      );
    },
    onSettled: () => {
      setIsTransferring(false);
    },
  });

  async function transferFunds() {
    if (!amount || !username) {
      throw new Error('Amount and username are required');
    }

    if (parseFloat(amount) > user.wallet) {
      throw new Error('Insufficient balance');
    }

    const response = await axios.post('/wallet/transfer', {
      senderId: user._id,
      receiverUsername: username,
      amount: parseFloat(amount),
    });

    return response.data;
  }

  const handleTransfer = () => {
    if (!amount || isNaN(amount)) {
      Alert.alert('Error', 'Please enter a valid amount');
      return;
    }

    if (!username) {
      Alert.alert('Error', 'Please enter recipient username');
      return;
    }

    if (parseFloat(amount) <= 0) {
      Alert.alert('Error', 'Amount must be greater than 0');
      return;
    }

    if (parseFloat(amount) > user.wallet) {
      Alert.alert('Error', 'Insufficient balance');
      return;
    }

    setIsTransferring(true);
    transferMutation.mutate();
  };

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
          <Text style={styles.headerTitle}>Transfer Funds</Text>
        </View>

        {/* Transfer Form */}
        <Animated.View style={[styles.formContainer, {opacity: fadeAnim}]}>
          <View style={styles.balanceContainer}>
            <Text style={styles.balanceLabel}>Available Balance</Text>
            <Text style={styles.balanceAmount}>₹{user?.wallet?.toFixed(2)}</Text>
          </View>

          <View style={styles.inputContainer}>
            <Text style={styles.inputLabel}>Amount to Transfer</Text>
            <View style={styles.amountInputContainer}>
              <Text style={styles.currencySymbol}>₹</Text>
              <TextInput
                style={styles.amountInput}
                placeholder="0.00"
                placeholderTextColor="#888"
                keyboardType="numeric"
                value={amount}
                onChangeText={setAmount}
              />
            </View>
          </View>

          <View style={styles.inputContainer}>
            <Text style={styles.inputLabel}>Recipient Username</Text>
            <TextInput
              style={styles.textInput}
              placeholder="Enter username"
              placeholderTextColor="#888"
              value={username}
              onChangeText={setUsername}
            />
          </View>

          <TouchableOpacity
            style={styles.transferButton}
            onPress={handleTransfer}
            disabled={isTransferring}>
            <LinearGradient
              colors={['#00b09b', '#96c93d']}
              style={styles.buttonGradient}
              start={{x: 0, y: 0}}
              end={{x: 1, y: 0}}>
              {isTransferring ? (
                <ActivityIndicator color="#FFF" />
              ) : (
                <>
                  <Icon name="send" size={24} color="#FFF" />
                  <Text style={styles.buttonText}>Transfer Now</Text>
                </>
              )}
            </LinearGradient>
          </TouchableOpacity>
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
  formContainer: {
    marginHorizontal: 20,
    marginTop: 20,
    backgroundColor: '#FFF',
    borderRadius: 15,
    padding: 20,
    elevation: 3,
  },
  balanceContainer: {
    alignItems: 'center',
    marginBottom: 25,
  },
  balanceLabel: {
    fontSize: 16,
    color: '#888',
    marginBottom: 5,
  },
  balanceAmount: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#333',
  },
  inputContainer: {
    marginBottom: 20,
  },
  inputLabel: {
    fontSize: 14,
    color: '#666',
    marginBottom: 8,
    fontWeight: '500',
  },
  textInput: {
    backgroundColor: '#f5f5f5',
    borderRadius: 10,
    padding: 15,
    fontSize: 16,
    color: '#333',
  },
  amountInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f5f5f5',
    borderRadius: 10,
    paddingHorizontal: 15,
  },
  currencySymbol: {
    fontSize: 24,
    color: '#333',
    marginRight: 10,
  },
  amountInput: {
    flex: 1,
    padding: 15,
    fontSize: 24,
    color: '#333',
  },
  transferButton: {
    borderRadius: 12,
    elevation: 3,
    overflow: 'hidden',
    marginTop: 10,
  },
  buttonGradient: {
    paddingVertical: 15,
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'center',
  },
  buttonText: {
    color: '#FFF',
    fontWeight: '600',
    marginLeft: 10,
    fontSize: 16,
  },
});

export default TransferScreen;