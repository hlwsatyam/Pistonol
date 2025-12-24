 


import React, { useState, useEffect, useRef } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Alert,
  ScrollView,
  ActivityIndicator,
  Image,
  Dimensions,
  Platform,
  PermissionsAndroid,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Camera, CameraType } from 'react-native-camera-kit';
import Geolocation from "@react-native-community/geolocation";
import axios from "axios";
import Icon from 'react-native-vector-icons/MaterialIcons';
import { check, PERMISSIONS, request, RESULTS } from 'react-native-permissions';

const { width, height } = Dimensions.get('window');

const AttendanceScreen = ({ route, navigation }) => {
  const { user } = route.params || {};

  const [hasPermission, setHasPermission] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingStores, setIsLoadingStores] = useState(false);
  const [isLoadingAttendance, setIsLoadingAttendance] = useState(false);
  const cameraRef = useRef(null);
  const [currentLocation, setCurrentLocation] = useState(null);
  const [locationError, setLocationError] = useState(null);
  const [stores, setStores] = useState([]);
  const [selectedStore, setSelectedStore] = useState(null);
  const [todayAttendance, setTodayAttendance] = useState(null);
  const [withinRadius, setWithinRadius] = useState(false);
  const [capturedImage, setCapturedImage] = useState(null);
  const [cameraReady, setCameraReady] = useState(false);
  const [storeDistance, setStoreDistance] = useState(null);

  // Request permissions
  useEffect(() => {
    requestPermissions();
  }, []);

  useEffect(() => {
    if (currentLocation && user) {
      fetchStores(currentLocation.latitude, currentLocation.longitude);
      fetchTodayAttendance();
    }
  }, [currentLocation, user]);

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
      // { 
      //   enableHighAccuracy: true, 
      //   timeout: 20000, 
      //   // maximumAge: 10000 
      // }


 
{}
 

    );
  };

  const fetchStores = async (lat, long) => {
    setIsLoadingStores(true);
    try {
      const response = await axios.get(
        `/v1/stores/one/needcal/nearest-store?lat=${lat}&long=${long}`
      );
      
      if (response.data.nearestStore) {
        setStores([response.data.nearestStore]);
        setSelectedStore(response.data.nearestStore);
        
        // Calculate distance if available
        if (response.data.nearestStore.distanceMeters) {
          setStoreDistance(response.data.nearestStore.distanceMeters.toFixed(2));
        }
      }

      // Check if user is within radius
      const isWithin = !response.data.message?.includes("outside") 
      
      setWithinRadius(!!isWithin);
    } catch (error) {
      console.log("Store fetch error:", error);
      Alert.alert("Error", "Unable to fetch stores. Please try again.");
      setWithinRadius(false);
    } finally {
      setIsLoadingStores(false);
    }
  };

  const fetchTodayAttendance = async () => {
    if (!user?._id) return;
    
    setIsLoadingAttendance(true);
    try {
      const today = new Date().toISOString().split("T")[0];
      const response = await axios.get(
        `/attendance/today?date=${today}&userId=${user._id}`
      );
      setTodayAttendance(response.data);
    } catch (error) {
      console.log("No attendance record for today");
      setTodayAttendance(null);
    } finally {
      setIsLoadingAttendance(false);
    }
  };

  

  const takePicture = async () => {
    if (!cameraRef.current || !cameraReady) {
      Alert.alert("Error", "Camera is not ready yet");
      return null;
    }
    
    try {
      const image = await cameraRef.current.capture();
        




 




   await uploadImageTODB(image.uri);

      setCapturedImage(image.uri);
      return image;
    } catch (error) {
      console.log("Camera capture error:", error);
      Alert.alert("Error", "Unable to capture image. Please try again.");
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
      Alert.alert("Error", "Upload failed");
    }
  };











  const checkIn = async () => {
    // Check if already checked in today
    if (todayAttendance && todayAttendance.checkIn) {
      Alert.alert("Already Checked In", "You have already checked in today.");
      return;
    }

    if (!selectedStore || !currentLocation || !user) {
      Alert.alert(
        "Incomplete Information",
        "Please ensure your location is available and a store is selected."
      );
      return;
    }

    if (!withinRadius) {
      Alert.alert(
        "Out of Range",
        "You are not within the required radius of the store. Please move closer to check in."
      );
      return;
    }

    try {
      setIsLoading(true);
      // const imageUri = await takePicture();
      
      // if (!imageUri) {
      //        Alert.alert(
      //   "MO IMG",
      //   "Yo NO IMG" 
      // );
      //   setIsLoading(false);
      //   return;
      // }

//       const imageUrl = await uploadImage();
 
      await axios.post("/attendance/checkin", {
        userId: user._id,
        storeId: selectedStore._id,
        latitude: currentLocation.latitude,
        longitude: currentLocation.longitude,
        image: imgURLForDB,
      });

      Alert.alert("Success", "Check-in recorded successfully!");
      fetchTodayAttendance();
setIMGURLFORDB(null)
   setCapturedImage(null);

    } catch (error) {
      console.log("Check-in error:", error);
      const errorMessage = error.response?.data?.message || "Check-in failed. Please try again.";
      Alert.alert("Error", errorMessage);
    } finally {
      setIsLoading(false);
    }
  };
  const checkOut = async () => {
    // Check if already checked in today
    if (todayAttendance && todayAttendance.checkOut) {
      Alert.alert("Already Checked Out", "You have already checked Out today.");
      return;
    }

    if (!selectedStore || !currentLocation || !user) {
      Alert.alert(
        "Incomplete Information",
        "Please ensure your location is available and a store is selected."
      );
      return;
    }

    if (!withinRadius) {
      Alert.alert(
        "Out of Range",
        "You are not within the required radius of the store. Please move closer to check in."
      );
      return;
    }

    try {
      setIsLoading(true);
      // const imageUri = await takePicture();
      
      // if (!imageUri) {
      //        Alert.alert(
      //   "MO IMG",
      //   "Yo NO IMG" 
      // );
      //   setIsLoading(false);
      //   return;
      // }

//       const imageUrl = await uploadImage();
 
      await axios.post("/attendance/checkout", {
        userId: user._id,
        storeId: selectedStore._id,
        latitude: currentLocation.latitude,
        attendanceId:todayAttendance._id,
        longitude: currentLocation.longitude,
        image: imgURLForDB,
      });
setIMGURLFORDB(null)
   setCapturedImage(null);
      Alert.alert("Success", "Check-Out recorded successfully!");
      fetchTodayAttendance();
    } catch (error) {
      console.log("Check-Out error:", error);
      const errorMessage = error.response?.data?.message || "Check-in failed. Please try again.";
      Alert.alert("Error", errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const handleRetakePhoto = () => {
    setCapturedImage(null);
  };

  const handleCameraReady = () => {
    setCameraReady(true);
  };

  const formatDate = (dateString) => {
    if (!dateString) return "";
    const date = new Date(dateString);
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  // ------------------ UI Components ------------------

  const PermissionDeniedView = () => (
    <View style={styles.centerContainer}>
      <Icon name="error-outline" size={60} color="#ff3b30" />
      <Text style={styles.errorText}>Permission Required</Text>
      <Text style={styles.errorSubtext}>
        Camera and location permissions are needed to record attendance.
      </Text>
      <TouchableOpacity style={styles.retryButton} onPress={requestPermissions}>
        <Text style={styles.retryButtonText}>Grant Permissions</Text>
      </TouchableOpacity>
    </View>
  );

  const LoadingView = () => (
    <View style={styles.centerContainer}>
      <ActivityIndicator size="large" color="#007AFF" />
      <Text style={styles.loadingText}>Processing...</Text>
    </View>
  );

  const LocationErrorView = () => (
    <View style={styles.errorContainer}>
      <Icon name="location-off" size={40} color="#ff9500" />
      <Text style={styles.errorText}>Location Error</Text>
      <Text style={styles.errorSubtext}>{locationError}</Text>
      <TouchableOpacity style={styles.retryButton} onPress={getLocation}>
        <Text style={styles.retryButtonText}>Retry Location</Text>
      </TouchableOpacity>
    </View>
  );

  const CameraView = () => (
    <View style={styles.cameraContainer}>
      {capturedImage ? (
        <Image source={{ uri: capturedImage }} style={styles.camera} />
      ) : (
        <Camera
          ref={cameraRef}
          style={styles.camera}
          cameraType={CameraType.Front}
           onZoom={handleCameraReady}
         
        />
      )}
      <View style={styles.cameraOverlay}>
        <View style={styles.cameraFrame} />
        <Text style={styles.cameraInstruction}>
          {capturedImage ? "Photo captured" : "Position your face in the frame"}
        </Text>
      </View>
    </View>
  );

  const StoreInfoView = () => (
    <View style={styles.storeBox}>
      <View style={styles.storeHeader}>
        <Icon name="store" size={20} color="#007AFF" />
        <Text style={styles.storeTitle}>Nearest Store</Text>
      </View>
      
      {isLoadingStores ? (
        <ActivityIndicator size="small" color="#007AFF" />
      ) : selectedStore ? (
        <>
          <Text style={styles.storeName}>{selectedStore.name}</Text>
          <Text style={styles.storeAddress}>{selectedStore.address}</Text>
          
          <View style={styles.statusContainer}>
            <View style={[styles.statusIndicator, 
              { backgroundColor: withinRadius ? '#4CD964' : '#FF3B30' }]} />
            <Text style={styles.statusText}>
              {withinRadius ? 'Within Store Radius' : 'Outside Store Radius'}
            </Text>
          </View>
          
          {storeDistance && (
            <Text style={styles.distanceText}>
              {storeDistance} m away
            </Text>
          )}
        </>
      ) : (
        <Text style={styles.noStoreText}>No store found nearby</Text>
      )}
    </View>
  );

  const AttendanceStatusView = () => (
    <View style={styles.attendanceBox}>
      <Text style={styles.attendanceTitle}>Today's Attendance</Text>
      
      {isLoadingAttendance ? (
        <ActivityIndicator size="small" color="#007AFF" />
      ) : todayAttendance ? (
        <View>
          <View style={styles.attendanceRow}>
            <Icon name="login" size={16} color="#4CD964" />
            <Text style={styles.attendanceText}>
              Check-in: {formatDate(todayAttendance?.checkIn?.time)}
            </Text>
          </View>
          
          {todayAttendance.checkOut && (
            <View style={styles.attendanceRow}>
              <Icon name="logout" size={16} color="#FF3B30" />
              <Text style={styles.attendanceText}>
                Check-out: {formatDate(todayAttendance?.checkOut?.time)}
              </Text>
            </View>
          )}
        </View>
      ) : (
        <Text style={styles.noAttendanceText}>No attendance recorded today</Text>
      )}
    </View>
  );

  // const ActionButtons = () => (
  //   <View style={styles.buttonContainer}>
  //     {capturedImage ? (
  //       <>
  //         <TouchableOpacity
  //           style={[styles.actionButton, styles.primaryButton]}
  //           onPress={checkIn}
  //           disabled={isLoading || !withinRadius}
  //         >
  //           {isLoading ? (
  //             <ActivityIndicator color="white" />
  //           ) : (
  //             <Text style={styles.buttonText}>Confirm Check-In</Text>
  //           )}
  //         </TouchableOpacity>
          
  //         <TouchableOpacity
  //           style={[styles.actionButton, styles.secondaryButton]}
  //           onPress={handleRetakePhoto}
  //           disabled={isLoading}
  //         >
  //           <Text style={[styles.buttonText, styles.secondaryButtonText]}>Retake Photo</Text>
  //         </TouchableOpacity>
  //       </>
  //     ) : (
  //       <TouchableOpacity
  //         style={[styles.actionButton, styles.primaryButton]}
  //         onPress={takePicture}
  //         disabled={isLoading || !cameraReady}
  //       >
  //         <Text style={styles.buttonText}>Capture Photo</Text>
  //       </TouchableOpacity>
  //     )}
  //   </View>
  // );




// const ActionButtons = () => {
//   const hasCheckedIn = todayAttendance?.checkIn && !todayAttendance?.checkOut;

//   return (
//     <View style={styles.buttonContainer}>
//       {capturedImage ? (
//         <>
//           <TouchableOpacity
//             style={[styles.actionButton, styles.primaryButton]}
//             onPress={hasCheckedIn ? checkOut : checkIn} // checkOut if already checkedIn
//             disabled={isLoading || !withinRadius}
//           >
//             {isLoading ? (
//               <ActivityIndicator color="white" />
//             ) : (
//               <Text style={styles.buttonText}>
//                 {hasCheckedIn ? "Confirm Check-Out" : "Confirm Check-In"}
//               </Text>
//             )}
//           </TouchableOpacity>

//           <TouchableOpacity
//             style={[styles.actionButton, styles.secondaryButton]}
//             onPress={handleRetakePhoto}
//             disabled={isLoading}
//           >
//             <Text style={[styles.buttonText, styles.secondaryButtonText]}>
//               Retake Photo
//             </Text>
//           </TouchableOpacity>
//         </>
//       ) : (
//         <TouchableOpacity
//           style={[styles.actionButton, styles.primaryButton]}
//           onPress={takePicture}
//           disabled={isLoading || !cameraReady}
//         >
//           <Text style={styles.buttonText}>Capture Photo</Text>
//         </TouchableOpacity>
//       )}
//     </View>
//   );
// };



const ActionButtons = () => {
  const hasCheckedIn = todayAttendance?.checkIn && !todayAttendance?.checkOut;
  const hasCheckedOut = todayAttendance?.checkIn && todayAttendance?.checkOut;
  return (
    <View style={styles.buttonContainer}>
      {capturedImage ? (
        <>
          <TouchableOpacity
            style={[styles.actionButton, styles.primaryButton]}
            onPress={hasCheckedIn ? checkOut : checkIn}  
            disabled={isLoading || !withinRadius}
          >
            {isLoading ? (
              <ActivityIndicator color="white" />
            ) : (
              <Text style={styles.buttonText}>
                {hasCheckedIn ? "Confirm Check-Out" : "Confirm Check-In"}
              </Text>
            )}
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.actionButton, styles.secondaryButton]}
            onPress={handleRetakePhoto}
            disabled={isLoading}
          >
            <Text style={[styles.buttonText, styles.secondaryButtonText]}>
              Retake Photo
            </Text>
          </TouchableOpacity>
        </>
      ) : (
        <TouchableOpacity
          style={[styles.actionButton, styles.primaryButton]}
          onPress={takePicture}
          disabled={isLoading || !cameraReady}
        >
          <Text style={styles.buttonText}>Capture Photo</Text>
        </TouchableOpacity>
      )}
    </View>
  );
};  
 





  // ------------------ Main Render ------------------

  if (hasPermission === false) {
    return <PermissionDeniedView />;
  }

  if (isLoading && !currentLocation) {
    return <LoadingView />;
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Icon name="arrow-back" size={24} color="#fff" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Attendance</Text>
        <View style={styles.headerRight} />
      </View>

      <ScrollView style={styles.container}>
        {/* User Info */}
        <View style={styles.userContainer}>
          <View style={styles.avatar}>
            <Icon name="person" size={24} color="#007AFF" />
          </View>
          <View style={styles.userInfo}>
            <Text style={styles.userName}>{user?.name}</Text>
            <Text style={styles.userId}>ID: {user?._id}</Text>
          </View>
        </View>

        {/* Location Error */}
        {locationError && <LocationErrorView />}

        {/* Camera Section */}
        <Text style={styles.sectionTitle}>Capture Photo</Text>
        <CameraView />
      {/* Action Buttons */}
        <ActionButtons />
        {/* Location Info */}
        {currentLocation && (
          <View style={styles.locationBox}>
            <View style={styles.locationHeader}>
              <Icon name="my-location" size={16} color="#007AFF" />
              <Text style={styles.locationTitle}>Current Location</Text>
            </View>
            <Text style={styles.locationText}>
              {currentLocation.latitude.toFixed(6)}, {currentLocation.longitude.toFixed(6)}
            </Text>
            <Text style={styles.locationAccuracy}>
              Accuracy: ±{currentLocation.accuracy?.toFixed(2) || 'Unknown'} meters
            </Text>
          </View>
        )}

        {/* Store Info */}
        <Text style={styles.sectionTitle}>Store Information</Text>
        <StoreInfoView />

        {/* Attendance Status */}
        <Text style={styles.sectionTitle}>Attendance Status</Text>
        <AttendanceStatusView />

  
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#f5f5f7',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#007AFF',
  },
  backButton: {
    padding: 4,
  },
  headerTitle: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '600',
  },
  headerRight: {
    width: 32,
  },
  container: {
    flex: 1,
    padding: 16,
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  errorContainer: {
    padding: 16,
    backgroundColor: '#fff6e6',
    borderRadius: 12,
    marginBottom: 16,
    alignItems: 'center',
  },
  errorText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    marginTop: 8,
    marginBottom: 4,
  },
  errorSubtext: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
    marginBottom: 16,
  },
  loadingText: {
    marginTop: 12,
    fontSize: 16,
    color: '#666',
  },
  retryButton: {
    backgroundColor: '#007AFF',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 8,
  },
  retryButtonText: {
    color: 'white',
    fontWeight: '600',
  },
  userContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'white',
    padding: 16,
    borderRadius: 12,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  avatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: '#e6f2ff',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  userInfo: {
    flex: 1,
  },
  userName: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    marginBottom: 4,
  },
  userId: {
    fontSize: 14,
    color: '#666',
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 12,
    marginTop: 8,
  },
  cameraContainer: {
    height: 300,
    marginBottom: 16,
    borderRadius: 12,
    overflow: 'hidden',
    backgroundColor: '#000',
    position: 'relative',
  },
  camera: {
    flex: 1,
  },
  cameraOverlay: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'center',
    alignItems: 'center',
  },
  cameraFrame: {
    width: 200,
    height: 200,
    borderRadius: 100,
    borderWidth: 2,
    borderColor: 'rgba(255, 255, 255, 0.6)',
    backgroundColor: 'transparent',
  },
  cameraInstruction: {
    position: 'absolute',
    bottom: 20,
    color: 'white',
    fontSize: 14,
    textAlign: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  locationBox: {
    backgroundColor: 'white',
    padding: 16,
    borderRadius: 12,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  locationHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  locationTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginLeft: 8,
  },
  locationText: {
    fontSize: 14,
    color: '#666',
    marginBottom: 4,
  },
  locationAccuracy: {
    fontSize: 12,
    color: '#888',
  },
  storeBox: {
    backgroundColor: 'white',
    padding: 16,
    borderRadius: 12,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  storeHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  storeTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginLeft: 8,
  },
  storeName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 4,
  },
  storeAddress: {
    fontSize: 14,
    color: '#666',
    marginBottom: 12,
  },
  statusContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  statusIndicator: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginRight: 8,
  },
  statusText: {
    fontSize: 14,
    fontWeight: '500',
  },
  distanceText: {
    fontSize: 14,
    color: '#007AFF',
  },
  noStoreText: {
    fontSize: 14,
    color: '#888',
    fontStyle: 'italic',
  },
  attendanceBox: {
    backgroundColor: 'white',
    padding: 16,
    borderRadius: 12,
    marginBottom: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  attendanceTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 12,
  },
  attendanceRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  attendanceText: {
    fontSize: 14,
    color: '#333',
    marginLeft: 8,
  },
  noAttendanceText: {
    fontSize: 14,
    color: '#888',
    fontStyle: 'italic',
  },
  buttonContainer: {
    marginBottom: 24,
  },
  actionButton: {
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  primaryButton: {
    backgroundColor: '#007AFF',
  },
  secondaryButton: {
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: '#007AFF',
  },
  buttonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  secondaryButtonText: {
    color: '#007AFF',
  },
});

export default AttendanceScreen;
