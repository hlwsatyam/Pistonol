// import React, { useState, useEffect } from 'react';
// import {
//   View,
//   Text,
//   TextInput,
//   TouchableOpacity,
//   Alert,
//   ScrollView,
//   KeyboardAvoidingView,
//   Platform,
//   ActivityIndicator,
//   StyleSheet,
//   StatusBar,
//   Dimensions
// } from 'react-native';
// import AsyncStorage from '@react-native-async-storage/async-storage';
// import axios from 'axios';
// import Icon from 'react-native-vector-icons/MaterialIcons';

// const { width } = Dimensions.get('window');

// const TransferToCompany = ({ navigation }) => {
//   const [amount, setAmount] = useState('');
//   const [loading, setLoading] = useState(false);
//   const [user, setUser] = useState(null);

//   useEffect(() => {
//     loadUserData();
//   }, []);

//   const loadUserData = async () => {
//     try {
//       const userData = await AsyncStorage.getItem('user');
//       if (userData) {
//         setUser(JSON.parse(userData));
//       }
//     } catch (error) {
//       console.error('Error loading user data:', error);
//     }
//   };

//   const handleTransfer = async () => {
//     if (!amount || parseFloat(amount) <= 0) {
//       Alert.alert('Error', 'Please enter a valid amount');
//       return;
//     }

//     if (!user?._id) {
//       Alert.alert('Error', 'User not found');
//       return;
//     }

//     setLoading(true);
//     try {
//       const response = await axios.post(
//         `/transactions/transfer-to-company`,
//         {
//           senderId: user._id,
//           amount: parseFloat(amount)
//         }
//       );

//       if (response.data.success) {
//         Alert.alert(
//           'Success',
//           `₹${amount} transferred to company successfully!`,
//           [
//             {
//               text: 'OK',
//               onPress: () => {
//                 setAmount('');
//                 navigation.goBack();
//               }
//             }
//           ]
//         );
//       } else {
//         Alert.alert('Error', response.data.message);
//       }
//     } catch (error) {
//       console.error('Transfer error:', error);
//       Alert.alert(
//         'Error',
//         error.response?.data?.message || 'Failed to transfer funds'
//       );
//     } finally {
//       setLoading(false);
//     }
//   };

//   return (
//     <View style={styles.container}>
//       <StatusBar backgroundColor="#3B82F6" barStyle="light-content" />
      
//       {/* Header */}
//       <View style={styles.header}>
//         <TouchableOpacity
//           onPress={() => navigation.goBack()}
//           style={styles.backButton}
//         >
//           <Icon name="arrow-back" size={24} color="#FFFFFF" />
//         </TouchableOpacity>
//         <Text style={styles.headerTitle}>Transfer to Company</Text>
//         <View style={styles.headerIcon}>
//           <Icon name="account-balance" size={24} color="#FFFFFF" />
//         </View>
//       </View>

//       <KeyboardAvoidingView
//         behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
//         style={styles.keyboardView}
//       >
//         <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
//           {/* Main Card */}
//           <View style={styles.mainCard}>
//             {/* Amount Input Section */}
//             <View style={styles.inputSection}>
//               <Text style={styles.sectionTitle}>Enter Amount</Text>
//               <Text style={styles.sectionSubtitle}>
//                 Transfer funds from your wallet to company account
//               </Text>

//               <View style={styles.amountInputContainer}>
//                 <Icon name="currency-rupee" size={24} color="#3B82F6" />
//                 <TextInput
//                   value={amount}
//                   onChangeText={setAmount}
//                   placeholder="0.00"
//                   keyboardType="numeric"
//                   style={styles.amountInput}
//                   placeholderTextColor="#9CA3AF"
//                 />
//               </View>
//             </View>

//             {/* Transfer Details Card */}
//             <View style={styles.detailsCard}>
//               <View style={styles.detailsHeader}>
//                 <Icon name="info" size={18} color="#3B82F6" />
//                 <Text style={styles.detailsTitle}>Transfer Details</Text>
//               </View>
              
//               <View style={styles.detailRow}>
//                 <Icon name="person" size={16} color="#6B7280" />
//                 <Text style={styles.detailText}>
//                   From: {user?.name} ({user?.role})
//                 </Text>
//               </View>
              
//               <View style={styles.detailRow}>
//                 <Icon name="business" size={16} color="#6B7280" />
//                 <Text style={styles.detailText}>To: Company Account</Text>
//               </View>
              
//               <View style={styles.detailRow}>
//                 <Icon name="payments" size={16} color="#6B7280" />
//                 <Text style={styles.detailText}>Amount: ₹{amount || '0.00'}</Text>
//               </View>
//             </View>

//             {/* Transfer Button */}
//             <TouchableOpacity
//               onPress={handleTransfer}
//               disabled={loading || !amount}
//               style={[
//                 styles.transferButton,
//                 (!amount || loading) && styles.disabledButton
//               ]}
//             >
//               {loading ? (
//                 <ActivityIndicator size="small" color="#FFFFFF" />
//               ) : (
//                 <View style={styles.buttonContent}>
//                   <Icon name="send" size={20} color="#FFFFFF" />
//                   <Text style={styles.buttonText}>Transfer Now</Text>
//                 </View>
//               )}
//             </TouchableOpacity>

//             {/* Note Section */}
//             <View style={styles.noteContainer}>
//               <Icon name="verified-user" size={14} color="#9CA3AF" />
//               <Text style={styles.noteText}>
//                 This transaction will be recorded and visible to company for tracking purposes.
//               </Text>
//             </View>
//           </View>

//           {/* Quick Amount Buttons */}
//           <View style={styles.quickAmountContainer}>
//             <Text style={styles.quickAmountTitle}>Quick Amount</Text>
//             <View style={styles.quickAmountRow}>
//               {['100', '500', '1000', '2000'].map((quickAmount) => (
//                 <TouchableOpacity
//                   key={quickAmount}
//                   onPress={() => setAmount(quickAmount)}
//                   style={styles.quickAmountButton}
//                 >
//                   <Text style={styles.quickAmountText}>₹{quickAmount}</Text>
//                 </TouchableOpacity>
//               ))}
//             </View>
//           </View>
//         </ScrollView>
//       </KeyboardAvoidingView>
//     </View>
//   );
// };

// const styles = StyleSheet.create({
//   container: {
//     flex: 1,
//     backgroundColor: '#F8FAFC',
//   },
//   keyboardView: {
//     flex: 1,
//   },
//   scrollView: {
//     flex: 1,
//   },
//   header: {
//     backgroundColor: '#3B82F6',
//     paddingHorizontal: 16,
//     paddingTop: Platform.OS === 'ios' ? 60 : 40,
//     paddingBottom: 20,
//     flexDirection: 'row',
//     alignItems: 'center',
//     justifyContent: 'space-between',
//     shadowColor: '#000',
//     shadowOffset: {
//       width: 0,
//       height: 4,
//     },
//     shadowOpacity: 0.3,
//     shadowRadius: 8,
//     elevation: 8,
//   },
//   backButton: {
//     padding: 4,
//   },
//   headerTitle: {
//     color: '#FFFFFF',
//     fontSize: 20,
//     fontWeight: 'bold',
//     flex: 1,
//     textAlign: 'center',
//     marginLeft: -24,
//   },
//   headerIcon: {
//     padding: 4,
//   },
//   mainCard: {
//     backgroundColor: '#FFFFFF',
//     borderRadius: 20,
//     padding: 20,
//     margin: 16,
//     shadowColor: '#000',
//     shadowOffset: {
//       width: 0,
//       height: 2,
//     },
//     shadowOpacity: 0.1,
//     shadowRadius: 8,
//     elevation: 4,
//   },
//   inputSection: {
//     marginBottom: 24,
//   },
//   sectionTitle: {
//     fontSize: 20,
//     fontWeight: 'bold',
//     color: '#1F2937',
//     marginBottom: 4,
//   },
//   sectionSubtitle: {
//     fontSize: 14,
//     color: '#6B7280',
//     marginBottom: 20,
//   },
//   amountInputContainer: {
//     flexDirection: 'row',
//     alignItems: 'center',
//     borderWidth: 2,
//     borderColor: '#E5E7EB',
//     borderRadius: 16,
//     paddingHorizontal: 16,
//     paddingVertical: 12,
//     backgroundColor: '#F9FAFB',
//   },
//   amountInput: {
//     flex: 1,
//     fontSize: 24,
//     fontWeight: 'bold',
//     color: '#111827',
//     marginLeft: 8,
//   },
//   detailsCard: {
//     backgroundColor: '#F0F9FF',
//     borderRadius: 16,
//     padding: 16,
//     marginBottom: 24,
//     borderLeftWidth: 4,
//     borderLeftColor: '#3B82F6',
//   },
//   detailsHeader: {
//     flexDirection: 'row',
//     alignItems: 'center',
//     marginBottom: 12,
//   },
//   detailsTitle: {
//     fontSize: 16,
//     fontWeight: '600',
//     color: '#3B82F6',
//     marginLeft: 8,
//   },
//   detailRow: {
//     flexDirection: 'row',
//     alignItems: 'center',
//     marginBottom: 8,
//   },
//   detailText: {
//     fontSize: 14,
//     color: '#374151',
//     marginLeft: 8,
//   },
//   transferButton: {
//     backgroundColor: '#3B82F6',
//     borderRadius: 16,
//     paddingVertical: 16,
//     alignItems: 'center',
//     justifyContent: 'center',
//     shadowColor: '#3B82F6',
//     shadowOffset: {
//       width: 0,
//       height: 4,
//     },
//     shadowOpacity: 0.3,
//     shadowRadius: 8,
//     elevation: 6,
//   },
//   disabledButton: {
//     backgroundColor: '#9CA3AF',
//     shadowOpacity: 0,
//   },
//   buttonContent: {
//     flexDirection: 'row',
//     alignItems: 'center',
//   },
//   buttonText: {
//     color: '#FFFFFF',
//     fontSize: 18,
//     fontWeight: 'bold',
//     marginLeft: 8,
//   },
//   noteContainer: {
//     flexDirection: 'row',
//     alignItems: 'flex-start',
//     marginTop: 16,
//     paddingHorizontal: 8,
//   },
//   noteText: {
//     fontSize: 12,
//     color: '#9CA3AF',
//     marginLeft: 8,
//     flex: 1,
//     lineHeight: 16,
//   },
//   quickAmountContainer: {
//     backgroundColor: '#FFFFFF',
//     borderRadius: 20,
//     padding: 20,
//     margin: 16,
//     marginTop: 0,
//     shadowColor: '#000',
//     shadowOffset: {
//       width: 0,
//       height: 2,
//     },
//     shadowOpacity: 0.1,
//     shadowRadius: 8,
//     elevation: 4,
//   },
//   quickAmountTitle: {
//     fontSize: 16,
//     fontWeight: '600',
//     color: '#1F2937',
//     marginBottom: 12,
//   },
//   quickAmountRow: {
//     flexDirection: 'row',
//     justifyContent: 'space-between',
//   },
//   quickAmountButton: {
//     backgroundColor: '#F3F4F6',
//     borderRadius: 12,
//     paddingHorizontal: 16,
//     paddingVertical: 12,
//     minWidth: (width - 96) / 4,
//     alignItems: 'center',
//   },
//   quickAmountText: {
//     fontSize: 14,
//     fontWeight: '600',
//     color: '#374151',
//   },
// });

// export default TransferToCompany;











import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Alert,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
  StyleSheet,
  StatusBar,
  Dimensions,
  Modal,
  FlatList
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';
import Icon from 'react-native-vector-icons/MaterialIcons';

const { width } = Dimensions.get('window');

const TransferFunds = ({ navigation, route }) => {
  const { receiver } = route.params || {};
  console.log('Receiver from route:', receiver); // Check what you're getting
  const [amount, setAmount] = useState('');
  const [loading, setLoading] = useState(false);
  const [user, setUser] = useState(null);
  const [receiverInfo, setReceiverInfo] = useState(null);
  const [usersList, setUsersList] = useState([]);
  const [showUserModal, setShowUserModal] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    loadUserData();
    if (receiver) {
      loadUsersByType();
    } else {
      // Default to company
      loadCompanyInfo();
    }
  }, [receiver]);

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

  const loadCompanyInfo = async () => {
    try {
      const response = await axios.get('/transactions/users/company');
      setReceiverInfo(response.data.data);
    } catch (error) {
      console.error('Error loading company info:', error);
    }
  };

  const loadUsersByType = async () => {
    try {
      const response = await axios.get(`/transactions/users/by-role/${receiver}`);
      setUsersList(response.data.data);
    } catch (error) {
      console.error('Error loading users:', error);
      Alert.alert('Error', 'Could not load users list');
    }
  };

  const handleUserSelect = (selectedUser) => {
    setReceiverInfo(selectedUser);
    setShowUserModal(false);
    setSearchQuery('');
  };

  const handleTransfer = async () => {
    if (!amount || parseFloat(amount) <= 0) {
      Alert.alert('Error', 'Please enter a valid amount');
      return;
    }

    if (!user?._id) {
      Alert.alert('Error', 'User not found');
      return;
    }

    if (!receiverInfo?._id) {
      Alert.alert('Error', 'Please select a recipient');
      return;
    }

    setLoading(true);
    try {
      const transferData = {
        senderId: user._id,
        amount: parseFloat(amount)
      };

      // Add receiverId for all transfers
      transferData.receiverId = receiverInfo._id;

      const response = await axios.post('/transactions/transfer', transferData);

      if (response.data.success) {
        Alert.alert(
          'Success',
          `₹${amount} transferred successfully to ${receiverInfo.businessName || receiverInfo.name || 'Company'}!`,
          [
            {
              text: 'OK',
              onPress: () => {
                setAmount('');
                navigation.goBack();
              }
            }
          ]
        );
      } else {
        Alert.alert('Error', response.data.message);
      }
    } catch (error) {
      console.error('Transfer error:', error);
      Alert.alert(
        'Error',
        error.response?.data?.message || 'Failed to transfer funds'
      );
    } finally {
      setLoading(false);
    }
  };

  const getTransferTitle = () => {
    if (!receiver) {
      return 'Transfer to Company';
    }
    return `Transfer to ${receiver}`;
  };

  const getReceiverDisplay = () => {
    if (!receiverInfo) {
      return 'Select Recipient';
    }
    return `${receiverInfo.businessName || receiverInfo.name} (${receiverInfo.role})`;
  };

  const getReceiverContact = () => {
    if (!receiverInfo) return '';
    
    if (receiverInfo.email && receiverInfo.mobile) {
      return `${receiverInfo.email} • ${receiverInfo.mobile}`;
    }
    return receiverInfo.email || receiverInfo.mobile || '';
  };

  const filteredUsers = usersList.filter(user => 
    user.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    user.businessName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    user.email?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    user.mobile?.includes(searchQuery)
  );

  const UserModal = () => (
    <Modal
      visible={showUserModal}
      animationType="slide"
      transparent={true}
      onRequestClose={() => setShowUserModal(false)}
    >
      <View style={styles.modalContainer}>
        <View style={styles.modalContent}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Select {receiver}</Text>
            <TouchableOpacity onPress={() => setShowUserModal(false)}>
              <Icon name="close" size={24} color="#333" />
            </TouchableOpacity>
          </View>

          <TextInput
            style={styles.searchInput}
            placeholder={`Search ${receiver} by name, email or mobile...`}
            value={searchQuery}
            onChangeText={setSearchQuery}
          />

          <FlatList
            data={filteredUsers}
            keyExtractor={(item) => item._id}
            renderItem={({ item }) => (
              <TouchableOpacity
                style={styles.userItem}
                onPress={() => handleUserSelect(item)}
              >
                <View style={styles.userInfo}>
                  <Text style={styles.userName}>
                    {item.businessName || item.name}
                  </Text>
                  <Text style={styles.userDetails}>
                    {item.email} • {item.mobile}
                  </Text>
                  <Text style={styles.userWallet}>
                    Wallet: ₹{item.wallet?.toLocaleString() || '0'}
                  </Text>
                </View>
                <Icon name="chevron-right" size={20} color="#666" />
              </TouchableOpacity>
            )}
            ListEmptyComponent={
              <Text style={styles.noUsersText}>No {receiver}s found</Text>
            }
          />
        </View>
      </View>
    </Modal>
  );

  return (
    <View style={styles.container}>
      <StatusBar backgroundColor="#3B82F6" barStyle="light-content" />
      
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          style={styles.backButton}
        >
          <Icon name="arrow-back" size={24} color="#FFFFFF" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>{getTransferTitle()}</Text>
        <View style={styles.headerIcon}>
          <Icon name="account-balance" size={24} color="#FFFFFF" />
        </View>
      </View>

      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardView}
      >
        <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
          {/* Main Card */}
          <View style={styles.mainCard}>
            {/* Recipient Selection (Only show if receiver type is provided) */}
            {receiver && (
              <View style={styles.recipientSection}>
                <Text style={styles.sectionTitle}>Select Recipient</Text>
                <TouchableOpacity
                  style={styles.recipientSelector}
                  onPress={() => setShowUserModal(true)}
                >
                  <View style={styles.recipientInfo}>
                    <Icon name="person" size={20} color="#3B82F6" />
                    <View style={styles.recipientText}>
                      <Text style={styles.recipientName}>
                        {getReceiverDisplay()}
                      </Text>
                      {receiverInfo && (
                        <Text style={styles.recipientContact}>
                          {getReceiverContact()}
                        </Text>
                      )}
                    </View>
                  </View>
                  <Icon name="arrow-drop-down" size={24} color="#666" />
                </TouchableOpacity>
              </View>
            )}

            {/* Amount Input Section */}
            <View style={styles.inputSection}>
              <Text style={styles.sectionTitle}>Enter Amount</Text>
              <Text style={styles.sectionSubtitle}>
                Transfer funds from your wallet
              </Text>

              <View style={styles.amountInputContainer}>
                <Icon name="currency-rupee" size={24} color="#3B82F6" />
                <TextInput
                  value={amount}
                  onChangeText={setAmount}
                  placeholder="0.00"
                  keyboardType="numeric"
                  style={styles.amountInput}
                  placeholderTextColor="#9CA3AF"
                />
              </View>
            </View>

            {/* Transfer Details Card */}
            <View style={styles.detailsCard}>
              <View style={styles.detailsHeader}>
                <Icon name="info" size={18} color="#3B82F6" />
                <Text style={styles.detailsTitle}>Transfer Details</Text>
              </View>
              
              <View style={styles.detailRow}>
                <Icon name="person" size={16} color="#6B7280" />
                <Text style={styles.detailText}>
                  From: {user?.name} ({user?.role})
                </Text>
              </View>
              
              <View style={styles.detailRow}>
                <Icon name="business" size={16} color="#6B7280" />
                <Text style={styles.detailText}>
                  To: {getReceiverDisplay()}
                </Text>
              </View>

              {getReceiverContact() && (
                <View style={styles.detailRow}>
                  <Icon name="contact-mail" size={16} color="#6B7280" />
                  <Text style={styles.detailText}>
                    Contact: {getReceiverContact()}
                  </Text>
                </View>
              )}
              
              <View style={styles.detailRow}>
                <Icon name="payments" size={16} color="#6B7280" />
                <Text style={styles.detailText}>Amount: ₹{amount || '0.00'}</Text>
              </View>
            </View>

            {/* Transfer Button */}
            <TouchableOpacity
              onPress={handleTransfer}
              disabled={loading || !amount || !receiverInfo}
              style={[
                styles.transferButton,
                (!amount || loading || !receiverInfo) && styles.disabledButton
              ]}
            >
              {loading ? (
                <ActivityIndicator size="small" color="#FFFFFF" />
              ) : (
                <View style={styles.buttonContent}>
                  <Icon name="send" size={20} color="#FFFFFF" />
                  <Text style={styles.buttonText}>
                    {receiver ? 'Transfer to User' : 'Transfer to Company'}
                  </Text>
                </View>
              )}
            </TouchableOpacity>

            {/* Note Section */}
            <View style={styles.noteContainer}>
              <Icon name="verified-user" size={14} color="#9CA3AF" />
              <Text style={styles.noteText}>
                This transaction will be recorded and visible in your transaction history.
              </Text>
            </View>
          </View>

          {/* Quick Amount Buttons */}
          <View style={styles.quickAmountContainer}>
            <Text style={styles.quickAmountTitle}>Quick Amount</Text>
            <View style={styles.quickAmountRow}>
              {['100', '500', '1000', '2000'].map((quickAmount) => (
                <TouchableOpacity
                  key={quickAmount}
                  onPress={() => setAmount(quickAmount)}
                  style={styles.quickAmountButton}
                >
                  <Text style={styles.quickAmountText}>₹{quickAmount}</Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          {/* Current Balance */}
          <View style={styles.balanceContainer}>
            <Text style={styles.balanceLabel}>Your Current Balance</Text>
            <Text style={styles.balanceAmount}>₹{user?.wallet?.toLocaleString() || '0'}</Text>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>

      <UserModal />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  keyboardView: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  header: {
    backgroundColor: '#3B82F6',
    paddingHorizontal: 16,
    paddingTop: Platform.OS === 'ios' ? 60 : 40,
    paddingBottom: 20,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  backButton: {
    padding: 4,
  },
  headerTitle: {
    color: '#FFFFFF',
    fontSize: 20,
    fontWeight: 'bold',
    flex: 1,
    textAlign: 'center',
    marginLeft: -24,
  },
  headerIcon: {
    padding: 4,
  },
  mainCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 20,
    margin: 16,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  recipientSection: {
    marginBottom: 20,
  },
  recipientSelector: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderWidth: 2,
    borderColor: '#E5E7EB',
    borderRadius: 12,
    padding: 16,
    backgroundColor: '#F9FAFB',
  },
  recipientInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  recipientText: {
    marginLeft: 12,
    flex: 1,
  },
  recipientName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
  },
  recipientContact: {
    fontSize: 12,
    color: '#6B7280',
    marginTop: 2,
  },
  inputSection: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1F2937',
    marginBottom: 8,
  },
  sectionSubtitle: {
    fontSize: 14,
    color: '#6B7280',
    marginBottom: 16,
  },
  amountInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#E5E7EB',
    borderRadius: 16,
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#F9FAFB',
  },
  amountInput: {
    flex: 1,
    fontSize: 24,
    fontWeight: 'bold',
    color: '#111827',
    marginLeft: 8,
  },
  detailsCard: {
    backgroundColor: '#F0F9FF',
    borderRadius: 16,
    padding: 16,
    marginBottom: 24,
    borderLeftWidth: 4,
    borderLeftColor: '#3B82F6',
  },
  detailsHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  detailsTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#3B82F6',
    marginLeft: 8,
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  detailText: {
    fontSize: 14,
    color: '#374151',
    marginLeft: 8,
  },
  transferButton: {
    backgroundColor: '#3B82F6',
    borderRadius: 16,
    paddingVertical: 16,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#3B82F6',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },
  disabledButton: {
    backgroundColor: '#9CA3AF',
    shadowOpacity: 0,
  },
  buttonContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  buttonText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: 'bold',
    marginLeft: 8,
  },
  noteContainer: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginTop: 16,
    paddingHorizontal: 8,
  },
  noteText: {
    fontSize: 12,
    color: '#9CA3AF',
    marginLeft: 8,
    flex: 1,
    lineHeight: 16,
  },
  quickAmountContainer: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 20,
    margin: 16,
    marginTop: 0,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  quickAmountTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1F2937',
    marginBottom: 12,
  },
  quickAmountRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  quickAmountButton: {
    backgroundColor: '#F3F4F6',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    minWidth: (width - 96) / 4,
    alignItems: 'center',
  },
  quickAmountText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#374151',
  },
  balanceContainer: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 20,
    margin: 16,
    marginTop: 0,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  balanceLabel: {
    fontSize: 14,
    color: '#6B7280',
    marginBottom: 8,
  },
  balanceAmount: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#10B981',
  },
  // Modal Styles
  modalContainer: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: 'white',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    maxHeight: '80%',
    paddingBottom: Platform.OS === 'ios' ? 34 : 20,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#111827',
  },
  searchInput: {
    margin: 16,
    padding: 12,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 12,
    backgroundColor: '#F9FAFB',
  },
  userItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  userInfo: {
    flex: 1,
  },
  userName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 4,
  },
  userDetails: {
    fontSize: 12,
    color: '#6B7280',
    marginBottom: 4,
  },
  userWallet: {
    fontSize: 12,
    color: '#10B981',
    fontWeight: '500',
  },
  noUsersText: {
    textAlign: 'center',
    padding: 20,
    color: '#6B7280',
    fontStyle: 'italic',
  },
});

export default TransferFunds;