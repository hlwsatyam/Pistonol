// import React, { useState, useEffect } from 'react';
// import {
//   View,
//   Text,
//   TouchableOpacity,
//   Modal,
//   TextInput,
//   StyleSheet,
//   ToastAndroid,
//   ActivityIndicator
// } from 'react-native';
// import { Camera, CameraType } from 'react-native-camera-kit';
// import AsyncStorage from '@react-native-async-storage/async-storage';
// import Ionicons from 'react-native-vector-icons/Ionicons';
// import axios from 'axios';

// // API base URL
 

// const QRScannerButton = ({ onSuccess }) => {
//   const [showModal, setShowModal] = useState(false);
//   const [user, setUser] = useState(null);
//   const [tab, setTab] = useState('scan');
//   const [code, setCode] = useState('');
//   const [loading, setLoading] = useState(false);

//   // User load karo
//   const loadUser = async () => {
//     try {
//       const data = await AsyncStorage.getItem('user');
//       if (data) {
//         setUser(JSON.parse(data));
//       } else {
//         ToastAndroid.show('User not found', ToastAndroid.SHORT);
//         setShowModal(false);
//       }
//     } catch (error) {
//       ToastAndroid.show('Failed to load user', ToastAndroid.SHORT);
//     }
//   };

//   // Modal open pe user load
//   useEffect(() => {
//     if (showModal) {
//       loadUser();
//     }
//   }, [showModal]);

//   const verifyCode = async (scannedCode) => {
//     if (!user) return;
// console.log(scannedCode)
//     setLoading(true);
    
//     try {
//       // Code parse
//       let finalCode = scannedCode;
//       try {
//         const parsed = JSON.parse(scannedCode);
//         finalCode = parsed?.code || parsed?.uniqueCode || scannedCode;
//       } catch (e) {
//         finalCode = scannedCode;
//       }

//       // API call with axios
//       const response = await axios.post(`/qrcodes/verification`, {
//         code: finalCode,
//         _id: user._id,
//         role: user.role
//       });

//       if (response.data) {
//         ToastAndroid.show(
//           `Success! `,
//           ToastAndroid.LONG
//         );
        
//         setShowModal(false);
//         setCode('');
//         if (onSuccess) onSuccess(response.data);
//       }
//     } catch (error) {
//       // Axios error handling
//       const errorMsg = error.response?.data?.message || error.message || 'Network error';
//       ToastAndroid.show(errorMsg, ToastAndroid.SHORT);
//     } finally {
//       setLoading(false);
//     }
//   };

//   const handleSubmit = () => {
//     if (code.trim()) {
//       verifyCode(code);
//     } else {
//       ToastAndroid.show('Enter code', ToastAndroid.SHORT);
//     }
//   };

//   return (
//     <>
//       {/* Button */}
//       <TouchableOpacity style={styles.button} onPress={() => setShowModal(true)}>
//         <Ionicons name="qr-code" size={22} color="white" />
//         <Text style={styles.buttonText}>Scan QR</Text>
//       </TouchableOpacity>

//       {/* Modal */}
//       <Modal
//         visible={showModal}
//         animationType="slide"
//         transparent={true}
//         onRequestClose={() => {
//           setShowModal(false);
//           setCode('');
//         }}
//       >
//         <View style={styles.modal}>
//           {/* Tabs */}
//           <View style={styles.tabs}>
//             <TouchableOpacity
//               style={[styles.tab, tab === 'scan' && styles.activeTab]}
//               onPress={() => setTab('scan')}
//             >
//               <Text style={[styles.tabText, tab === 'scan' && styles.activeText]}>
//                 Scan
//               </Text>
//             </TouchableOpacity>
            
//             <TouchableOpacity
//               style={[styles.tab, tab === 'manual' && styles.activeTab]}
//               onPress={() => setTab('manual')}
//             >
//               <Text style={[styles.tabText, tab === 'manual' && styles.activeText]}>
//                 Manual
//               </Text>
//             </TouchableOpacity>
//           </View>

//           {/* Content */}
//           <View style={styles.content}>
//             {tab === 'scan' ? (
//               <View style={styles.cameraContainer}>
//                 <Camera
//                   style={styles.camera}
//                   cameraType={CameraType.Back}
//                   scanBarcode={true}
//                   onReadCode={(e) => {
//                     if (!loading) {
//                       verifyCode(e.nativeEvent.codeStringValue);
//                     }
//                   }}
//                 />
//                 <View style={styles.scanFrame} />
//               </View>
//             ) : (
//               <View style={styles.manualContainer}>
//                 <View style={styles.inputBox}>
//                   <Ionicons name="barcode" size={24} color="#007AFF" />
//                   <TextInput
//                     style={styles.input}
//                     value={code}
//                     onChangeText={setCode}
//                     placeholder="Enter 8-digit code"
//                     placeholderTextColor="#888"
//                     onSubmitEditing={handleSubmit}
//                   />
//                 </View>
                
//                 <TouchableOpacity
//                   style={[styles.submit, loading && { opacity: 0.6 }]}
//                   onPress={handleSubmit}
//                   disabled={loading}
//                 >
//                   {loading ? (
//                     <ActivityIndicator color="white" />
//                   ) : (
//                     <>
//                       <Ionicons name="checkmark" size={20} color="white" />
//                       <Text style={styles.submitText}>Verify</Text>
//                     </>
//                   )}
//                 </TouchableOpacity>
//               </View>
//             )}
//           </View>

//           {/* Close */}
//           <TouchableOpacity
//             style={styles.close}
//             onPress={() => setShowModal(false)}
//             disabled={loading}
//           >
//             <Ionicons name="close-circle" size={36} color="white" />
//           </TouchableOpacity>
//         </View>
//       </Modal>
//     </>
//   );
// };

// const styles = StyleSheet.create({
//   button: {
//     flexDirection: 'row',
//     backgroundColor: '#007AFF',
//     padding: 12,
//     borderRadius: 8,
//     alignItems: 'center',
//     justifyContent: 'center',
//     margin: 8,
//     elevation: 2,
//   },
//   buttonText: {
//     color: 'white',
//     marginLeft: 8,
//     fontSize: 16,
//     fontWeight: '600',
//   },
  
//   modal: {
//     flex: 1,
//     backgroundColor: 'rgba(0,0,0,0.95)',
//     paddingTop: 40,
//   },
  
//   tabs: {
//     flexDirection: 'row',
//     backgroundColor: '#222',
//     marginHorizontal: 20,
//     borderRadius: 10,
//     padding: 4,
//   },
//   tab: {
//     flex: 1,
//     padding: 12,
//     alignItems: 'center',
//     borderRadius: 8,
//   },
//   activeTab: {
//     backgroundColor: '#007AFF',
//   },
//   tabText: {
//     color: '#aaa',
//     fontSize: 16,
//   },
//   activeText: {
//     color: 'white',
//     fontWeight: 'bold',
//   },
  
//   content: {
//     flex: 1,
//     margin: 20,
//     marginTop: 10,
//   },
  
//   cameraContainer: {
//     flex: 1,
//     borderRadius: 10,
//     overflow: 'hidden',
//   },
//   camera: {
//     flex: 1,
//   },
//   scanFrame: {
//     position: 'absolute',
//     top: '25%',
//     left: '15%',
//     right: '15%',
//     bottom: '25%',
//     borderWidth: 2,
//     borderColor: '#007AFF',
//     borderRadius: 10,
//   },
  
//   manualContainer: {
//     flex: 1,
//     backgroundColor: 'white',
//     borderRadius: 10,
//     padding: 20,
//     justifyContent: 'center',
//   },
//   inputBox: {
//     flexDirection: 'row',
//     alignItems: 'center',
//     borderWidth: 1,
//     borderColor: '#ddd',
//     borderRadius: 8,
//     paddingHorizontal: 12,
//     marginBottom: 20,
//   },
//   input: {
//     flex: 1,
//     padding: 12,
//     fontSize: 16,
//     color: '#000',
//   },
//   submit: {
//     backgroundColor: '#007AFF',
//     padding: 14,
//     borderRadius: 8,
//     alignItems: 'center',
//     flexDirection: 'row',
//     justifyContent: 'center',
//   },
//   submitText: {
//     color: 'white',
//     fontSize: 16,
//     fontWeight: 'bold',
//     marginLeft: 5,
//   },
  
//   close: {
//     position: 'absolute',
//     top: 5,
//     right: 20,
//     padding: 5,
//   },
// });

// export default QRScannerButton;














import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  Modal,
  TextInput,
  StyleSheet,
  ToastAndroid,
  ActivityIndicator,
  Alert
} from 'react-native';
import { Camera, CameraType } from 'react-native-camera-kit';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Ionicons from 'react-native-vector-icons/Ionicons';
import axios from 'axios';

const QRScannerButton = ({ onSuccess }) => {
  const [showModal, setShowModal] = useState(false);
  const [user, setUser] = useState(null);
  const [tab, setTab] = useState('scan');
  const [code, setCode] = useState('');
  const [loading, setLoading] = useState(false);
  
  // Transfer flow states (sirf QR scan ke liye)
  const [showTransferModal, setShowTransferModal] = useState(false);
  const [receiverUser, setReceiverUser] = useState(null);
  const [transferAmount, setTransferAmount] = useState('');
  const [transferLoading, setTransferLoading] = useState(false);

  // User load karo
  const loadUser = async () => {
    try {
      const data = await AsyncStorage.getItem('user');
      if (data) {
        setUser(JSON.parse(data));
      } else {
        ToastAndroid.show('User not found', ToastAndroid.SHORT);
        setShowModal(false);
      }
    } catch (error) {
      ToastAndroid.show('Failed to load user', ToastAndroid.SHORT);
    }
  };

  // Modal open pe user load
  useEffect(() => {
    if (showModal) {
      loadUser();
    }
  }, [showModal]);

  // QR scan से user detect करने का function
  const detectUserFromQR = (scannedCode) => {
    try {
      const parsed = JSON.parse(scannedCode);
      console.log(parsed)
      // Check if it's a user verification QR (has userId and username)
      if (parsed.userId && parsed.username  ) {
        return {
          _id: parsed.userId,
          username: parsed.username,
          name: parsed.name || parsed.username,
          role: parsed.role,
          mobile: parsed.mobile || '',
          businessName: parsed.businessName || ''
        };
      }
    } catch (e) {
      // Not a valid JSON, not a user QR
    }
    return null;
  };

  // QR scan verification
  const verifyCode = async (scannedCode) => {
    if (!user) return;

    console.log('Scanned Code:', scannedCode);
    setLoading(true);
    
    try {
      // Check if QR contains user data
      const detectedUser = detectUserFromQR(scannedCode);
      
      if (detectedUser) {
        // Don't allow transfer to self
        if (detectedUser._id === user._id) {
          ToastAndroid.show('Cannot transfer to yourself', ToastAndroid.SHORT);
          setLoading(false);
          return;
        }
        console.log(detectedUser)
        console.log(detectedUser.name)
        // Show transfer modal
        setReceiverUser(detectedUser);
        setShowModal(false);
        setShowTransferModal(true);
        setLoading(false);
        return;
      }
      
      // Extract code for product verification
      let finalCode = scannedCode;
      try {
        const parsed = JSON.parse(scannedCode);
        // If it's product QR with code field
        if (parsed.code) {
          finalCode = parsed.code;
        }
      } catch (e) {
        // Not JSON, use as is
      }

      // Original verification for product QR codes
      const response = await axios.post(`/qrcodes/verification`, {
        code: finalCode,
        _id: user._id,
        role: user.role
      });

      if (response.data) {
        ToastAndroid.show(
          `Success! `,
          ToastAndroid.LONG
        );
        
        setShowModal(false);
        setCode('');
        if (onSuccess) onSuccess(response.data);
      }
    } catch (error) {
      const errorMsg = error.response?.data?.message || error.message || 'Network error';
      ToastAndroid.show(errorMsg, ToastAndroid.SHORT);
    } finally {
      setLoading(false);
    }
  };

  // Manual input submission (sirf normal verification)
  const handleSubmit = () => {
    if (code.trim()) {
      // Manual input में सिर्फ normal verification
      verifyCode(code);
    } else {
      ToastAndroid.show('Enter code', ToastAndroid.SHORT);
    }
  };

  // Transfer function
  const handleTransfer = async () => {
    if (!transferAmount || parseFloat(transferAmount) <= 0) {
      ToastAndroid.show('Enter valid amount', ToastAndroid.SHORT);
      return;
    }

    if (!receiverUser) {
      ToastAndroid.show('Receiver not found', ToastAndroid.SHORT);
      return;
    }

    setTransferLoading(true);
    try {
      const response = await axios.post('/transactions/transfer', {
        senderId: user._id,
        receiverId: receiverUser._id,
        amount: parseFloat(transferAmount)
      });

      if (response.data.success) {
        ToastAndroid.show('Transfer successful!', ToastAndroid.LONG);
        
        // Update local user wallet
        const updatedUser = { ...user, wallet: response.data.updatedWallet };
        await AsyncStorage.setItem('user', JSON.stringify(updatedUser));
        setUser(updatedUser);
        
        // Close modals and reset
        setShowTransferModal(false);
        setReceiverUser(null);
        setTransferAmount('');
        
        if (onSuccess) onSuccess(response.data.transaction);
      }
    } catch (error) {
      const errorMsg = error.response?.data?.message || error.message || 'Transfer failed';
      ToastAndroid.show(errorMsg, ToastAndroid.SHORT);
    } finally {
      setTransferLoading(false);
    }
  };

  // Transfer Confirmation
  const confirmTransfer = () => {
    if (!transferAmount || parseFloat(transferAmount) <= 0) return;

    Alert.alert(
      'Confirm Transfer',
      `Send ₹${transferAmount} to ${receiverUser.name || receiverUser.username}?`,
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Confirm', onPress: handleTransfer }
      ]
    );
  };

  return (
    <>
      {/* Scan Button */}
      <TouchableOpacity style={styles.button} onPress={() => setShowModal(true)}>
        <Ionicons name="qr-code" size={22} color="white" />
        <Text style={styles.buttonText}>Scan QR</Text>
      </TouchableOpacity>

      {/* QR Scan Modal */}
      <Modal
        visible={showModal}
        animationType="slide"
        transparent={true}
        onRequestClose={() => {
          setShowModal(false);
          setCode('');
        }}
      >
        <View style={styles.modal}>
          {/* Tabs */}
          <View style={styles.tabs}>
            <TouchableOpacity
              style={[styles.tab, tab === 'scan' && styles.activeTab]}
              onPress={() => setTab('scan')}
            >
              <Text style={[styles.tabText, tab === 'scan' && styles.activeText]}>
                Scan
              </Text>
            </TouchableOpacity>
            
            <TouchableOpacity
              style={[styles.tab, tab === 'manual' && styles.activeTab]}
              onPress={() => setTab('manual')}
            >
              <Text style={[styles.tabText, tab === 'manual' && styles.activeText]}>
                Manual
              </Text>
            </TouchableOpacity>
          </View>

          {/* Content */}
          <View style={styles.content}>
            {tab === 'scan' ? (
              <View style={styles.cameraContainer}>
                <Camera
                  style={styles.camera}
                  cameraType={CameraType.Back}
                  scanBarcode={true}
                  onReadCode={(e) => {
                    if (!loading) {
                      verifyCode(e.nativeEvent.codeStringValue);
                    }
                  }}
                />
                <View style={styles.scanFrame} />
              </View>
            ) : (
              <View style={styles.manualContainer}>
                <View style={styles.inputBox}>
                  <Ionicons name="barcode" size={24} color="#007AFF" />
                  <TextInput
                    style={styles.input}
                    value={code}
                    onChangeText={setCode}
                    placeholder="Enter 8-digit code"
                    placeholderTextColor="#888"
                    onSubmitEditing={handleSubmit}
                  />
                </View>
                
                <TouchableOpacity
                  style={[styles.submit, loading && { opacity: 0.6 }]}
                  onPress={handleSubmit}
                  disabled={loading}
                >
                  {loading ? (
                    <ActivityIndicator color="white" />
                  ) : (
                    <>
                      <Ionicons name="checkmark" size={20} color="white" />
                      <Text style={styles.submitText}>Verify</Text>
                    </>
                  )}
                </TouchableOpacity>
              </View>
            )}
          </View>

          {/* Close */}
          <TouchableOpacity
            style={styles.close}
            onPress={() => setShowModal(false)}
            disabled={loading}
          >
            <Ionicons name="close-circle" size={36} color="white" />
          </TouchableOpacity>
        </View>
      </Modal>

      {/* Transfer Modal (sirf QR scan से open होगा) */}
      <Modal
        visible={showTransferModal}
        animationType="slide"
        transparent={true}
        onRequestClose={() => {
          setShowTransferModal(false);
          setTransferAmount('');
          setReceiverUser(null);
        }}
      >
        <View style={styles.transferModal}>
          <View style={styles.transferCard}>
            {/* Header */}
            <View style={styles.transferHeader}>
              <Text style={styles.transferTitle}>Send Money</Text>
              <TouchableOpacity onPress={() => setShowTransferModal(false)}>
                <Ionicons name="close" size={24} color="#666" />
              </TouchableOpacity>
            </View>

            {/* Receiver Info */}
            {receiverUser && (
              <View style={styles.receiverInfo}>
                <View style={styles.receiverAvatar}>
                  <Ionicons name="person" size={30} color="#007AFF" />
                </View>
                <View style={styles.receiverDetails}>
                  <Text style={styles.receiverName}>
                    {receiverUser.name || receiverUser.username}
                  </Text>
               
                  <Text style={styles.receiverRole}>
                    {receiverUser.role?.toUpperCase()}
                  </Text>
                  {receiverUser.businessName && (
                    <Text style={styles.receiverBusiness}>
                      {receiverUser.businessName}
                    </Text>
                  )}
                </View>
              </View>
            )}

            {/* Amount Input */}
            <View style={styles.amountContainer}>
              <Text style={styles.amountLabel}>Enter Amount</Text>
              <View style={styles.amountInputContainer}>
                <Text style={styles.currencySymbol}>₹</Text>
                <TextInput
                  style={styles.amountInput}
                  value={transferAmount}
                  onChangeText={setTransferAmount}
                  placeholder="0.00"
                  placeholderTextColor="#999"
                  keyboardType="decimal-pad"
                  autoFocus={true}
                />
              </View>
              
              {/* Wallet Balance */}
              <View style={styles.walletBalance}>
                <Text style={styles.balanceLabel}>Your Balance:</Text>
                <Text style={styles.balanceAmount}>₹{user?.wallet || 0}</Text>
              </View>
            </View>

            {/* Quick Amount Buttons */}
            <View style={styles.quickAmounts}>
              {[100, 200, 500, 1000].map(amount => (
                <TouchableOpacity
                  key={amount}
                  style={styles.quickButton}
                  onPress={() => setTransferAmount(amount.toString())}
                >
                  <Text style={styles.quickButtonText}>₹{amount}</Text>
                </TouchableOpacity>
              ))}
            </View>

            {/* Transfer Button */}
            <TouchableOpacity
              style={[
                styles.transferButton,
                (!transferAmount || parseFloat(transferAmount) <= 0 || transferLoading) && 
                { opacity: 0.6 }
              ]}
              onPress={confirmTransfer}
              disabled={!transferAmount || parseFloat(transferAmount) <= 0 || transferLoading}
            >
              {transferLoading ? (
                <ActivityIndicator color="white" />
              ) : (
                <>
                  <Ionicons name="send" size={20} color="white" />
                  <Text style={styles.transferButtonText}>
                    Send ₹{transferAmount || '0'}
                  </Text>
                </>
              )}
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </>
  );
};

const styles = StyleSheet.create({
  button: {
    flexDirection: 'row',
    backgroundColor: '#007AFF',
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    margin: 8,
    elevation: 2,
  },
  buttonText: {
    color: 'white',
    marginLeft: 8,
    fontSize: 16,
    fontWeight: '600',
  },
  
  // QR Modal Styles
  modal: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.95)',
    paddingTop: 40,
  },
  
  tabs: {
    flexDirection: 'row',
    backgroundColor: '#222',
    marginHorizontal: 20,
    borderRadius: 10,
    padding: 4,
  },
  tab: {
    flex: 1,
    padding: 12,
    alignItems: 'center',
    borderRadius: 8,
  },
  activeTab: {
    backgroundColor: '#007AFF',
  },
  tabText: {
    color: '#aaa',
    fontSize: 16,
  },
  activeText: {
    color: 'white',
    fontWeight: 'bold',
  },
  
  content: {
    flex: 1,
    margin: 20,
    marginTop: 10,
  },
  
  cameraContainer: {
    flex: 1,
    borderRadius: 10,
    overflow: 'hidden',
  },
  camera: {
    flex: 1,
  },
  scanFrame: {
    position: 'absolute',
    top: '25%',
    left: '15%',
    right: '15%',
    bottom: '25%',
    borderWidth: 2,
    borderColor: '#007AFF',
    borderRadius: 10,
  },
  
  manualContainer: {
    flex: 1,
    backgroundColor: 'white',
    borderRadius: 10,
    padding: 20,
    justifyContent: 'center',
  },
  inputBox: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    paddingHorizontal: 12,
    marginBottom: 20,
  },
  input: {
    flex: 1,
    padding: 12,
    fontSize: 16,
    color: '#000',
  },
  submit: {
    backgroundColor: '#007AFF',
    padding: 14,
    borderRadius: 8,
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'center',
  },
  submitText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
    marginLeft: 5,
  },
  
  close: {
    position: 'absolute',
    top: 5,
    right: 20,
    padding: 5,
  },

  // Transfer Modal Styles
  transferModal: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.7)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  transferCard: {
    backgroundColor: 'white',
    borderRadius: 20,
    padding: 20,
    width: '90%',
    maxWidth: 400,
    elevation: 5,
  },
  transferHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  transferTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#333',
  },
  receiverInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F8F9FA',
    padding: 15,
    borderRadius: 12,
    marginBottom: 20,
  },
  receiverAvatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: '#E3F2FD',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 15,
  },
  receiverDetails: {
    flex: 1,
  },
  receiverName: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    marginBottom: 2,
  },
  receiverMobile: {
    fontSize: 14,
    color: '#666',
    marginBottom: 2,
  },
  receiverRole: {
    fontSize: 12,
    color: '#FF4757',
    fontWeight: '600',
    marginBottom: 2,
  },
  receiverBusiness: {
    fontSize: 12,
    color: '#007AFF',
    fontStyle: 'italic',
  },
  amountContainer: {
    marginBottom: 20,
  },
  amountLabel: {
    fontSize: 16,
    color: '#666',
    marginBottom: 10,
  },
  amountInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#007AFF',
    borderRadius: 12,
    paddingHorizontal: 15,
    marginBottom: 15,
  },
  currencySymbol: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#007AFF',
    marginRight: 10,
  },
  amountInput: {
    flex: 1,
    fontSize: 28,
    fontWeight: 'bold',
    color: '#333',
    paddingVertical: 15,
  },
  walletBalance: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#F0F8FF',
    padding: 12,
    borderRadius: 8,
  },
  balanceLabel: {
    fontSize: 14,
    color: '#666',
  },
  balanceAmount: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#007AFF',
  },
  quickAmounts: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  quickButton: {
    flex: 1,
    backgroundColor: '#F0F0F0',
    padding: 12,
    borderRadius: 8,
    marginHorizontal: 5,
    alignItems: 'center',
  },
  quickButtonText: {
    fontSize: 14,
    color: '#333',
    fontWeight: '500',
  },
  transferButton: {
    backgroundColor: '#007AFF',
    padding: 16,
    borderRadius: 12,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  transferButtonText: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
    marginLeft: 8,
  },
});

export default QRScannerButton;

