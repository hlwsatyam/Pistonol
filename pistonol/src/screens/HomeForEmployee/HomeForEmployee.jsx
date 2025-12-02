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
  ScrollView,
  ActivityIndicator,
} from 'react-native';
import {CurvedBottomBar} from 'react-native-curved-bottom-bar';
import Ionicons from 'react-native-vector-icons/Ionicons';
import CustomerHome from './Home';
import LinearGradient from 'react-native-linear-gradient';
import {
  BackgroundTheme,
  color,
  endDirectionTheme,
  startDirectionTheme,
  themeColor,
} from '../../locale/Locale';
import ProfileScreen from '../onboarding/Profile';
import {useFocusEffect} from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {useMutation, useQuery, useQueryClient} from '@tanstack/react-query';
import axios from 'axios';
import ServicesInput from './ServicesInput';

const {height, width} = Dimensions.get('window');

const LeadForm = ({visible, onClose, onSubmit}) => {
  const [formData, setFormData] = useState({
    garageName: '',
    businessCardNumber: '',
    contactName: '',
    mobile: '',
    comment: '',
    address: '',
    state: '',
    city: '',
    pincode: '',
    servicesOffered: '',
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleChange = (field, value) => {
    setFormData(prev => ({...prev, [field]: value}));
  };

  const handleSubmit = async () => {
    try {
      setIsSubmitting(true);

 





      await onSubmit(formData);
      onClose();
    } catch (error) {
      Alert.alert('Error', 'Failed to submit lead');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Modal visible={visible} animationType="fade" transparent={true}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.modalOverlay}>
        <ImageBackground source={BackgroundTheme} style={styles.modalBg}>
          <View style={styles.leadModalContainer}>
            <ScrollView contentContainerStyle={styles.leadFormScroll}>
              <Text style={styles.leadFormTitle}>VISITOR LOG BOOK (VLB)</Text>
              
              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Garage/Dealer Name</Text>
                <TextInput
                  style={styles.leadInput}
                  value={formData.garageName}
                  onChangeText={text => handleChange('garageName', text)}
                  placeholder="Enter garage name"
                  placeholderTextColor="#888"
                />
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>ID/PAN Number</Text>
                <TextInput
                  style={styles.leadInput}
                  value={formData.businessCardNumber}
                  onChangeText={text => handleChange('businessCardNumber', text)}
                  placeholder="ID/PAN number"
                  placeholderTextColor="#888"
                  keyboardType="numeric"
                />
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Owners Name</Text>
                <TextInput
                  style={styles.leadInput}
                  value={formData.contactName}
                  onChangeText={text => handleChange('contactName', text)}
                  placeholder="Owners name"
                  placeholderTextColor="#888"
                />
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Mobile Number</Text>
                <TextInput
                  style={styles.leadInput}
                  value={formData.mobile}
                  onChangeText={text => handleChange('mobile', text)}
                  placeholder="Enter mobile number"
                  placeholderTextColor="#888"
                  keyboardType="phone-pad"
                />
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Address</Text>
                <TextInput
                  style={[styles.leadInput, {height: 80, textAlignVertical: 'top'}]}
                  value={formData.address}
                  onChangeText={text => handleChange('address', text)}
                  placeholder="Enter full address"
                  placeholderTextColor="#888"
                  multiline
                />
              </View>

              <View style={styles.rowInputGroup}>
                <View style={[styles.inputGroup, {flex: 1, marginRight: 10}]}>
                  <Text style={styles.inputLabel}>State</Text>
                  <TextInput
                    style={styles.leadInput}
                    value={formData.state}
                    onChangeText={text => handleChange('state', text)}
                    placeholder="State"
                    placeholderTextColor="#888"
                  />
                </View>
                <View style={[styles.inputGroup, {flex: 1}]}>
                  <Text style={styles.inputLabel}>City</Text>
                  <TextInput
                    style={styles.leadInput}
                    value={formData.city}
                    onChangeText={text => handleChange('city', text)}
                    placeholder="City"
                    placeholderTextColor="#888"
                  />
                </View>
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Pincode</Text>
                <TextInput
                  style={styles.leadInput}
                  value={formData.pincode}
                  onChangeText={text => handleChange('pincode', text)}
                  placeholder="Enter pincode"
                  placeholderTextColor="#888"
                  keyboardType="numeric"
                />
              </View>

              {/* <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Order Offered</Text>
                <TextInput
                  style={[styles.leadInput, {height: 80, textAlignVertical: 'top'}]}
                  value={formData.servicesOffered}
                  onChangeText={text => handleChange('servicesOffered', text)}
                  placeholder="List services offered"
                  placeholderTextColor="#888"
                  multiline
                />
              </View> */}

<ServicesInput  handleChange={handleChange}  formData={formData}   />




              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Customer Feedback</Text>
                <TextInput
                  style={[styles.leadInput, {height: 80, textAlignVertical: 'top'}]}
                  value={formData.comment}
                  onChangeText={text => handleChange('comment', text)}
                  placeholder="Feedback"
                  placeholderTextColor="#888"
                  multiline
                />
              </View>

              <LinearGradient
                colors={["blue" , "blue"  ]}
                start={startDirectionTheme}
                end={endDirectionTheme}
                style={styles.submitGradient}>
                <TouchableOpacity
                  style={styles.submitButton}
                  onPress={handleSubmit}
                  disabled={isSubmitting}>
                  {isSubmitting ? (
                    <ActivityIndicator color="white" />
                  ) : (
                    <Text style={styles.submitText}>Submit</Text>
                  )}
                </TouchableOpacity>
              </LinearGradient>
            </ScrollView>

            <TouchableOpacity style={styles.closeButton} onPress={onClose}>
              <Ionicons name="close" size={24} color="white" />
            </TouchableOpacity>
          </View>
        </ImageBackground>
      </KeyboardAvoidingView>
    </Modal>
  );
};





export default function App({navigation}) {
  const [leadModalVisible, setLeadModalVisible] = useState(false);
  const [user, setUser] = useState(null);
  const queryClient = useQueryClient();

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

  const createLeadMutation = useMutation({
    mutationFn: async leadData => {
      const response = await axios.post('/leads', {
        ...leadData,
        createdBy: user._id,
      });
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['leads', user._id]);
      Alert.alert('Success', 'Lead created successfully!');
    },
    onError: error => {
      Alert.alert('Error', error.response?.data?.message || 'Failed to create lead');
    },
  });


  const _renderIcon = (routeName, selectedTab) => {
    let icon = '';
    switch (routeName) {
      case 'CustomerHome':
        icon = 'home-outline';
        break;
      case 'title2':
        icon = 'person-outline';
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

  return (
    <>
      <CurvedBottomBar.Navigator
        screenOptions={{headerShown: false}}
        type="UP"
        style={styles.bottomBar}
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
              onPress={() => setLeadModalVisible(true)}>
              <Ionicons name={'add'} color="white" size={30} />
            </TouchableOpacity>
          </Animated.View>
        )}
        tabBar={renderTabBar}>
        <CurvedBottomBar.Screen
          name="CustomerHome"
          position="LEFT"
          component={() => (
            <CustomerHome
              // leads={leads}
              // isLoading={isLoading}
              user={user}
              navigation={navigation}
            />
          )}
        />
        <CurvedBottomBar.Screen
          name="title2"
          component={() => <ProfileScreen user={user} />}
          position="RIGHT"
        />
      </CurvedBottomBar.Navigator>

      <LeadForm
        visible={leadModalVisible}
        onClose={() => setLeadModalVisible(false)}
        onSubmit={createLeadMutation.mutateAsync}
      />
    </>
  );
}











const styles = StyleSheet.create({


















  modalBg: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    width: '100%',
  },
  leadModalContainer: {
    height: height * 0.85,
    width: width * 0.9,
    backgroundColor: 'white',
    borderRadius: 20,
    padding: 20,
    overflow: 'hidden',
  },
  leadFormScroll: {
    paddingBottom: 30,
  },
  leadFormTitle: {
    fontSize: 15,
    fontWeight: 'bold',
    color: 'red',
    marginBottom: 20,
    textAlign: 'center',
  },
  inputGroup: {
    marginBottom: 15,
  },
  rowInputGroup: {
    flexDirection: 'row',
    marginBottom: 15,
  },
  inputLabel: {
    fontSize: 14,
    color: '#555',
    marginBottom: 5,
    fontWeight: '500',
  },
  leadInput: {
    backgroundColor: '#f5f5f5',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    color: '#333',
    borderWidth: 1,
    borderColor: '#ddd',
  },
  submitGradient: {
    borderRadius: 8,
    marginTop: 20,
  },
  submitButton: {
    paddingVertical: 15,
    alignItems: 'center',
  },
  submitText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },














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


 