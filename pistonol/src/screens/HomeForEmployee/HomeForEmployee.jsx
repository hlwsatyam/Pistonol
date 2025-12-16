import React, {useEffect, useRef, useState} from 'react';
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
  ImageBackground, Image,
  ScrollView,
  ActivityIndicator,
  PermissionsAndroid,
} from 'react-native';
import {CurvedBottomBar} from 'react-native-curved-bottom-bar';
import Ionicons from 'react-native-vector-icons/Ionicons';
import CustomerHome from './Home';
import { Camera, CameraType } from 'react-native-camera-kit';
import LinearGradient from 'react-native-linear-gradient';
import {
  BackgroundTheme,
  color,
  endDirectionTheme,
  startDirectionTheme,
  ThemeBackground,
  themeColor,
} from '../../locale/Locale';
import ProfileScreen from '../onboarding/Profile';
import {useFocusEffect} from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {useMutation,   useQueryClient} from '@tanstack/react-query';
import axios from 'axios';
import ServicesInput from './ServicesInput';
import Geolocation from "@react-native-community/geolocation";
const {height, width} = Dimensions.get('window');
import {   PERMISSIONS, request, RESULTS } from 'react-native-permissions';



const DLeadForm = ({visible, onClose, onSubmit}) => {
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
const [openCamera, setOpenCamera] = useState(false);
 const [isLoading, setIsLoading] = useState(false);
  const [hasPermission, setHasPermission] = useState(null);
  const [currentLocation, setCurrentLocation] = useState(null);
  const [capturedImage, setCapturedImage] = useState(null);
  const [locationError, setLocationError] = useState(null);
  const [cameraReady, setCameraReady] = useState(false);
  const cameraRef = useRef(null);
  useEffect(() => {
    requestPermissions();
  }, []);
  const handleRetakePhoto = () => {
    setCapturedImage(null);
  };
  const requestPermissions = async () => {
    try {
      setIsLoading(true);
      
      // Camera permissions
      let cameraGranted = false;
      if (Platform.OS === 'ios') {
        const cameraStatus = await request(PERMISSIONS.IOS.CAMERA);
        cameraGranted = cameraStatus === RESULTS.GRANTED;
      } else {
        cameraGranted = await PermissionsAndroid.request(
          PermissionsAndroid.PERMISSIONS.CAMERA,
          {
            title: "Camera Permission",
            message: "This app needs access to your camera",
            buttonNeutral: "Ask Me Later",
            buttonNegative: "Cancel",
            buttonPositive: "OK"
          }
        ) === PermissionsAndroid.RESULTS.GRANTED;
      }

      // Location permissions
      let locationGranted = false;
      if (Platform.OS === 'ios') {
        const locationStatus = await request(PERMISSIONS.IOS.LOCATION_WHEN_IN_USE);
        locationGranted = locationStatus === RESULTS.GRANTED;
      } else {
        locationGranted = await PermissionsAndroid.request(
          PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
          {
            title: "Location Permission",
            message: "This app needs access to your location",
            buttonNeutral: "Ask Me Later",
            buttonNegative: "Cancel",
            buttonPositive: "OK"
          }
        ) === PermissionsAndroid.RESULTS.GRANTED;
      }

      setHasPermission(cameraGranted && locationGranted);

      if (locationGranted) {
        getLocation();
      } else {
        setLocationError("Location permission denied");
        setIsLoading(false);
      }
    } catch (error) {
      console.error("Error requesting permissions:", error);
      setHasPermission(false);
      setIsLoading(false);
    }
  };
const handleCameraReady = () => {
  setCameraReady(true);
};
  const getLocation = () => {
    setIsLoading(true);
    setLocationError(null);
    
    Geolocation.getCurrentPosition(
      (position) => {
        setCurrentLocation(position.coords);
        setIsLoading(false);
      },
      (error) => {
        const errorMessage = `Unable to get your location: ${error.message}`;
        Alert.alert("Location Error", errorMessage);
        setLocationError(errorMessage);
        console.error(error);
        setIsLoading(false);
      },
      { 
        enableHighAccuracy: true, 
        timeout: 20000, 
        maximumAge: 10000 
      }
    );
  };

  const takePicture = async () => {
  if (!cameraRef.current  ) {
    Alert.alert("Error", "Camera is not ready yet");
    return null;
  }
  
  try {
    // react-native-camera-kit के method से capture करें
    const image = await cameraRef.current.capture();
    
    // Image object structure check करें
    const imageUri = image.uri || image.path || image;
    
    await uploadImageTODB(imageUri);
    setCapturedImage(imageUri);
    return image;
  } catch (error) {
    console.log("Camera capture error:", error );
    Alert.alert("Error", error);
    return null;
  }
};
const [imgURLForDB, setIMGURLFORDB]=useState(null)



  const uploadImageTODB = async (imageUri) => {
    try {
      const formData = new FormData();

      formData.append("image", {
        uri: imageUri, // local file path
        type: "image/jpeg",
        name: "photo.jpg",
      });

      const response = await axios.post(
        "/upload-image",
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        }
      );
setIMGURLFORDB(response.data.imageUrl)
      console.log("Upload success:", response.data);
      Alert.alert("Success", "Image uploaded successfully!");
    } catch (error) {
      console.error("Upload failed:", error);
      Alert.alert("Error", error);
    }
  };




  const handleChange = (field, value) => {
    setFormData(prev => ({...prev, [field]: value}));
  };

  const handleSubmit = async () => {
    try {
      setIsSubmitting(true);

 
    if ( !hasPermission  ) {
      Alert.alert(
        "Incomplete location",
        "Please ensure your location is enable and permitted  ."
      );
      return;
    }
    if ( !currentLocation  ) {
      Alert.alert(
        "Incomplete Information",
        "Please ensure your location is available    ."
      );
      return;
    }





      await onSubmit({...formData   , currentLocation 


,
   proofImageUrl: imgURLForDB,
 


         });
      onClose();
    } catch (error) {
     
      Alert.alert('Error', error?.response?.data?.message || 'Failed to submit lead');
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









 


            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Garage Image</Text>
              
              {!capturedImage ? (
                <View style={styles.cameraPreviewContainer}>
                  <Camera
                    ref={cameraRef}
                    cameraType={CameraType.Back}
                    flashMode="auto"
                   
                       
                    onCameraReady={handleCameraReady}
                    scanBarcode={false}
                  />

                  <TouchableOpacity
                    style={styles.captureButtonInline}
                    onPress={takePicture}
                   
                  >
                    <View style={styles.captureCircle}>
                      <Ionicons name="camera" size={24} color="white" />
                    </View>
                    <Text style={styles.captureButtonText}>Tap to Capture</Text>
                  </TouchableOpacity>







 













                </View>
              ) : (
                <View style={styles.imagePreviewContainer}>
                  <Image
                    source={{ uri: capturedImage }}
                    style={styles.imagePreview}
                    resizeMode="cover"
                  />
                  <View style={styles.imageButtonsContainer}>
                    <TouchableOpacity
                      style={[styles.imageButton, styles.retakeButton]}
                      onPress={handleRetakePhoto}
                    >
                      <Text style={styles.retakeButtonText}>Retake</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                      style={[styles.imageButton, styles.uploadButton]}
                      onPress={async () =>await uploadImageTODB(capturedImage)}
                      disabled={isLoading}
                    >
                      {isLoading ? (
                        <ActivityIndicator color="white" />
                      ) : (
                        <Text style={styles.uploadButtonText}>
                          {imgURLForDB ? 'Uploaded ✓' : 'Upload'}
                        </Text>
                      )}
                    </TouchableOpacity>
                  </View>
                </View>
              )}
              
              {imgURLForDB && (
                <Text style={styles.uploadSuccessText}>
                  ✓ Image uploaded successfully
                </Text>
              )}
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






 

const LeadForm = ({ visible, onClose, onSubmit }) => {
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
  const [cameraModalVisible, setCameraModalVisible] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [hasPermission, setHasPermission] = useState(null);
  const [currentLocation, setCurrentLocation] = useState(null);
  const [capturedImage, setCapturedImage] = useState(null);
  const [locationError, setLocationError] = useState(null);
  const [cameraReady, setCameraReady] = useState(false);
  const [imgURLForDB, setIMGURLFORDB] = useState(null);
  
  const cameraRef = useRef(null);
  
  useEffect(() => {
    requestPermissions();
  }, []);
  
  const requestPermissions = async () => {
    try {
      setIsLoading(true);
      
      // Camera permissions
      let cameraGranted = false;
      if (Platform.OS === 'ios') {
        const cameraStatus = await request(PERMISSIONS.IOS.CAMERA);
        cameraGranted = cameraStatus === RESULTS.GRANTED;
      } else {
        cameraGranted = await PermissionsAndroid.request(
          PermissionsAndroid.PERMISSIONS.CAMERA,
          {
            title: "Camera Permission",
            message: "This app needs access to your camera",
            buttonNeutral: "Ask Me Later",
            buttonNegative: "Cancel",
            buttonPositive: "OK"
          }
        ) === PermissionsAndroid.RESULTS.GRANTED;
      }

      // Location permissions
      let locationGranted = false;
      if (Platform.OS === 'ios') {
        const locationStatus = await request(PERMISSIONS.IOS.LOCATION_WHEN_IN_USE);
        locationGranted = locationStatus === RESULTS.GRANTED;
      } else {
        locationGranted = await PermissionsAndroid.request(
          PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
          {
            title: "Location Permission",
            message: "This app needs access to your location",
            buttonNeutral: "Ask Me Later",
            buttonNegative: "Cancel",
            buttonPositive: "OK"
          }
        ) === PermissionsAndroid.RESULTS.GRANTED;
      }

      setHasPermission(cameraGranted && locationGranted);

      if (locationGranted) {
        getLocation();
      } else {
        setLocationError("Location permission denied");
        setIsLoading(false);
      }
    } catch (error) {
      console.error("Error requesting permissions:", error);
      setHasPermission(false);
      setIsLoading(false);
    }
  };
  
  const handleCameraReady = () => {
    setCameraReady(true);
  };
  
  const getLocation = () => {
    setIsLoading(true);
    setLocationError(null);
    
    Geolocation.getCurrentPosition(
      (position) => {
        setCurrentLocation(position.coords);
        setIsLoading(false);
      },
      (error) => {
        const errorMessage = `Unable to get your location: ${error.message}`;
        Alert.alert("Location Error", errorMessage);
        setLocationError(errorMessage);
        console.error(error);
        setIsLoading(false);
      },
      { 
        enableHighAccuracy: true, 
        timeout: 20000, 
        maximumAge: 10000 
      }
    );
  };

  const takePicture = async () => {
    if (!cameraRef.current) {
      Alert.alert("Error", "Camera is not ready yet");
      return null;
    }
    
    try {
      const image = await cameraRef.current.capture();
      const imageUri = image.uri || image.path || image;
      
      setCapturedImage(imageUri);
      setCameraModalVisible(false);
      return image;
    } catch (error) {
      console.log("Camera capture error:", error);
      Alert.alert("Error", error.message || "Failed to capture image");
      return null;
    }
  };

  const uploadImageTODB = async (imageUri) => {
    console.log(imageUri)
    try {
      setIsLoading(true);
      const formData = new FormData();

      formData.append("image", {
        uri: imageUri,
        type: "image/jpeg",
        name: "photo.jpg",
      });

      const response = await axios.post(
        "/upload-image",
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        }
      );
      console.log(response.data)
      setIMGURLFORDB(response.data.imageUrl);
      console.log("Upload success:", response.data);
      Alert.alert("Success", "Image uploaded successfully!");
      setIsLoading(false);
    } catch (error) {
      console.error("Upload failed:", error);
      Alert.alert("Errors", error.message || "Failed to upload image");
      setIsLoading(false);
    }
  };

  const handleChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async () => {
    try {
      setIsSubmitting(true);

      if (!hasPermission) {
        Alert.alert(
          "Incomplete location",
          "Please ensure your location is enabled and permitted."
        );
        setIsSubmitting(false);
        return;
      }
      
      if (!currentLocation) {
        Alert.alert(
          "Incomplete Information",
          "Please ensure your location is available."
        );
        setIsSubmitting(false);
        return;
      }

      await onSubmit({
        ...formData,
        currentLocation,
        proofImageUrl: imgURLForDB,
      });
      
      onClose();
    } catch (error) {
      Alert.alert('Error', error?.response?.data?.message || 'Failed to submit lead');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleRetakePhoto = () => {
    setCapturedImage(null);
    setIMGURLFORDB(null);
    setCameraModalVisible(true);
  };

  // Camera Modal Component
  const CameraModal = () => (
    <Modal
      visible={cameraModalVisible}
      animationType="slide"
      transparent={true}
      onRequestClose={() => setCameraModalVisible(false)}
    >
      <View style={styles.cameraModalOverlay}>
        <View style={styles.cameraModalContainer}>
          <View style={styles.cameraHeader}>
            <Text style={styles.cameraTitle}>Capture Garage Photo</Text>
            <TouchableOpacity
              onPress={() => setCameraModalVisible(false)}
              style={styles.closeCameraButton}
            >
              <Ionicons name="close" size={24} color="white" />
            </TouchableOpacity>
          </View>
          
          <View style={styles.cameraViewContainer}>
            {hasPermission ? (
              <Camera
                ref={cameraRef}
                cameraType={CameraType.Back}
                flashMode="auto"
                onCameraReady={handleCameraReady}
                scanBarcode={false}
                style={styles.fullCamera}
              />
            ) : (
              <View style={styles.permissionDeniedView}>
                <Ionicons name="camera-off" size={50} color="white" />
                <Text style={styles.permissionText}>
                  Camera permission is required to capture photos
                </Text>
                <TouchableOpacity
                  style={styles.grantPermissionButton}
                  onPress={requestPermissions}
                >
                  <Text style={styles.grantPermissionText}>Grant Permission</Text>
                </TouchableOpacity>
              </View>
            )}
          </View>
          
          <View style={styles.cameraFooter}>
            {hasPermission && (
              <TouchableOpacity
                style={styles.captureButtonMain}
                onPress={takePicture}
                
              >
                <View style={styles.captureCircleMain}>
                  <Ionicons name="camera" size={28} color="white" />
                </View>
              </TouchableOpacity>
            )}
          </View>
        </View>
      </View>
    </Modal>
  );

  return (
    <>
      <Modal visible={visible} animationType="fade" transparent={true}>
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          style={styles.modalOverlay}
        >
          <ImageBackground source={ThemeBackground} style={styles.modalBg}>
            <View style={styles.leadModalContainer}>
              <ScrollView 
                contentContainerStyle={styles.leadFormScroll}
                showsVerticalScrollIndicator={false}
              >
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
                    style={[styles.leadInput, styles.textArea]}
                    value={formData.address}
                    onChangeText={text => handleChange('address', text)}
                    placeholder="Enter full address"
                    placeholderTextColor="#888"
                    multiline
                    numberOfLines={3}
                  />
                </View>

                <View style={styles.rowInputGroup}>
                  <View style={[styles.inputGroup, styles.halfInput, { marginRight: 10 }]}>
                    <Text style={styles.inputLabel}>State</Text>
                    <TextInput
                      style={styles.leadInput}
                      value={formData.state}
                      onChangeText={text => handleChange('state', text)}
                      placeholder="State"
                      placeholderTextColor="#888"
                    />
                  </View>
                  <View style={[styles.inputGroup, styles.halfInput]}>
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

                <ServicesInput handleChange={handleChange} formData={formData} />

                <View style={styles.inputGroup}>
                  <Text style={styles.inputLabel}>Customer Feedback</Text>
                  <TextInput
                    style={[styles.leadInput, styles.textArea]}
                    value={formData.comment}
                    onChangeText={text => handleChange('comment', text)}
                    placeholder="Feedback"
                    placeholderTextColor="#888"
                    multiline
                    numberOfLines={3}
                  />
                </View>

                {/* Garage Image Section */}
                <View style={styles.inputGroup}>
                  <Text style={styles.inputLabel}>Garage Image</Text>
                  
                  {!capturedImage ? (
                    <TouchableOpacity
                      style={styles.captureCard}
                      onPress={() => setCameraModalVisible(true)}
                    >
                      <View style={styles.captureCardContent}>
                        <Ionicons name="camera-outline" size={32} color="#3B82F6" />
                        <Text style={styles.captureCardText}>Tap to Capture Garage Photo</Text>
                        <Text style={styles.captureCardSubText}>Will open camera in full screen</Text>
                      </View>
                    </TouchableOpacity>
                  ) : (
                    <View style={styles.imagePreviewContainer}>
                      <Image
                        source={{ uri: capturedImage }}
                        style={styles.imagePreview}
                        resizeMode="cover"
                      />
                      <View style={styles.imageButtonsContainer}>
                        <TouchableOpacity
                          style={[styles.imageButton, styles.retakeButton]}
                          onPress={handleRetakePhoto}
                        >
                          <Ionicons name="refresh" size={16} color="white" />
                          <Text style={styles.retakeButtonText}> Retake</Text>
                        </TouchableOpacity>
                        <TouchableOpacity
                          style={[styles.imageButton, styles.uploadButton]}
                          onPress={() => uploadImageTODB(capturedImage)}
                          disabled={isLoading || !!imgURLForDB}
                        >
                          {isLoading ? (
                            <ActivityIndicator color="white" size="small" />
                          ) : imgURLForDB ? (
                            <>
                              <Ionicons name="checkmark" size={16} color="white" />
                              <Text style={styles.uploadButtonText}> Uploaded</Text>
                            </>
                          ) : (
                            <>
                              <Ionicons name="cloud-upload" size={16} color="white" />
                              <Text style={styles.uploadButtonText}> Upload</Text>
                            </>
                          )}
                        </TouchableOpacity>
                      </View>
                    </View>
                  )}
                  
                  {imgURLForDB && (
                    <Text style={styles.uploadSuccessText}>
                      ✓ Image uploaded successfully
                    </Text>
                  )}
                  
                  {locationError && (
                    <Text style={styles.errorText}>
                      ⚠️ {locationError}
                    </Text>
                  )}
                </View>

                <LinearGradient
                  colors={["#3B82F6", "#1D4ED8"]}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 0 }}
                  style={styles.submitGradient}
                >
                  <TouchableOpacity
                    style={styles.submitButton}
                    onPress={handleSubmit}
                    disabled={isSubmitting}
                  >
                    {isSubmitting ? (
                      <ActivityIndicator color="white" />
                    ) : (
                      <Text style={styles.submitText}>Submit Lead</Text>
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
      
      {/* Camera Modal */}
      <CameraModal />
    </>
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


  cameraModalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.95)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  cameraModalContainer: {
    width: '100%',
    height: '100%',
    backgroundColor: 'black',
  },
  cameraHeader: {
    height: 60,
    backgroundColor: 'rgba(0,0,0,0.8)',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 16,
    position: 'relative',
    paddingTop: Platform.OS === 'ios' ? 40 : 10,
  },
  cameraTitle: {
    color: 'white',
    fontSize: 18,
    fontWeight: '600',
  },
  closeCameraButton: {
    position: 'absolute',
    right: 16,
    top: Platform.OS === 'ios' ? 50 : 15,
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.1)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 10,
  },
  cameraViewContainer: {
    flex: 1,
    backgroundColor: 'black',
  },
  fullCamera: {
    flex: 1,
  },
  permissionDeniedView: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'black',
    paddingHorizontal: 30,
  },
  permissionText: {
    color: 'white',
    fontSize: 16,
    textAlign: 'center',
    marginTop: 20,
    marginBottom: 30,
  },
  grantPermissionButton: {
    backgroundColor: '#3B82F6',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  grantPermissionText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  cameraFooter: {
    height: 120,
    backgroundColor: 'rgba(0,0,0,0.8)',
    justifyContent: 'center',
    alignItems: 'center',
    paddingBottom: Platform.OS === 'ios' ? 30 : 10,
  },
  captureButtonMain: {
    alignItems: 'center',
  },
  captureCircleMain: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: 'rgba(59, 130, 246, 0.8)',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 4,
    borderColor: 'rgba(255,255,255,0.3)',
  },
  
  // Capture Card Styles
  captureCard: {
    marginTop: 8,
    backgroundColor: '#F3F4F6',
    borderRadius: 12,
    padding: 25,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#E5E7EB',
    borderStyle: 'dashed',
  },
  captureCardContent: {
    alignItems: 'center',
  },
  captureCardText: {
    marginTop: 12,
    fontSize: 16,
    color: '#3B82F6',
    fontWeight: '600',
    textAlign: 'center',
  },
  captureCardSubText: {
    marginTop: 4,
    fontSize: 12,
    color: '#6B7280',
    textAlign: 'center',
  },
  
  // Image Preview Styles
  imagePreviewContainer: {
    marginTop: 8,
    alignItems: 'center',
  },
  imagePreview: {
    width: '100%',
    height: 200,
    borderRadius: 10,
    marginBottom: 16,
  },
  imageButtonsContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 12,
    width: '100%',
  },
  imageButton: {
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 8,
    minWidth: 120,
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'center',
    flex: 1,
  },
  retakeButton: {
    backgroundColor: '#EF4444',
  },
  uploadButton: {
    backgroundColor: '#10B981',
  },
  retakeButtonText: {
    color: 'white',
    fontWeight: '600',
    fontSize: 14,
  },
  uploadButtonText: {
    color: 'white',
    fontWeight: '600',
    fontSize: 14,
  },
  uploadSuccessText: {
    color: '#10B981',
    marginTop: 8,
    textAlign: 'center',
    fontWeight: '500',
    fontSize: 14,
  },
  errorText: {
    color: '#EF4444',
    marginTop: 8,
    textAlign: 'center',
    fontSize: 12,
  },
  
  // Modal Styles
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.7)',
    justifyContent: 'center',
    alignItems: 'center',
  },
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
  halfInput: {
    flex: 1,
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
  textArea: {
    height: 80,
    textAlignVertical: 'top',
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
  closeButton: {
    position: 'absolute',
    top: 10,
    right: 10,
    backgroundColor: 'rgba(0,0,0,0.5)',
    borderRadius: 15,
    padding: 5,
    zIndex: 1,
  },
 


  cameraContainer: {
    flex: 1,
    backgroundColor: 'black',
  },
  
  camera: {
    flex: 1,
  },
  
  cameraPreviewContainer: {
    marginTop: 8,
    height: 500,
    borderRadius: 10,
    overflow: 'hidden',
    position: 'relative',
  },
  
  cameraPreview: {
    flex: 1,
  },
  
  cameraControls: {
    position: 'absolute',
    bottom: 40,
    width: '100%',
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  
  captureButtonCamera: {
    width: 70,
    height: 70,
    borderRadius: 35,
    backgroundColor: 'rgba(255,255,255,0.3)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  
  captureInnerCircle: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: 'white',
  },
  
  captureButtonInline: {
   
    alignSelf: 'center',
    alignItems: 'center',
  },
  
  captureCircle: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: 'rgba(59, 130, 246, 0.8)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 5,
  },
  
  closeCameraButton: {
    position: 'absolute',
    top: 40,
    right: 20,
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },





  imagePreviewContainer: {
    marginTop: 8,
    alignItems: 'center',
  },
  
  imagePreview: {
    width: '100%',
    height: 200,
    borderRadius: 10,
    marginBottom: 12,
  },
  
  imageButtonsContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 12,
  },
  
  imageButton: {
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 8,
    minWidth: 100,
    alignItems: 'center',
  },
  
  retakeButton: {
    backgroundColor: '#EF4444',
  },
  
  uploadButton: {
    backgroundColor: '#10B981',
  },
  
  retakeButtonText: {
    color: 'white',
    fontWeight: '600',
  },
  
  uploadButtonText: {
    color: 'white',
    fontWeight: '600',
  },
  
  captureButton: {
    flexDirection: 'row',
    backgroundColor: '#3B82F6',
    padding: 15,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
  },
  
  captureButtonText: {
    color: 'black',
    fontSize: 16,
    fontWeight: '600',
  },
  
  uploadSuccessText: {
    color: '#10B981',
    marginTop: 8,
    textAlign: 'center',
    fontWeight: '500',
  },






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


 