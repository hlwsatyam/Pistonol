// import React, { useState, useEffect } from 'react';
// import {
//   View,
//   Text,
//   TouchableOpacity,
//   Modal,
//   StyleSheet,
//   ActivityIndicator,
//   Alert,
//   Dimensions,
//   Share,
//   Image
// } from 'react-native';
// import AsyncStorage from '@react-native-async-storage/async-storage';
// import axios from 'axios';
// import Icon from 'react-native-vector-icons/MaterialIcons';

// const { width } = Dimensions.get('window');

// const QRCodeScannerButton = () => {
//   const [modalVisible, setModalVisible] = useState(false);
//   const [user, setUser] = useState(null);
//   const [qrCodeImage, setQrCodeImage] = useState('');
//   const [loading, setLoading] = useState(false);
//   const [qrLoading, setQrLoading] = useState(false);

//   useEffect(() => {
//     loadUserData();
//   }, []);

//   const loadUserData = async () => {
//     try {
//       const userData = await AsyncStorage.getItem('user');
//       if (userData) {
//         const parsedUser = JSON.parse(userData);
//         setUser(parsedUser);
//       }
//     } catch (error) {
//       console.error('Error loading user data:', error);
//       Alert.alert('Error', 'Failed to load user data');
//     }
//   };

//   const generateQRCodeFromBackend = async () => {
//     if (!user) return null;
    
//     setQrLoading(true);
//     try {
//       const response = await axios.post('/qrcodes/generate-user-qr', {
//         userId: user._id
//       });

//       if (response.data.success) {
//         return response.data.qrCode; // Base64 image string
//       } else {
//         throw new Error(response.data.message);
//       }
//     } catch (error) {
//       console.error('Backend QR Generation Error:', error);
//       Alert.alert('Error', 'Failed to generate QR code from server');
//       return null;
//     } finally {
//       setQrLoading(false);
//     }
//   };

//   const handleShowQR = async () => {
//     if (!user) {
//       Alert.alert('Error', 'User data not loaded');
//       return;
//     }

//     setLoading(true);
//     try {
//       const qrCodeBase64 = await generateQRCodeFromBackend();
//       if (qrCodeBase64) {
//         setQrCodeImage(qrCodeBase64);
//         setModalVisible(true);
//       }
//     } catch (error) {
//       console.error('Error showing QR:', error);
//     } finally {
//       setLoading(false);
//     }
//   };

//   const handleShare = async () => {
//     try {
//       await Share.share({
//         message: `My QR Code - ${user?.name}\nUser ID: ${user?._id}\nUsername: ${user?.username}`,
//         title: 'Share QR Code'
//       });
//     } catch (error) {
//       console.error('Error sharing:', error);
//     }
//   };

//   const handleRefreshQR = async () => {
//     const qrCodeBase64 = await generateQRCodeFromBackend();
//     if (qrCodeBase64) {
//       setQrCodeImage(qrCodeBase64);
//     }
//   };

//   const handleClose = () => {
//     setModalVisible(false);
//   };

//   return (
//     <View style={styles.container}>
//       {/* QR Code Button */}
//       <TouchableOpacity
//         style={styles.qrButton}
//         onPress={handleShowQR}
//         disabled={loading}
//       >
//         {loading ? (
//           <ActivityIndicator size="small" color="#FFFFFF" />
//         ) : (
//           <>
//             <Icon name="qr-code-2" size={24} color="#FFFFFF" />
//             <Text style={styles.qrButtonText}>Show QR Code</Text>
//           </>
//         )}
//       </TouchableOpacity>

//       {/* QR Code Modal */}
//       <Modal
//         animationType="slide"
//         transparent={true}
//         visible={modalVisible}
//         onRequestClose={handleClose}
//       >
//         <View style={styles.modalContainer}>
//           <View style={styles.modalContent}>
//             {/* Header */}
//             <View style={styles.modalHeader}>
//               <Text style={styles.modalTitle}>My QR Code</Text>
//               <TouchableOpacity onPress={handleClose} style={styles.closeButton}>
//                 <Icon name="close" size={24} color="#6B7280" />
//               </TouchableOpacity>
//             </View>

//             {/* User Info */}
//             <View style={styles.userInfo}>
//               <View style={styles.avatar}>
//                 <Text style={styles.avatarText}>
//                   {user?.name?.charAt(0)?.toUpperCase() || 'U'}
//                 </Text>
//               </View>
//               <View style={styles.userDetails}>
//                 <Text style={styles.userName}>{user?.name || 'User'}</Text>
//                 <Text style={styles.userUsername}>@{user?.username}</Text>
//                 <Text style={styles.userRole}>{user?.role?.toUpperCase()}</Text>
//               </View>
//             </View>

//             {/* QR Code Container */}
//             <View style={styles.qrContainer}>
//               {qrLoading ? (
//                 <View style={styles.qrLoading}>
//                   <ActivityIndicator size="large" color="#3B82F6" />
//                   <Text style={styles.loadingText}>Generating QR Code...</Text>
//                 </View>
//               ) : qrCodeImage ? (
//                 <>
//                   <View style={styles.qrCodeWrapper}>
//                     <Image 
//                       source={{ uri: qrCodeImage }}
//                       style={styles.qrCodeImage}
//                       resizeMode="contain"
//                     />
//                   </View>
//                   <Text style={styles.qrHint}>
//                     Scan this QR code to verify identity
//                   </Text>
//                 </>
//               ) : (
//                 <View style={styles.qrError}>
//                   <Icon name="error-outline" size={40} color="#EF4444" />
//                   <Text style={styles.errorText}>Failed to load QR code</Text>
//                 </View>
//               )}
//             </View>

//             {/* User ID Display */}
//             <View style={styles.userIdContainer}>
//               <Text style={styles.userIdLabel}>User ID:</Text>
//               <Text style={styles.userIdValue} numberOfLines={1} ellipsizeMode="middle">
//                 {user?._id || 'N/A'}
//               </Text>
//             </View>

//             {/* Action Buttons */}
//             <View style={styles.actionButtons}>
//               <TouchableOpacity 
//                 style={styles.secondaryButton}
//                 onPress={handleShare}
//               >
//                 <Icon name="share" size={20} color="#3B82F6" />
//                 <Text style={styles.secondaryButtonText}>Share</Text>
//               </TouchableOpacity>
              
//               <TouchableOpacity 
//                 style={styles.primaryButton}
//                 onPress={handleRefreshQR}
//                 disabled={qrLoading}
//               >
//                 <Icon name="refresh" size={20} color="#FFFFFF" />
//                 <Text style={styles.primaryButtonText}>
//                   {qrLoading ? 'Refreshing...' : 'Refresh'}
//                 </Text>
//               </TouchableOpacity>
//             </View>

//             {/* Footer Note */}
//             <Text style={styles.footerNote}>
//               This QR code contains your unique identification information
//             </Text>
//           </View>
//         </View>
//       </Modal>
//     </View>
//   );
// };

// const styles = StyleSheet.create({
//   container: {
//     marginVertical: 10,
//   },
//   qrButton: {
//     flexDirection: 'row',
//     alignItems: 'center',
//     justifyContent: 'center',
//     backgroundColor: '#3B82F6',
//     paddingHorizontal: 20,
//     paddingVertical: 12,
//     borderRadius: 12,
//     shadowColor: '#3B82F6',
//     shadowOffset: {
//       width: 0,
//       height: 4,
//     },
//     shadowOpacity: 0.3,
//     shadowRadius: 8,
//     elevation: 6,
//   },
//   qrButtonText: {
//     color: '#FFFFFF',
//     fontSize: 16,
//     fontWeight: '600',
//     marginLeft: 8,
//   },
//   modalContainer: {
//     flex: 1,
//     justifyContent: 'center',
//     alignItems: 'center',
//     backgroundColor: 'rgba(0, 0, 0, 0.5)',
//     padding: 20,
//   },
//   modalContent: {
//     backgroundColor: '#FFFFFF',
//     borderRadius: 20,
//     padding: 24,
//     width: '90%',
//     maxWidth: 400,
//     shadowColor: '#000',
//     shadowOffset: {
//       width: 0,
//       height: 4,
//     },
//     shadowOpacity: 0.3,
//     shadowRadius: 8,
//     elevation: 8,
//   },
//   modalHeader: {
//     flexDirection: 'row',
//     justifyContent: 'space-between',
//     alignItems: 'center',
//     marginBottom: 20,
//   },
//   modalTitle: {
//     fontSize: 20,
//     fontWeight: 'bold',
//     color: '#1F2937',
//   },
//   closeButton: {
//     padding: 4,
//   },
//   userInfo: {
//     flexDirection: 'row',
//     alignItems: 'center',
//     marginBottom: 24,
//     paddingBottom: 16,
//     borderBottomWidth: 1,
//     borderBottomColor: '#F3F4F6',
//   },
//   avatar: {
//     width: 50,
//     height: 50,
//     borderRadius: 25,
//     backgroundColor: '#3B82F6',
//     justifyContent: 'center',
//     alignItems: 'center',
//     marginRight: 12,
//   },
//   avatarText: {
//     color: '#FFFFFF',
//     fontSize: 18,
//     fontWeight: 'bold',
//   },
//   userDetails: {
//     flex: 1,
//   },
//   userName: {
//     fontSize: 18,
//     fontWeight: 'bold',
//     color: '#1F2937',
//     marginBottom: 2,
//   },
//   userUsername: {
//     fontSize: 14,
//     color: '#6B7280',
//     marginBottom: 2,
//   },
//   userRole: {
//     fontSize: 12,
//     color: '#3B82F6',
//     fontWeight: '600',
//   },
//   qrContainer: {
//     alignItems: 'center',
//     marginBottom: 20,
//   },
//   qrLoading: {
//     height: width * 0.6,
//     justifyContent: 'center',
//     alignItems: 'center',
//   },
//   loadingText: {
//     marginTop: 12,
//     color: '#6B7280',
//     fontSize: 14,
//   },
//   qrCodeWrapper: {
//     backgroundColor: '#FFFFFF',
//     padding: 16,
//     borderRadius: 12,
//     borderWidth: 1,
//     borderColor: '#E5E7EB',
//     marginBottom: 12,
//   },
//   qrCodeImage: {
//     width: width * 0.6,
//     height: width * 0.6,
//   },
//   qrError: {
//     height: width * 0.6,
//     justifyContent: 'center',
//     alignItems: 'center',
//   },
//   errorText: {
//     marginTop: 12,
//     color: '#EF4444',
//     fontSize: 14,
//   },
//   qrHint: {
//     fontSize: 12,
//     color: '#6B7280',
//     textAlign: 'center',
//   },
//   userIdContainer: {
//     backgroundColor: '#F8FAFC',
//     borderRadius: 8,
//     padding: 12,
//     marginBottom: 20,
//   },
//   userIdLabel: {
//     fontSize: 12,
//     color: '#6B7280',
//     marginBottom: 4,
//   },
//   userIdValue: {
//     fontSize: 12,
//     color: '#374151',
//     fontFamily: 'monospace',
//   },
//   actionButtons: {
//     flexDirection: 'row',
//     justifyContent: 'space-between',
//     marginBottom: 16,
//   },
//   primaryButton: {
//     flexDirection: 'row',
//     alignItems: 'center',
//     backgroundColor: '#3B82F6',
//     paddingHorizontal: 16,
//     paddingVertical: 10,
//     borderRadius: 8,
//     flex: 1,
//     marginLeft: 8,
//     justifyContent: 'center',
//   },
//   primaryButtonText: {
//     color: '#FFFFFF',
//     fontSize: 14,
//     fontWeight: '600',
//     marginLeft: 6,
//   },
//   secondaryButton: {
//     flexDirection: 'row',
//     alignItems: 'center',
//     backgroundColor: '#F3F4F6',
//     paddingHorizontal: 16,
//     paddingVertical: 10,
//     borderRadius: 8,
//     flex: 1,
//     marginRight: 8,
//     justifyContent: 'center',
//   },
//   secondaryButtonText: {
//     color: '#3B82F6',
//     fontSize: 14,
//     fontWeight: '600',
//     marginLeft: 6,
//   },
//   footerNote: {
//     fontSize: 11,
//     color: '#9CA3AF',
//     textAlign: 'center',
//     fontStyle: 'italic',
//   },
// });

// export default QRCodeScannerButton;





import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  Modal,
  StyleSheet,
  ActivityIndicator,
  Alert,
  Dimensions,
  Share,
  Image,
  ScrollView
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { useNavigation } from '@react-navigation/native';
import QRScannerButton from '../ScannerButtonComponent';

const { width } = Dimensions.get('window');

const QRCodeScannerButton = () => {
  const [modalVisible, setModalVisible] = useState(false);
  const [userDetailsVisible, setUserDetailsVisible] = useState(false);
  const [logoutVisible, setLogoutVisible] = useState(false);
  const [user, setUser] = useState(null);
  const [qrCodeImage, setQrCodeImage] = useState('');
  const [loading, setLoading] = useState(false);
  const [qrLoading, setQrLoading] = useState(false);

  useEffect(() => {
    loadUserData();
  }, []);

  const loadUserData = async () => {
    try {
      const userData = await AsyncStorage.getItem('user');
      if (userData) {
        const parsedUser = JSON.parse(userData);
        setUser(parsedUser);
      }
    } catch (error) {
      console.error('Error loading user data:', error);
      Alert.alert('Error', 'Failed to load user data');
    }
  };

  const generateQRCodeFromBackend = async () => {
    if (!user) return null;
    
    setQrLoading(true);
    try {
      const response = await axios.post('/qrcodes/generate-user-qr', {
        userId: user._id
      });

      if (response.data.success) {
        return response.data.qrCode; // Base64 image string
      } else {
        throw new Error(response.data.message);
      }
    } catch (error) {
      console.error('Backend QR Generation Error:', error);
      Alert.alert('Error', 'Failed to generate QR code from server');
      return null;
    } finally {
      setQrLoading(false);
    }
  };

  const handleShowQR = async () => {
    if (!user) {
      Alert.alert('Error', 'User data not loaded');
      return;
    }

    setLoading(true);
    try {
      const qrCodeBase64 = await generateQRCodeFromBackend();
      if (qrCodeBase64) {
        setQrCodeImage(qrCodeBase64);
        setModalVisible(true);
      }
    } catch (error) {
      console.error('Error showing QR:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleShare = async () => {
    try {
      await Share.share({
        message: `My QR Code - ${user?.name}\nUser ID: ${user?._id}\nUsername: ${user?.username}`,
        title: 'Share QR Code'
      });
    } catch (error) {
      console.error('Error sharing:', error);
    }
  };

  const handleRefreshQR = async () => {
    const qrCodeBase64 = await generateQRCodeFromBackend();
    if (qrCodeBase64) {
      setQrCodeImage(qrCodeBase64);
    }
  };

  const handleClose = () => {
    setModalVisible(false);
  };

  const handleUserDetailsClose = () => {
    setUserDetailsVisible(false);
  };

  const handleLogoutClose = () => {
    setLogoutVisible(false);
  };
const navigation=useNavigation()
  const handleLogoutConfirm = async () => {
    try {
      await AsyncStorage.clear();
      // You might want to add navigation logic here
     navigation.navigate('Login');
      BackHandler.exitApp()
      setLogoutVisible(false);
      setUserDetailsVisible(false);
      Alert.alert('Success', 'Logged out successfully');
    } catch (error) {
      console.error('Logout error:', error);
      Alert.alert('Error', 'Failed to logout');
    }
  };

  const handleUserSectionPress = () => {
    setUserDetailsVisible(true);
  };

  const handleLogoutPress = () => {
    setUserDetailsVisible(false);
    setLogoutVisible(true);
  };

  return (
    <View style={styles.headerContainer}>
      {/* Left Side - User Details (Clickable) */}
      <TouchableOpacity 
        style={styles.userSection} 
        onPress={handleUserSectionPress}
        activeOpacity={0.7}
      >
        <View style={styles.avatar}>
          <Text style={styles.avatarText}>
            {user?.name?.charAt(0)?.toUpperCase() || 'U'}
          </Text>
        </View>
        <View style={styles.userDetails}>
          <Text style={styles.userName} numberOfLines={1}>
            {user?.name || 'User'}
          </Text>
          <Text style={styles.userUsername} numberOfLines={1}>
            @{user?.username}
          </Text>
          <Text style={styles.userRole}>
            {user?.role?.toUpperCase()}
          </Text>
        </View>
      </TouchableOpacity>

      {/* Right Side - QR Code Button Only */}
      <View style={styles.actionsSection}>
     
     
<QRScannerButton/>






        <TouchableOpacity
          style={styles.qrButton}
          onPress={handleShowQR}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator size="small" color="#FFFFFF" />
          ) : (
            <>
              <Icon name="qr-code-2" size={20} color="#FFFFFF" />
            </>
          )}
        </TouchableOpacity>
      </View>

      {/* QR Code Modal */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={modalVisible}
        onRequestClose={handleClose}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            {/* Header */}
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>My QR Code</Text>
              <TouchableOpacity onPress={handleClose} style={styles.closeButton}>
                <Icon name="close" size={24} color="#6B7280" />
              </TouchableOpacity>
            </View>

            {/* User Info */}
            <View style={styles.userInfo}>
              <View style={styles.avatar}>
                <Text style={styles.avatarText}>
                  {user?.name?.charAt(0)?.toUpperCase() || 'U'}
                </Text>
              </View>
              <View style={styles.userDetails}>
                <Text style={styles.userName}>{user?.name || 'User'}</Text>
                <Text style={styles.userUsername}>@{user?.username}</Text>
                <Text style={styles.userRole}>{user?.role?.toUpperCase()}</Text>
              </View>
            </View>

            {/* QR Code Container */}
            <View style={styles.qrContainer}>
              {qrLoading ? (
                <View style={styles.qrLoading}>
                  <ActivityIndicator size="large" color="#3B82F6" />
                  <Text style={styles.loadingText}>Generating QR Code...</Text>
                </View>
              ) : qrCodeImage ? (
                <>
                  <View style={styles.qrCodeWrapper}>
                    <Image 
                      source={{ uri: qrCodeImage }}
                      style={styles.qrCodeImage}
                      resizeMode="contain"
                    />
                  </View>
                  <Text style={styles.qrHint}>
                    Scan this QR code to verify identity
                  </Text>
                </>
              ) : (
                <View style={styles.qrError}>
                  <Icon name="error-outline" size={40} color="#EF4444" />
                  <Text style={styles.errorText}>Failed to load QR code</Text>
                </View>
              )}
            </View>

            {/* User ID Display */}
            <View style={styles.userIdContainer}>
              <Text style={styles.userIdLabel}>User ID:</Text>
              <Text style={styles.userIdValue} numberOfLines={1} ellipsizeMode="middle">
                {user?._id || 'N/A'}
              </Text>
            </View>

            {/* Action Buttons */}
            <View style={styles.actionButtons}>
              <TouchableOpacity 
                style={styles.secondaryButton}
                onPress={handleShare}
              >
                <Icon name="share" size={20} color="#3B82F6" />
                <Text style={styles.secondaryButtonText}>Share</Text>
              </TouchableOpacity>
              
              <TouchableOpacity 
                style={styles.primaryButton}
                onPress={handleRefreshQR}
                disabled={qrLoading}
              >
                <Icon name="refresh" size={20} color="#FFFFFF" />
                <Text style={styles.primaryButtonText}>
                  {qrLoading ? 'Refreshing...' : 'Refresh'}
                </Text>
              </TouchableOpacity>
            </View>

            {/* Footer Note */}
            <Text style={styles.footerNote}>
              This QR code contains your unique identification information
            </Text>
          </View>
        </View>
      </Modal>

      {/* User Details Modal */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={userDetailsVisible}
        onRequestClose={handleUserDetailsClose}
      >
        <View style={styles.modalContainer}>
          <View style={[styles.modalContent, styles.userDetailsModal]}>
            {/* Header with Back Button */}
            <View style={styles.modalHeader}>
              <TouchableOpacity 
                onPress={handleUserDetailsClose} 
                style={styles.backButton}
              >
                <Icon name="arrow-back" size={24} color="#3B82F6" />
                <Text style={styles.backButtonText}>Back</Text>
              </TouchableOpacity>
              <Text style={styles.modalTitle}>User Profile</Text>
              <View style={styles.placeholder} />
            </View>

            <ScrollView showsVerticalScrollIndicator={false}>
              {/* User Avatar and Basic Info */}
              <View style={styles.userProfileHeader}>
                <View style={[styles.avatar, styles.largeAvatar]}>
                  <Text style={styles.largeAvatarText}>
                    {user?.name?.charAt(0)?.toUpperCase() || 'U'}
                  </Text>
                </View>
                <Text style={styles.userProfileName}>{user?.name || 'User'}</Text>
                <Text style={styles.userProfileUsername}>@{user?.username}</Text>
                <Text style={styles.userProfileRole}>{user?.role?.toUpperCase()}</Text>
              </View>

              {/* User Details Section */}
              <View style={styles.detailsSection}>
                <Text style={styles.sectionTitle}>Personal Information</Text>
                
                <View style={styles.detailItem}>
                  <Text style={styles.detailLabel}>Full Name</Text>
                  <Text style={styles.detailValue}>{user?.name || 'N/A'}</Text>
                </View>

                <View style={styles.detailItem}>
                  <Text style={styles.detailLabel}>Username</Text>
                  <Text style={styles.detailValue}>@{user?.username || 'N/A'}</Text>
                </View>

                <View style={styles.detailItem}>
                  <Text style={styles.detailLabel}>Email</Text>
                  <Text style={styles.detailValue}>{user?.email || 'N/A'}</Text>
                </View>

                <View style={styles.detailItem}>
                  <Text style={styles.detailLabel}>Role</Text>
                  <Text style={styles.detailValue}>{user?.role || 'N/A'}</Text>
                </View>

                <View style={styles.detailItem}>
                  <Text style={styles.detailLabel}>User ID</Text>
                  <Text style={[styles.detailValue, styles.userIdText]} numberOfLines={1} ellipsizeMode="middle">
                    {user?._id || 'N/A'}
                  </Text>
                </View>

                {user?.department && (
                  <View style={styles.detailItem}>
                    <Text style={styles.detailLabel}>Department</Text>
                    <Text style={styles.detailValue}>{user.department}</Text>
                  </View>
                )}

                {user?.phone && (
                  <View style={styles.detailItem}>
                    <Text style={styles.detailLabel}>Phone</Text>
                    <Text style={styles.detailValue}>{user.phone}</Text>
                  </View>
                )}
              </View>

              {/* Logout Button */}
 <TouchableOpacity
  onPress={handleLogoutPress}
  style={{
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#F2E5FF",
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 20,
    alignSelf: "flex-start",
    gap: 4,
    elevation: 3,
    shadowColor: "#000",
    shadowOpacity: 0.2,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 2 },
  }}
>
  <Icon name="logout" size={18} color="purple" />
  <Text style={{ fontSize: 12, color: "purple", fontWeight: "600" }}>
    Logout
  </Text>
</TouchableOpacity>


            </ScrollView>
          </View>
        </View>
      </Modal>

      {/* Logout Confirmation Modal */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={logoutVisible}
        onRequestClose={handleLogoutClose}
      >
        <View style={styles.modalContainer}>
          <View style={[styles.modalContent, styles.logoutModal]}>
            {/* Header with Back Button */}
            <View style={styles.modalHeader}>
              <TouchableOpacity 
                onPress={handleLogoutClose} 
                style={styles.backButton}
              >
                <Icon name="arrow-back" size={24} color="#3B82F6" />
                <Text style={styles.backButtonText}>Back</Text>
              </TouchableOpacity>
              <Text style={styles.modalTitle}>Logout</Text>
              <View style={styles.placeholder} />
            </View>

            {/* Logout Content */}
            <View style={styles.logoutContent}>
              <View style={styles.logoutIconContainer}>
                <View style={styles.logoutIconCircle}>
                  <Icon name="logout" size={40} color="#EF4444" />
                </View>
              </View>

              <Text style={styles.logoutTitle}>Logout from Account?</Text>
              
              <Text style={styles.logoutMessage}>
                Are you sure you want to logout? You'll need to login again to access your account.
              </Text>

              <View style={styles.logoutUserInfo}>
                <View style={styles.logoutUserAvatar}>
                  <Text style={styles.logoutAvatarText}>
                    {user?.name?.charAt(0)?.toUpperCase() || 'U'}
                  </Text>
                </View>
                <View style={styles.logoutUserDetails}>
                  <Text style={styles.logoutUserName}>{user?.name || 'User'}</Text>
                  <Text style={styles.logoutUserEmail}>{user?.email || 'N/A'}</Text>
                </View>
              </View>

              {/* Logout Action Buttons */}
              <View style={styles.logoutActions}>
                <TouchableOpacity 
                  style={styles.cancelButton}
                  onPress={handleLogoutClose}
                >
                  <Text style={styles.cancelButtonText}>Cancel</Text>
                </TouchableOpacity>
                
                <TouchableOpacity 
                  style={styles.confirmLogoutButton}
                  onPress={handleLogoutConfirm}
                >
                  <Icon name="logout" size={20} color="#FFFFFF" />
                  <Text style={styles.confirmLogoutButtonText}>Yes, Logout</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  headerContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 4,
  },
  userSection: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  actionsSection: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#3B82F6',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  avatarText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
  userDetails: {
    flex: 1,
  },
  userName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#1F2937',
    marginBottom: 2,
  },
  userUsername: {
    fontSize: 12,
    color: '#6B7280',
    marginBottom: 2,
  },
  userRole: {
    fontSize: 10,
    color: '#3B82F6',
    fontWeight: '600',
  },
  qrButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#3B82F6',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#3B82F6',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 4,
  },
  // Modal styles
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    padding: 20,
  },
  modalContent: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 24,
    width: '90%',
    maxWidth: 400,
    maxHeight: '90%',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  userDetailsModal: {
    maxHeight: '80%',
  },
  logoutModal: {
    maxWidth: 380,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  backButton: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 4,
  },
  backButtonText: {
    color: '#3B82F6',
    fontSize: 16,
    marginLeft: 4,
    fontWeight: '600',
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1F2937',
  },
  placeholder: {
    width: 70,
  },
  closeButton: {
    padding: 4,
  },
  userInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 24,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  qrContainer: {
    alignItems: 'center',
    marginBottom: 20,
  },
  qrLoading: {
    height: width * 0.6,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 12,
    color: '#6B7280',
    fontSize: 14,
  },
  qrCodeWrapper: {
    backgroundColor: '#FFFFFF',
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    marginBottom: 12,
  },
  qrCodeImage: {
    width: width * 0.6,
    height: width * 0.6,
  },
  qrError: {
    height: width * 0.6,
    justifyContent: 'center',
    alignItems: 'center',
  },
  errorText: {
    marginTop: 12,
    color: '#EF4444',
    fontSize: 14,
  },
  qrHint: {
    fontSize: 12,
    color: '#6B7280',
    textAlign: 'center',
  },
  userIdContainer: {
    backgroundColor: '#F8FAFC',
    borderRadius: 8,
    padding: 12,
    marginBottom: 20,
  },
  userIdLabel: {
    fontSize: 12,
    color: '#6B7280',
    marginBottom: 4,
  },
  userIdValue: {
    fontSize: 12,
    color: '#374151',
    fontFamily: 'monospace',
  },
  actionButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  primaryButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#3B82F6',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 8,
    flex: 1,
    marginLeft: 8,
    justifyContent: 'center',
  },
  primaryButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
    marginLeft: 6,
  },
  secondaryButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F3F4F6',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 8,
    flex: 1,
    marginRight: 8,
    justifyContent: 'center',
  },
  secondaryButtonText: {
    color: '#3B82F6',
    fontSize: 14,
    fontWeight: '600',
    marginLeft: 6,
  },
  footerNote: {
    fontSize: 11,
    color: '#9CA3AF',
    textAlign: 'center',
    fontStyle: 'italic',
  },
  // User Details Modal Styles
  userProfileHeader: {
    alignItems: 'center',
    marginBottom: 30,
    paddingBottom: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  largeAvatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    marginBottom: 16,
  },
  largeAvatarText: {
    color: '#FFFFFF',
    fontSize: 32,
    fontWeight: 'bold',
  },
  userProfileName: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1F2937',
    marginBottom: 4,
  },
  userProfileUsername: {
    fontSize: 16,
    color: '#6B7280',
    marginBottom: 8,
  },
  userProfileRole: {
    fontSize: 14,
    color: '#3B82F6',
    fontWeight: '600',
    backgroundColor: '#EFF6FF',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
  },
  detailsSection: {
    marginBottom: 30,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1F2937',
    marginBottom: 16,
  },
  detailItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  detailLabel: {
    fontSize: 14,
    color: '#6B7280',
    fontWeight: '500',
  },
  detailValue: {
    fontSize: 14,
    color: '#1F2937',
    fontWeight: '600',
    flex: 1,
    textAlign: 'right',
    marginLeft: 10,
  },
  userIdText: {
    fontFamily: 'monospace',
    fontSize: 12,
  },
  logoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#EF4444',
    paddingHorizontal: 20,
    paddingVertical: 14,
    borderRadius: 12,
    marginTop: 10,
    marginBottom: 20,
  },
  logoutButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
  },
  // Logout Modal Styles
  logoutContent: {
    alignItems: 'center',
  },
  logoutIconContainer: {
    marginBottom: 20,
  },
  logoutIconCircle: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#FEF2F2',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#FECACA',
  },
  logoutTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1F2937',
    marginBottom: 12,
    textAlign: 'center',
  },
  logoutMessage: {
    fontSize: 16,
    color: '#6B7280',
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: 24,
  },
  logoutUserInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F8FAFC',
    padding: 16,
    borderRadius: 12,
    marginBottom: 30,
    width: '100%',
  },
  logoutUserAvatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: '#3B82F6',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  logoutAvatarText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: 'bold',
  },
  logoutUserDetails: {
    flex: 1,
  },
  logoutUserName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#1F2937',
    marginBottom: 4,
  },
  logoutUserEmail: {
    fontSize: 14,
    color: '#6B7280',
  },
  logoutActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
    gap: 12,
  },
  cancelButton: {
    flex: 1,
    backgroundColor: '#F3F4F6',
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  cancelButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#374151',
  },
  confirmLogoutButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#EF4444',
    paddingVertical: 14,
    borderRadius: 12,
  },
  confirmLogoutButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
    marginLeft: 8,
  },
});

export default QRCodeScannerButton;

