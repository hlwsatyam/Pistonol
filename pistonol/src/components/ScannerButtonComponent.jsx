import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  Modal,
  TextInput,
  StyleSheet,
  ToastAndroid,
  ActivityIndicator
} from 'react-native';
import { Camera, CameraType } from 'react-native-camera-kit';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Ionicons from 'react-native-vector-icons/Ionicons';
import axios from 'axios';

// API base URL
 

const QRScannerButton = ({ onSuccess }) => {
  const [showModal, setShowModal] = useState(false);
  const [user, setUser] = useState(null);
  const [tab, setTab] = useState('scan');
  const [code, setCode] = useState('');
  const [loading, setLoading] = useState(false);

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

  const verifyCode = async (scannedCode) => {
    if (!user) return;

    setLoading(true);
    
    try {
      // Code parse
      let finalCode = scannedCode;
      try {
        const parsed = JSON.parse(scannedCode);
        finalCode = parsed?.code || parsed?.uniqueCode || scannedCode;
      } catch (e) {
        finalCode = scannedCode;
      }

      // API call with axios
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
      // Axios error handling
      const errorMsg = error.response?.data?.message || error.message || 'Network error';
      ToastAndroid.show(errorMsg, ToastAndroid.SHORT);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = () => {
    if (code.trim()) {
      verifyCode(code);
    } else {
      ToastAndroid.show('Enter code', ToastAndroid.SHORT);
    }
  };

  return (
    <>
      {/* Button */}
      <TouchableOpacity style={styles.button} onPress={() => setShowModal(true)}>
        <Ionicons name="qr-code" size={22} color="white" />
        <Text style={styles.buttonText}>Scan QR</Text>
      </TouchableOpacity>

      {/* Modal */}
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
});

export default QRScannerButton;