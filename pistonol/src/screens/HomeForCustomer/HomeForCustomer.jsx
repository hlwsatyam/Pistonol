import React, {useEffect, useState} from 'react';
import {
  Alert,
  Animated,
  StyleSheet,
  TouchableOpacity,
  View,
  TextInput,
  Text,
  Modal,
  Dimensions,
  KeyboardAvoidingView,
  Platform,
  ImageBackground,
} from 'react-native';
import {CurvedBottomBar} from 'react-native-curved-bottom-bar';
import Ionicons from 'react-native-vector-icons/Ionicons';
import {Camera, CameraType} from 'react-native-camera-kit';
import CustomerHome from './Home';
import LinearGradient from 'react-native-linear-gradient';
import { useSafeAreaInsets } from "react-native-safe-area-context";

import {
  BackgroundTheme,
  color,
  endDirectionTheme,
  startDirectionTheme,
  themeColor,
} from '../../locale/Locale';
import ProfileScreen from '../onboarding/Profile';
import {verifyCode} from '../../hooks/auth';
import {useFocusEffect} from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';

const {height, width} = Dimensions.get('window');















const ScanScreen = ({visible, scanTab = 'scan', onClose, onScan}) => {
  const [manualCode, setManualCode] = useState('');
  const [activeTab, setActiveTab] = useState(scanTab); // 'scan' or 'manual'

  useEffect(() => {
    setActiveTab(scanTab);
  }, scanTab);
  const handleSubmit = () => {
    if (manualCode.trim()) {
      onScan(manualCode);
      onClose();
    } else {
      Alert.alert('Error', 'Please enter a valid code');
    }
  };

  return (
    <Modal visible={visible} animationType="fade" transparent={true}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.modalOverlay}>
        <ImageBackground source={BackgroundTheme}>
          <View style={styles.modalContainer}>
            {/* Header */}
            <View style={styles.tabHeader}>
              <TouchableOpacity
                style={[
                  styles.tabButton,
                  activeTab === 'scan' && styles.activeTab,
                ]}
                onPress={() => setActiveTab('scan')}>
                <Text style={styles.tabText}>Scan</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[
                  styles.tabButton,
                  activeTab === 'manual' && styles.activeTab,
                ]}
                onPress={() => setActiveTab('manual')}>
                <Text style={styles.tabText}>Manual</Text>
              </TouchableOpacity>
            </View>

            {/* Content Area */}
            <View style={styles.contentContainer}>
              {activeTab === 'scan' ? (
                <View style={styles.cameraContainer}>
                  <Camera
                    style={styles.camera}
                    cameraType={CameraType.Back}
                    scanBarcode={true}
                    onReadCode={event => {
                      onScan(event.nativeEvent.codeStringValue);
                      onClose();
                    }}
                  />
                </View>
              ) : (
                <View style={styles.manualContainer}>
                  <View style={styles.ConTicket}>
                    <Ionicons name="ticket-sharp" size={30} color={color} />
                    <TextInput
                      cursorColor={color}
                      style={styles.input}
                      value={manualCode}
                      onChangeText={setManualCode}
                      placeholder="Enter code manually"
                      placeholderTextColor={color}
                    />
                  </View>

                  <LinearGradient
                    colors={themeColor}
                    start={startDirectionTheme}
                    end={endDirectionTheme}>
                    <TouchableOpacity
                      style={styles.submitButton}
                      onPress={handleSubmit}>
                      <Text style={styles.submitText}>Submit</Text>
                    </TouchableOpacity>
                  </LinearGradient>
                </View>
              )}
            </View>

            {/* Close Button */}
            <TouchableOpacity style={styles.closeButton} onPress={onClose}>
              <Ionicons name="close" size={24} color="white" />
            </TouchableOpacity>
          </View>
        </ImageBackground>
      </KeyboardAvoidingView>
    </Modal>
  );
};











































































































export default function App() {
  const [scanVisible, setScanVisible] = useState(false);
  const [scannedCode, setScannedCode] = useState('');
  const [scanTab, setScanTab] = useState('scan');
  const insets = useSafeAreaInsets();
  const _renderIcon = (routeName, selectedTab) => {
    let icon = '';
    switch (routeName) {
      case 'CustomerHome':
        icon = 'home-outline';
        break;
      case 'title2':
        icon = 'settings-outline';
        break;
    }
    return (
      <Ionicons
        name={icon}
        size={25}
        color={routeName === selectedTab ? '#2F80ED' : '#95A5A6'}
      />
    );
  };

  const renderTabBar = ({routeName, selectedTab, navigate}) => (
    <TouchableOpacity
      onPress={() => navigate(routeName)}
      style={styles.tabbarItem}>
      {_renderIcon(routeName, selectedTab)}
    </TouchableOpacity>
  );

  const [user, setUser] = useState(null);
  useFocusEffect(
    React.useCallback(() => {
      const fetchUser = async () => {
        try {
          const storedUser = await AsyncStorage.getItem('user');
          if (storedUser) {
            setUser(JSON.parse(storedUser));
          }
        } catch (error) {
          console.error('Error fetching user:', error);
        }
      };
      fetchUser();
    }, []),
  );

  const {mutate, isPending} = verifyCode();

  const handleScan = code => {
    setScannedCode(code);
console.log(code)
   mutate({ role: user.role, code, _id: user._id });
  };

  return (
    <>
      <CurvedBottomBar.Navigator
        screenOptions={{headerShown: false}}
        type="UP"
        // style={styles.bottomBar}

   style={[
        styles.bottomBar,
        { paddingBottom: insets.bottom  } // ⬅ Safe area + extra gap
      ]}

        shadowStyle={styles.shawdow}
        height={60}
        circleWidth={55}
        bgColor="white"
        initialRouteName="CustomerHome"
        borderTopLeftRight
        renderCircle={({selectedTab, navigate}) => (
          <Animated.View style={styles.btnCircleUp}>
            <TouchableOpacity
              style={styles.button}
              onPress={() => {
                setScanVisible(true);

                setScanTab('scan');
              }}>
              <Ionicons name={'scan'} color="white" size={30} />
            </TouchableOpacity>
          </Animated.View>
        )}
        tabBar={renderTabBar}>
        <CurvedBottomBar.Screen
          name="CustomerHome"
          position="LEFT"
          component={() => (
            <CustomerHome
              scanVisible={scanVisible}
              setScanVisible={setScanVisible}
              scanTab={scanTab}
              setScanTab={setScanTab}
              scannedCode={scannedCode}
            />
          )}
        />
        <CurvedBottomBar.Screen
          name="title2"
          component={() => <ProfileScreen />}
          position="RIGHT"
        />
      </CurvedBottomBar.Navigator>

      <ScanScreen
        visible={scanVisible}
        scanTab={scanTab}
        onClose={() => setScanVisible(false)}
        onScan={handleScan}
      />
    </>
  );
}

const styles = StyleSheet.create({
  // Screen styles
  screen1: {
    flex: 1,
    backgroundColor: '#F5F7FA',
    justifyContent: 'center',
    alignItems: 'center',
  },
  screen2: {
    flex: 1,
    backgroundColor: '#FFEBCD',
  },
  scanResult: {
    fontSize: 18,
    color: '#2C3E50',
    marginBottom: 20,
  },

  // Bottom bar styles
  bottomBar: {
    borderTopWidth: 0,
  },
  shawdow: {
    shadowColor: '#DDDDDD',
    shadowOffset: {width: 0, height: -1},
    shadowOpacity: 0.8,
    shadowRadius: 5,
    elevation: 5,
  },
  btnCircleUp: {
    width: 60,
    height: 60,
    borderRadius: 30,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#2F80ED',
    bottom: 25,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 4,
  },
  tabbarItem: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },

  // Modal styles
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.7)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContainer: {
    height: height * 0.7,
    width: width * 0.9,
    padding: 10,
    borderRadius: 55,
    overflow: 'hidden',
  },
  tabHeader: {
    flexDirection: 'row',
    height: 50,
    backgroundColor: 'transparent',
    borderBottomWidth: 1,
    borderBottomColor: '#ECF0F1',
  },
  tabButton: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F8F9FA',
  },
  activeTab: {
    backgroundColor: 'white',
    borderBottomWidth: 2,
    borderBottomColor: '#2F80ED',
  },
  tabText: {
    fontSize: 16,
    color: '#2C3E50',
    fontWeight: '500',
  },
  contentContainer: {
    flex: 1,
  },
  cameraContainer: {
    flex: 1,
    padding: 25,
    backgroundColor: 'black',
  },
  camera: {
    flex: 1,
  },
  manualContainer: {
    flex: 1,
    padding: 25,
    justifyContent: 'center',
  },
  input: {
    height: 50,
    color,

    fontSize: 18,
  },
  submitButton: {
    height: 50,
    borderRadius: 8,
    backgroundColor: 'transparent',
    justifyContent: 'center',
    alignItems: 'center',
  },
  submitText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  ConTicket: {
    borderWidth: 0,
    borderBottomWidth: 2,
    borderColor: color,
    marginBottom: 40,
    gap: 5,
    justifyContent: 'center',
    flexDirection: 'row',
    alignItems: 'center',
  },
  closeButton: {
    position: 'absolute',
    top: 10,
    right: 10,
    backgroundColor: 'rgba(0,0,0,0.5)',
    borderRadius: 15,
    padding: 5,
    zIndex: 1,
  },
});
