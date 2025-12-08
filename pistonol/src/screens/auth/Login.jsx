// import React, {useState} from 'react';
// import {
//   View,
//   StyleSheet,
//   Image,
//   KeyboardAvoidingView,
//   Platform,
//   ScrollView,
//   TextInput,
//   TouchableOpacity,
//   ActivityIndicator,
//   ToastAndroid,
// } from 'react-native';
// import auth from '@react-native-firebase/auth';
// import {Text} from 'react-native';
// import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
// import LinearGradient from 'react-native-linear-gradient';
// import ThemeWithBg from '../../Skeleton/ThemeWithBg';
// import {
//   color,
//   endDirectionTheme,
//   Logo,
//   startDirectionTheme,
//   themeColor,
// } from '../../locale/Locale';
 

// const Login = ({navigation}) => {
//   const [mobile, setMobile] = useState('');
//   const [errors, setErrors] = useState({mobile: ''});



//   const validateForm = () => {
//     let valid = true;
//     const newErrors = {mobile: ''};

//     if (!mobile.trim()) {
//       newErrors.mobile = 'Mobile number is required';
//       valid = false;
//     } else if (!/^[0-9]{10}$/.test(mobile)) {
//       newErrors.mobile = 'Invalid mobile number (10 digits required)';
//       valid = false;
//     }

//     setErrors(newErrors);
//     return valid;
//   };
//   const [isLoading, setIsLoading] = useState(false);
//   const handleSubmit = async () => {
//     setIsLoading(true);
//     if (validateForm()) {
//       try {
//         const conf = await auth().signInWithPhoneNumber(`+91${mobile}`);

//         setIsLoading(false);
//         ToastAndroid.show('OTP sent successfully!', ToastAndroid.SHORT);
//         return navigation.navigate('Otp', {mobile, conf});
//       } catch (error) {
//         console.log(error);
//         setIsLoading(false);
//         ToastAndroid.show(
//           error?.message || 'Please Use Without +91',
//           ToastAndroid.SHORT,
//         );
//       }
//     }
//   };

//   return (
//     <ThemeWithBg>
//       <KeyboardAvoidingView
//         behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
//         style={styles.container}>
//         <ScrollView
//           contentContainerStyle={styles.scrollContainer}
//           keyboardShouldPersistTaps="handled">
//           <View style={styles.logoContainer}>
//             <Image source={Logo} style={styles.logo} resizeMode="contain" />
//           </View>

//           <View style={styles.formCard}>
//             <Text style={[styles.title, {color}]}>Login</Text>

//             <View style={styles.inputContainer}>
//               <Icon
//                 name="phone"
//                 color={color}
//                 size={20}
//                 style={styles.inputIcon}
//               />
//               <TextInput
//                 placeholder="Mobile Number"
//                 placeholderTextColor={color}
//                 value={mobile}
//                 onChangeText={setMobile}
//                 keyboardType="phone-pad"
//                 maxLength={10}
//                 style={[styles.input, {color, borderBottomColor: color}]}
//                 selectionColor={color}
//               />
//             </View>

//             {errors.mobile ? (
//               <Text style={[styles.errorText, {color}]}>{errors.mobile}</Text>
//             ) : null}

//             <LinearGradient
//               colors={themeColor}
//               style={styles.gradientButton}
//               start={startDirectionTheme}
//               end={endDirectionTheme}>
//               <TouchableOpacity
//                 style={styles.button}
//                 onPress={handleSubmit}
//                 disabled={isLoading}>
//                 {isLoading ? (
//                   <ActivityIndicator color="#fff" />
//                 ) : (
//                   <Text style={[styles.buttonLabel, {color: 'white'}]}>
//                     Login
//                   </Text>
//                 )}
//               </TouchableOpacity>
//             </LinearGradient>
//           </View>
//         </ScrollView>
//       </KeyboardAvoidingView>
//     </ThemeWithBg>
//   );
// };

// const styles = StyleSheet.create({
//   container: {
//     flex: 1,
//   },
//   scrollContainer: {
//     flexGrow: 1,
//     justifyContent: 'space-between',
//     padding: 20,
//   },
//   logoContainer: {
//     alignItems: 'center',
//     marginBottom: 20,
//     marginTop: 40,
//   },
//   logo: {
//     width: 200,
//     height: 200,
//   },
//   formCard: {
//     backgroundColor: 'transparent',
//     width: '100%',
//   },
//   title: {
//     fontSize: 24,
//     fontWeight: 'bold',
//     textAlign: 'center',
//     marginBottom: 30,
//   },
//   inputContainer: {
//     flexDirection: 'row',
//     alignItems: 'center',
//     marginBottom: 15,
//     borderBottomWidth: 1,
//     borderBottomColor: color,
//   },
//   inputIcon: {
//     marginRight: 10,
//   },
//   input: {
//     flex: 1,
//     fontSize: 16,
//     paddingVertical: 12,
//     backgroundColor: 'transparent',
//   },
//   errorText: {
//     marginBottom: 15,
//     marginLeft: 5,
//   },
//   gradientButton: {
//     borderRadius: 5,
//     marginTop: 20,
//     overflow: 'hidden',
//   },
//   button: {
//     paddingVertical: 15,
//     alignItems: 'center',
//   },
//   buttonLabel: {
//     fontWeight: 'bold',
//     fontSize: 16,
//   },
// });

// export default Login;

 



import React, {useState} from 'react';
import {
  View,
  StyleSheet,
  Image,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
  ToastAndroid,
} from 'react-native';
import auth from '@react-native-firebase/auth';
import {Text} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import ThemeWithBg from '../../Skeleton/ThemeWithBg';
import {
  Logo,tick
} from '../../locale/Locale';

const Login = ({navigation}) => {
  const [mobile, setMobile] = useState('');
  const [errors, setErrors] = useState({mobile: ''});

  const validateForm = () => {
    let valid = true;
    const newErrors = {mobile: ''};

    if (!mobile.trim()) {
      newErrors.mobile = 'Mobile number is required';
      valid = false;
    } else if (!/^[0-9]{10}$/.test(mobile)) {
      newErrors.mobile = 'Invalid mobile number (10 digits required)';
      valid = false;
    }

    setErrors(newErrors);
    return valid;
  };

  const [isLoading, setIsLoading] = useState(false);
  
  const handleSubmit = async () => {
    setIsLoading(true);
    if (validateForm()) {
      try {
        const conf = await auth().signInWithPhoneNumber(`+91${mobile}`);
        setIsLoading(false);
        ToastAndroid.show('OTP sent successfully!', ToastAndroid.SHORT);
        return navigation.navigate('Otp', {mobile, conf});
      } catch (error) {
        console.log(error);
        setIsLoading(false);
        ToastAndroid.show(
          error?.message || 'Please Use Without +91',
          ToastAndroid.SHORT,
        );
      }
    }
  };

  return (
    <ThemeWithBg>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.container}>
        <ScrollView
          contentContainerStyle={styles.scrollContainer}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}>
          
          {/* Top White Section with Red Border */}
          <View style={styles.topSection}>
            <View style={styles.whiteCard}>
              {/* Logo and Tick Mark */}
              <View style={styles.logoContainer}>
                <Image source={Logo} style={styles.logo} resizeMode="contain" />
              </View>
              
           


{/* <View style={styles.tickContainer}>
  <Text style={{
    fontSize: 85,
    color: '#FF0000',
    fontWeight: '900',
 
    shadowOpacity: 0.9,
    shadowRadius: 20,
    elevation: 20,
    lineHeight: 85,
  }}>✓</Text>
</View> */}

 
                <Image source={tick} style={styles.logo1} resizeMode="contain" />
          










              <Text style={styles.welcomeTitle}>Welcome To Power Scan!</Text>
            
            </View>
          </View>

          {/* Bottom Blue Card - Fixed at Bottom */}
          <View style={styles.bottomSection}>
            <View style={styles.blueCard}>
       


<Text style={{
  fontSize: 20,
  fontWeight: 'bold',
  textAlign: 'center',
  color: '#fff',
  marginTop: 10,
  marginBottom: 8,
  textShadowColor: 'rgba(0, 0, 0, 0.3)',
  textShadowOffset: { width: 1, height: 1 },
  textShadowRadius: 3,
}}>
  Login Your Account
</Text>


              <View style={styles.formContainer}>
                
                {/* Mobile Input Field */}
                <View style={styles.inputWrapper}>
                  {/* <View style={styles.inputContainer}>
                    <Icon
                      name="phone"
                      color="#666"
                      size={22}
                      style={styles.inputIcon}
                    />
                    <TextInput
                      placeholder="Enter Mobile Number"
                      placeholderTextColor="#999"
                      value={mobile}
                      onChangeText={setMobile}
                      keyboardType="phone-pad"
                      maxLength={10}
                      style={styles.input}
                      selectionColor="#2401fe"
                    />
                    {mobile.length > 0 && (
                      <TouchableOpacity onPress={() => setMobile('')}>
                        <Icon name="close-circle" size={20} color="#999" />
                      </TouchableOpacity>
                    )}
                  </View> */}



 



<View style={{
  flexDirection: 'row',
  alignItems: 'center',
  backgroundColor: '#fff',
  borderRadius: 15,
  paddingHorizontal: 15,
  paddingVertical: 8,
  elevation: 5,
  shadowColor: '#000',
  shadowOffset: {width: 0, height: 3},
  shadowOpacity: 0.2,
  shadowRadius: 6,
}}>
  {/* India Flag and +91 */}
  <View style={{flexDirection: 'row', alignItems: 'center', marginRight: 10}}>
    <Text style={{fontSize: 20, marginRight: 6}}>🇮🇳</Text>
    <Text style={{fontSize: 16, color: '#333', fontWeight: '600'}}>+91</Text>
  </View>
  
  <View style={{width: 1, height: 25, backgroundColor: '#ddd', marginRight: 12}} />
  
  <TextInput
    placeholder="Enter Mobile Number"
    placeholderTextColor="#999"
    value={mobile}
    onChangeText={setMobile}
    keyboardType="phone-pad"
    maxLength={10}
    style={{
      flex: 1,
      fontSize: 16,
      paddingVertical: 12,
      color: '#333',
      fontWeight: '500',
    }}
    selectionColor="#2401fe"
  />
  
  {mobile.length > 0 && (
    <TouchableOpacity onPress={() => setMobile('')}>
      <Icon name="close-circle" size={20} color="#999" />
    </TouchableOpacity>
  )}

  
</View>
 <Text style={styles.termsText}>
                  You will recieve an OTP , message charge may apply
                 
                </Text>








                  

                  {errors.mobile ? (
                    <View style={styles.errorContainer}>
                      <Icon name="alert-circle" size={16} color="#FF6B6B" />
                      <Text style={styles.errorText}>{errors.mobile}</Text>
                    </View>
                  ) : null}
                </View>

                {/* Login Button */}
                <TouchableOpacity
                  style={[styles.loginButton, isLoading && styles.buttonDisabled]}
                  onPress={handleSubmit}
                  disabled={isLoading}>
                  {isLoading ? (
                    <ActivityIndicator color="#fff" />
                  ) : (
                    <View style={styles.buttonContent}>
                      <Text style={styles.buttonLabel}>Login</Text>
                      
                    </View>
                  )}
                </TouchableOpacity>

            

                <Text style={styles.termsText}>
                  By continuing, you agree to our{'\n'}
                  <Text style={styles.termsLink}>Terms of Service</Text> and{' '}
                  <Text style={styles.termsLink}>Privacy Policy</Text>
                </Text>
              </View>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </ThemeWithBg>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContainer: {
    flexGrow: 1,
    justifyContent: 'space-between',
  },
  topSection: {
    flex: 1,
    paddingHorizontal: 25,
   
  },
  whiteCard: {
    backgroundColor: '#fff',
    borderRadius: 25,
    padding: 30,
    alignItems: 'center',
    borderTopWidth: 8,
    borderTopColor: '#FF4757',
    borderLeftWidth: 1,
    borderLeftColor: '#f0f0f0',
    borderRightWidth: 1,
    borderRightColor: '#f0f0f0',
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 4},
    shadowOpacity: 0.1,
    shadowRadius: 12,
  },
  logoContainer: {
    alignItems: 'center',
    marginBottom: 2,
  },
  logo: {
    width: 200,
    height: 200,
  },
  logo1: {
    width: 60,
    height: 60,
  },
  tickContainer: {
    alignItems: 'center',
    marginBottom: 20,
  },
  tickCircle: {
    width: 70,
    height: 70,
    borderRadius: 35,
    backgroundColor: '#FF4757',
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 3},
    shadowOpacity: 0.3,
    shadowRadius: 5,
  },
  welcomeTitle: {
    fontSize: 20,
    fontWeight: 800,
    textAlign: 'center',
    marginBottom: 50,
    marginTop: 12,
    color: '#333',
  },
  welcomeSubtitle: {
    fontSize: 14,
    textAlign: 'center',
    color: '#666',
    lineHeight: 20,
  },
  bottomSection: {
    width: '100%',
    paddingHorizontal: 25,
    paddingBottom: 30,
    marginTop: 'auto', // This pushes it to bottom
  },
  blueCard: {
    backgroundColor: '#2401fe',
    borderRadius: 25,
    borderTopWidth: 6,
    borderTopColor: '#FF4757',
    borderLeftWidth: 1,
    borderLeftColor: '#FF4757',
    borderRightWidth: 1,
    borderRightColor: '#FF4757',
    borderBottomWidth: 1,
    borderBottomColor: '#FF4757',
    elevation: 10,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 5},
    shadowOpacity: 0.2,
    shadowRadius: 10,
    overflow: 'hidden',
    minHeight: 350,
  },
  formContainer: {
    width: '100%',
    flex: 1,
    paddingHorizontal: 25,
    paddingVertical: 30,
    justifyContent: 'center',
  },
  inputWrapper: {
    marginBottom: 25,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 15,
    paddingHorizontal: 20,
    paddingVertical: 5,
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 3},
    shadowOpacity: 0.2,
    shadowRadius: 6,
  },
  inputIcon: {
    marginRight: 12,
  },
  input: {
    flex: 1,
    fontSize: 16,
    paddingVertical: 15,
    color: '#333',
    fontWeight: '500',
  },
  errorContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 8,
    marginLeft: 5,
  },
  errorText: {
    color: '#FF6B6B',
    fontSize: 14,
    marginLeft: 6,
    fontWeight: '500',
  },
  loginButton: {
    backgroundColor: '#fff',
    borderRadius: 15,
    paddingVertical: 18,
    marginTop: 10,
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 4},
    shadowOpacity: 0.3,
    shadowRadius: 8,
  },
  buttonDisabled: {
    opacity: 0.6,
  },
  buttonContent: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  buttonLabel: {
    fontWeight: 'bold',
    fontSize: 18,
    color: '#2401fe',
    marginRight: 12,
  },
  arrowCircle: {
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: '#2401fe',
    justifyContent: 'center',
    alignItems: 'center',
  },
  infoContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginTop: 25,
    marginBottom: 15,
  },
  infoItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  infoText: {
    fontSize: 12,
    color: 'rgba(255,255,255,0.8)',
    marginLeft: 6,
    fontWeight: '500',
  },
  termsText: {
    textAlign: 'center',
    marginTop: 15,
    fontSize: 12,
    color: 'rgba(255,255,255,0.7)',
    lineHeight: 18,
  },
  termsLink: {
    color: '#fff',
    fontWeight: 'bold',
    textDecorationLine: 'underline',
  },
});

export default Login;