// import React, {useState, useEffect} from 'react';
// import AsyncStorage from '@react-native-async-storage/async-storage';
// import {
//   View,
//   Text,
//   TextInput,
//   StyleSheet,
//   Image,
//   KeyboardAvoidingView,
//   Platform,
//   ScrollView,
//   TouchableOpacity,
//   SafeAreaView,
//   ActivityIndicator,
//   ToastAndroid,
// } from 'react-native';
// import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
// import LinearGradient from 'react-native-linear-gradient';
// import {color, themeColor} from '../../locale/Locale';
// import ThemeWithBg from '../../Skeleton/ThemeWithBg';
// import * as ImagePicker from 'react-native-image-picker';
// import {useMutation} from '@tanstack/react-query';
// import api from 'axios';
// import {uploadToCloudinary} from '../../hooks/auth';

// const ProfileEditScreen = ({navigation, route}) => {
//   const {user} = route.params || {};
//   const [profileImage, setProfileImage] = useState(null);
//   const [name, setName] = useState(user?.name || '');
//   const [email, setEmail] = useState(user?.email || '');
//   const [district, setDistrict] = useState(user?.district || '');
//   const [state, setState] = useState(user?.state || '');
//   const [pincode, setPincode] = useState(user?.pincode || '');
//   const [aadharNumber, setAadharNumber] = useState(user?.aadhaarNumber || '');
//   const [panNumber, setPanNumber] = useState(user?.panNumber || '');
//   const [address, setAddress] = useState(user?.address || '');
//   const [errors, setErrors] = useState({});
//   const [isUploading, setIsUploading] = useState(false);
  

//   // Initialize with user's existing photo if available
//   useEffect(() => {
//     if (user?.photo?.url) {
//       setProfileImage(user.photo.url);
//     }
//   }, [user]);

//   const updateProfileMutation = useMutation({
//     mutationFn: async updatedData => {
//       const response = await api.put('/auth/users/profile', updatedData);
//       return response.data;
//     },
//     onSuccess: async data => {
      
//       await AsyncStorage.setItem('user', JSON.stringify(data?.user));
//       ToastAndroid.show(data.message || 'Profile Updated', ToastAndroid.SHORT);
//     },
//     onError: e => {
//       ToastAndroid.show(
//         e?.response?.data?.message || 'Profile Updating error',
//         ToastAndroid.SHORT,
//       );
//     },
//   });

//   const handleImagePicker = async () => {
//     try {
//       const result = await ImagePicker.launchImageLibrary({
//         mediaType: 'photo',
//         includeBase64: false,
//         maxHeight: 800,
//         maxWidth: 800,
//         quality: 0.8,
//       });

//       if (result.assets && result.assets.length > 0) {
//         setIsUploading(true);
//         const imageUri = result.assets[0].uri;
//         setProfileImage(imageUri);

//         // Upload to Cloudinary
//         const cloudinaryResponse = await uploadToCloudinary(imageUri);

//         // Update profile with new photo

//         await updateProfileMutation.mutateAsync({
//           _id: user._id,
//           photo: {
//             url: cloudinaryResponse.secure_url,
//             public_id: cloudinaryResponse.public_id,
//           },
//         });
//       }
//     } catch (error) {
//       console.error('Image upload error:', error);
//     } finally {
//       setIsUploading(false);
//     }
//   };

//   const validateForm = () => {
//     let valid = true;
//     const newErrors = {};

//     if (!name.trim()) {
//       newErrors.name = 'Name is required';
//       valid = false;
//     }

//     if (email && !/^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/.test(email)) {
//       newErrors.email = 'Invalid email format';
//       valid = false;
//     }

//     if (!district.trim()) {
//       newErrors.district = 'District is required';
//       valid = false;
//     }

//     if (!state.trim()) {
//       newErrors.state = 'State is required';
//       valid = false;
//     }

//     if (!pincode.trim()) {
//       newErrors.pincode = 'Pincode is required';
//       valid = false;
//     } else if (!/^[0-9]{6}$/.test(pincode)) {
//       newErrors.pincode = 'Invalid pincode';
//       valid = false;
//     }

//     if (aadharNumber && !/^[0-9]{12}$/.test(aadharNumber)) {
//       newErrors.aadharNumber = 'Invalid Aadhaar number';
//       valid = false;
//     }

//     if (panNumber && !/[A-Z]{5}[0-9]{4}[A-Z]{1}/.test(panNumber)) {
//       newErrors.panNumber = 'Invalid PAN number';
//       valid = false;
//     }

//     setErrors(newErrors);
//     return valid;
//   };

//   const handleSubmit = async () => {
//     if (!validateForm()) return;

//     try {
//       const updatedData = {
//         _id: user._id,
//         name,
//         email: email || undefined,  
//         district,
//         state,
//         pincode,
//         aadhaarNumber: aadharNumber || undefined,
//         panNumber: panNumber || undefined,
//         address: address || undefined,
//       };

//       await updateProfileMutation.mutateAsync(updatedData);
//     } catch (error) {
//       console.error('Profile update error:', error);
//     }
//   };

//   const handleBack = () => {
//     navigation.goBack();
//   };

//   return (
//     <ThemeWithBg>
//       <SafeAreaView style={styles.container}>
//         {/* Fixed Top-Left Back Button */}
//         <TouchableOpacity style={styles.backButton} onPress={handleBack}>
//           <Icon name="arrow-left" size={24} color="#333" />
//         </TouchableOpacity>

//         <KeyboardAvoidingView
//           behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
//           style={{flex: 1}}>
//           <ScrollView
//             contentContainerStyle={styles.scrollContainer}
//             keyboardShouldPersistTaps="handled"
//             showsVerticalScrollIndicator={false}>
//             <View style={styles.logoContainer}>
//               <TouchableOpacity
//                 onPress={handleImagePicker}
//                 disabled={isUploading}>
//                 {isUploading ? (
//                   <View style={styles.profileImagePlaceholder}>
//                     <ActivityIndicator size="large" color={themeColor[0]} />
//                   </View>
//                 ) : profileImage ? (
//                   <Image
//                     source={{uri: profileImage}}
//                     style={styles.profileImage}
//                   />
//                 ) : (
//                   <View style={styles.profileImagePlaceholder}>
//                     <Icon name="camera-plus" size={50} color="#666" />
//                     <Text style={styles.profileImageText}>Add Photo</Text>
//                   </View>
//                 )}
//               </TouchableOpacity>
//             </View>

//             <View style={styles.form}>
//               <Text style={styles.title}>Edit Your Profile</Text>

//               <CustomInput
//                 label="Full Name"
//                 value={name}
//                 onChangeText={setName}
//                 error={errors.name}
//                 icon="account"
//               />
//               <CustomInput
//                 label="Email (Optional)"
//                 value={email}
//                 onChangeText={setEmail}
//                 error={errors.email}
//                 keyboardType="email-address"
//                 icon="email"
//               />
//               <CustomInput
//                 label="District"
//                 value={district}
//                 onChangeText={setDistrict}
//                 error={errors.district}
//                 icon="map-marker"
//               />
//               <CustomInput
//                 label="State"
//                 value={state}
//                 onChangeText={setState}
//                 error={errors.state}
//                 icon="earth"
//               />
//               <CustomInput
//                 label="Pincode"
//                 value={pincode}
//                 onChangeText={setPincode}
//                 error={errors.pincode}
//                 keyboardType="number-pad"
//                 maxLength={6}
//                 icon="pin"
//               />
//               <CustomInput
//                 label="Address (Optional)"
//                 value={address}
//                 onChangeText={setAddress}
//                 icon="home"
//                 multiline
//               />
//               <CustomInput
//                 label="Aadhar Number (Optional)"
//                 value={aadharNumber}
//                 onChangeText={setAadharNumber}
//                 error={errors.aadharNumber}
//                 keyboardType="number-pad"
//                 maxLength={12}
//                 icon="card-account-details"
//               />
//               <CustomInput
//                 label="PAN Number (Optional)"
//                 value={panNumber}
//                 onChangeText={setPanNumber}
//                 error={errors.panNumber}
//                 icon="card-account-details-outline"
//               />

//               <LinearGradient
//                 colors={themeColor}
//                 style={styles.gradientButton}
//                 start={{x: 0, y: 0}}
//                 end={{x: 1, y: 0}}>
//                 <TouchableOpacity
//                   onPress={handleSubmit}
//                   style={styles.button}
//                   disabled={updateProfileMutation.isPending}>
//                   {updateProfileMutation.isPending ? (
//                     <ActivityIndicator color="#fff" />
//                   ) : (
//                     <Text style={styles.buttonLabel}>Save Profile</Text>
//                   )}
//                 </TouchableOpacity>
//               </LinearGradient>
//             </View>
//           </ScrollView>
//         </KeyboardAvoidingView>
//       </SafeAreaView>
//     </ThemeWithBg>
//   );
// };

// const CustomInput = ({
//   label,
//   value,
//   onChangeText,
//   error,
//   keyboardType,
//   maxLength,
//   icon,
//   multiline = false,
// }) => (
//   <View style={styles.inputWrapper}>
//     <View style={[styles.inputRow, multiline && {alignItems: 'flex-start'}]}>
//       <Icon
//         name={icon}
//         size={20}
//         color={color}
//         style={{marginRight: 8, marginTop: multiline ? 8 : 0}}
//       />
//       <TextInput
//         style={[
//           styles.input,
//           multiline && {minHeight: 80, textAlignVertical: 'top'},
//         ]}
//         placeholder={label}
//         placeholderTextColor={color}
//         value={value}
//         onChangeText={onChangeText}
//         keyboardType={keyboardType}
//         maxLength={maxLength}
//         multiline={multiline}
//       />
//     </View>
//     {error && <Text style={styles.errorText}>{error}</Text>}
//   </View>
// );

// const styles = StyleSheet.create({
//   container: {
//     flex: 1,
//   },
//   scrollContainer: {
//     padding: 20,
//     paddingTop: 60,
//   },
//   backButton: {
//     position: 'absolute',
//     top: 15,
//     left: 15,
//     zIndex: 999,
//     backgroundColor: '#fff',
//     padding: 8,
//     borderRadius: 20,
//     elevation: 5,
//   },
//   logoContainer: {
//     alignItems: 'center',
//     marginBottom: 30,
//   },
//   profileImage: {
//     width: 140,
//     height: 140,
//     borderRadius: 70,
//     borderWidth: 3,
//     borderColor: themeColor[0],
//   },
//   profileImagePlaceholder: {
//     width: 140,
//     height: 140,
//     borderRadius: 70,
//     backgroundColor: '#f2f2f2',
//     justifyContent: 'center',
//     alignItems: 'center',
//     borderWidth: 2,
//     borderColor: '#ccc',
//   },
//   profileImageText: {
//     marginTop: 8,
//     color: '#666',
//     fontSize: 14,
//   },
//   form: {
//     width: '100%',
//   },
//   title: {
//     fontSize: 22,
//     fontWeight: 'bold',
//     textAlign: 'center',
//     color: color,
//     marginBottom: 25,
//   },
//   inputWrapper: {
//     marginBottom: 15,
//   },
//   inputRow: {
//     flexDirection: 'row',
//     alignItems: 'center',
//     borderBottomWidth: 1.5,
//     borderColor: themeColor[0],
//     paddingBottom: 4,
//   },
//   input: {
//     flex: 1,
//     fontSize: 16,
//     color: color,
//     paddingVertical: 8,
//   },
//   errorText: {
//     color: '#ff4444',
//     fontSize: 13,
//     marginTop: 4,
//     marginLeft: 28,
//   },
//   gradientButton: {
//     marginTop: 25,
//     borderRadius: 5,
//     overflow: 'hidden',
//   },
//   button: {
//     paddingVertical: 12,
//     alignItems: 'center',
//   },
//   buttonLabel: {
//     color: '#fff',
//     fontSize: 16,
//     fontWeight: 'bold',
//   },
// });

// export default ProfileEditScreen;


import React, {useState, useEffect} from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  Image,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  TouchableOpacity,
  SafeAreaView,
  ActivityIndicator,
  ToastAndroid,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import LinearGradient from 'react-native-linear-gradient';
import {color, themeColor} from '../../locale/Locale';
import ThemeWithBg from '../../Skeleton/ThemeWithBg';
import * as ImagePicker from 'react-native-image-picker';
import {useMutation} from '@tanstack/react-query';
import api from 'axios';
import {uploadToCloudinary} from '../../hooks/auth';

const ProfileEditScreen = ({navigation, route}) => {
  const {user} = route.params || {};
  const [profileImage, setProfileImage] = useState(null);
  const [name, setName] = useState(user?.name || '');
  const [email, setEmail] = useState(user?.email || '');
  const [district, setDistrict] = useState(user?.district || '');
  const [state, setState] = useState(user?.state || '');
  const [pincode, setPincode] = useState(user?.pincode || '');
  const [aadharNumber, setAadharNumber] = useState(user?.aadhaarNumber || '');
  const [panNumber, setPanNumber] = useState(user?.panNumber || '');
  const [address, setAddress] = useState(user?.address || '');
  const [errors, setErrors] = useState({});
  const [isUploading, setIsUploading] = useState(false);
  

  // Initialize with user's existing photo if available
  useEffect(() => {
    if (user?.photo?.url) {
      setProfileImage(user.photo.url);
    }
  }, [user]);

  const updateProfileMutation = useMutation({
    mutationFn: async updatedData => {
      const response = await api.put('/auth/users/profile', updatedData);
      return response.data;
    },
    onSuccess: async data => {
      
      await AsyncStorage.setItem('user', JSON.stringify(data?.user));
      ToastAndroid.show(data.message || 'Profile Updated', ToastAndroid.SHORT);
    },
    onError: e => {
      ToastAndroid.show(
        e?.response?.data?.message || 'Profile Updating error',
        ToastAndroid.SHORT,
      );
    },
  });

  const handleImagePicker = async () => {
    try {
      const result = await ImagePicker.launchImageLibrary({
        mediaType: 'photo',
        includeBase64: false,
        maxHeight: 800,
        maxWidth: 800,
        quality: 0.8,
      });

      if (result.assets && result.assets.length > 0) {
        setIsUploading(true);
        const imageUri = result.assets[0].uri;
        setProfileImage(imageUri);

        // Upload to Cloudinary
        const cloudinaryResponse = await uploadToCloudinary(imageUri);

        // Update profile with new photo

        await updateProfileMutation.mutateAsync({
          _id: user._id,
          photo: {
            url: cloudinaryResponse.secure_url,
            public_id: cloudinaryResponse.public_id,
          },
        });
      }
    } catch (error) {
      console.error('Image upload error:', error);
    } finally {
      setIsUploading(false);
    }
  };

  const validateForm = () => {
    let valid = true;
    const newErrors = {};

    if (!name.trim()) {
      newErrors.name = 'Name is required';
      valid = false;
    }

    if (email && !/^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/.test(email)) {
      newErrors.email = 'Invalid email format';
      valid = false;
    }

    if (!district.trim()) {
      newErrors.district = 'District is required';
      valid = false;
    }

    if (!state.trim()) {
      newErrors.state = 'State is required';
      valid = false;
    }

    if (!pincode.trim()) {
      newErrors.pincode = 'Pincode is required';
      valid = false;
    } else if (!/^[0-9]{6}$/.test(pincode)) {
      newErrors.pincode = 'Invalid pincode';
      valid = false;
    }

    if (aadharNumber && !/^[0-9]{12}$/.test(aadharNumber)) {
      newErrors.aadharNumber = 'Invalid Aadhaar number';
      valid = false;
    }

    if (panNumber && !/[A-Z]{5}[0-9]{4}[A-Z]{1}/.test(panNumber)) {
      newErrors.panNumber = 'Invalid PAN number';
      valid = false;
    }

    setErrors(newErrors);
    return valid;
  };

  const handleSubmit = async () => {
    if (!validateForm()) return;

    try {
      const updatedData = {
        _id: user._id,
        name,
        email: email || undefined,  
        district,
        state,
        pincode,
        aadhaarNumber: aadharNumber || undefined,
        panNumber: panNumber || undefined,
        address: address || undefined,
      };

      await updateProfileMutation.mutateAsync(updatedData);
    } catch (error) {
      console.error('Profile update error:', error);
    }
  };

  const handleBack = () => {
    navigation.goBack();
  };

  return (
    <ThemeWithBg>
      <SafeAreaView style={styles.container}>
        {/* Fixed Top-Left Back Button */}
        <TouchableOpacity style={styles.backButton} onPress={handleBack}>
          <Icon name="arrow-left" size={24} color="#0000FF" />
        </TouchableOpacity>

        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          style={{flex: 1}}>
          <ScrollView
            contentContainerStyle={styles.scrollContainer}
            keyboardShouldPersistTaps="handled"
            showsVerticalScrollIndicator={false}>
            <View style={styles.logoContainer}>
              <TouchableOpacity
                onPress={handleImagePicker}
                disabled={isUploading}>
                {isUploading ? (
                  <View style={styles.profileImagePlaceholder}>
                    <ActivityIndicator size="large" color="#0000FF" />
                  </View>
                ) : profileImage ? (
                  <Image
                    source={{uri: profileImage}}
                    style={styles.profileImage}
                  />
                ) : (
                  <View style={styles.profileImagePlaceholder}>
                    <Icon name="camera-plus" size={50} color="#0000FF" />
                    <Text style={styles.profileImageText}>Add Photo</Text>
                  </View>
                )}
              </TouchableOpacity>
            </View>

            <View style={styles.form}>
              <Text style={styles.title}>Edit Your Profile</Text>

              <CustomInput
                label="Full Name"
                value={name}
                onChangeText={setName}
                error={errors.name}
                icon="account"
              />
              <CustomInput
                label="Email (Optional)"
                value={email}
                onChangeText={setEmail}
                error={errors.email}
                keyboardType="email-address"
                icon="email"
              />
              <CustomInput
                label="District"
                value={district}
                onChangeText={setDistrict}
                error={errors.district}
                icon="map-marker"
              />
              <CustomInput
                label="State"
                value={state}
                onChangeText={setState}
                error={errors.state}
                icon="earth"
              />
              <CustomInput
                label="Pincode"
                value={pincode}
                onChangeText={setPincode}
                error={errors.pincode}
                keyboardType="number-pad"
                maxLength={6}
                icon="pin"
              />
              <CustomInput
                label="Address (Optional)"
                value={address}
                onChangeText={setAddress}
                icon="home"
                multiline
              />
              <CustomInput
                label="Aadhar Number (Optional)"
                value={aadharNumber}
                onChangeText={setAadharNumber}
                error={errors.aadharNumber}
                keyboardType="number-pad"
                maxLength={12}
                icon="card-account-details"
              />
              <CustomInput
                label="PAN Number (Optional)"
                value={panNumber}
                onChangeText={setPanNumber}
                error={errors.panNumber}
                icon="card-account-details-outline"
              />

              <LinearGradient
                colors={['#0000FF', '#0000FF']}
                style={styles.gradientButton}
                start={{x: 0, y: 0}}
                end={{x: 1, y: 0}}>
                <TouchableOpacity
                  onPress={handleSubmit}
                  style={styles.button}
                  disabled={updateProfileMutation.isPending}>
                  {updateProfileMutation.isPending ? (
                    <ActivityIndicator color="#fff" />
                  ) : (
                    <Text style={styles.buttonLabel}>Save Profile</Text>
                  )}
                </TouchableOpacity>
              </LinearGradient>
            </View>
          </ScrollView>
        </KeyboardAvoidingView>
      </SafeAreaView>
    </ThemeWithBg>
  );
};

const CustomInput = ({
  label,
  value,
  onChangeText,
  error,
  keyboardType,
  maxLength,
  icon,
  multiline = false,
}) => (
  <View style={styles.inputWrapper}>
    <View style={[styles.inputRow, multiline && {alignItems: 'flex-start'}]}>
      <Icon
        name={icon}
        size={20}
        color="#0000FF"
        style={{marginRight: 8, marginTop: multiline ? 8 : 0}}
      />
      <TextInput
        style={[
          styles.input,
          multiline && {minHeight: 80, textAlignVertical: 'top'},
        ]}
        placeholder={label}
        placeholderTextColor="#666"
        value={value}
        onChangeText={onChangeText}
        keyboardType={keyboardType}
        maxLength={maxLength}
        multiline={multiline}
        selectionColor="#0000FF"
      />
    </View>
    {error && <Text style={styles.errorText}>{error}</Text>}
  </View>
);

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  scrollContainer: {
    padding: 20,
    paddingTop: 60,
    backgroundColor: '#fff',
  },
  backButton: {
    position: 'absolute',
    top: 15,
    left: 15,
    zIndex: 999,
    backgroundColor: '#ffe6e6',
    padding: 8,
    borderRadius: 20,
    elevation: 5,
  },
  logoContainer: {
    alignItems: 'center',
    marginBottom: 30,
  },
  profileImage: {
    width: 140,
    height: 140,
    borderRadius: 70,
    borderWidth: 3,
    borderColor: '#0000FF',
  },
  profileImagePlaceholder: {
    width: 140,
    height: 140,
    borderRadius: 70,
    backgroundColor: '#fff5f5',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#0000FF',
    borderStyle: 'dashed',
  },
  profileImageText: {
    marginTop: 8,
    color: '#0000FF',
    fontSize: 14,
    fontWeight: '500',
  },
  form: {
    width: '100%',
  },
  title: {
    fontSize: 22,
    fontWeight: 'bold',
    textAlign: 'center',
    color: '#000',
    marginBottom: 25,
  },
  inputWrapper: {
    marginBottom: 15,
  },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    borderBottomWidth: 1.5,
    borderColor: '#0000FF',
    paddingBottom: 4,
  },
  input: {
    flex: 1,
    fontSize: 16,
    color: '#000',
    paddingVertical: 8,
  },
  errorText: {
    color: '#0000FF',
    fontSize: 13,
    marginTop: 4,
    marginLeft: 28,
    fontWeight: '500',
  },
  gradientButton: {
    marginTop: 25,
    borderRadius: 8,
    overflow: 'hidden',
    elevation: 5,
    shadowColor: '#0000FF',
    shadowOffset: {width: 0, height: 3},
    shadowOpacity: 0.3,
    shadowRadius: 5,
  },
  button: {
    paddingVertical: 15,
    alignItems: 'center',
  },
  buttonLabel: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
});

export default ProfileEditScreen;