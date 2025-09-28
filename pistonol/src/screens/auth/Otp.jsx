import AsyncStorage from '@react-native-async-storage/async-storage';
import React, {useState, useRef} from 'react';
import {
  View,
  StyleSheet,
  Image,
  KeyboardAvoidingView,
  Platform,
  TouchableOpacity,
  TextInput,
  ToastAndroid,
} from 'react-native';
import {Button, Text, Card} from 'react-native-paper';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import LinearGradient from 'react-native-linear-gradient';
import ThemeWithBg from '../../Skeleton/ThemeWithBg';
import {Logo, color, themeColor} from '../../locale/Locale';
import {sendOtp, verifyOtp} from '../../hooks/auth';

const OtpScreen = ({navigation, route}) => {
  const {mobile , conf     } = route.params;
  const [otp, setOtp] = useState('');
  const [forwordId, setForwordId] = useState('');
  const [errors, setErrors] = useState({otp: ''});

  const otpInputRef = useRef(null);

  const handleOtpChange = text => {
    setOtp(text.replace(/[^0-9]/g, '').slice(0, 6));
  };

  const handleForwordChange = text => {
    setForwordId(text);
  };

  const {mutate: resendOtp, isPending: isSendingOtp} = sendOtp();
  const {mutate: verifyOtpMutation} = verifyOtp();
 const [isVerifyingOtp, setIsLoading] = useState(false);
  const handleSubmit = async() => {
    setIsLoading(true)
    if (otp.length !== 6) {
      setErrors({otp: 'Please enter complete 6 digit OTP'});
      setIsLoading(false)
      return;
    }




    try {
      await conf.confirm(otp);
     ToastAndroid.show('OTP verified!! successfully!', ToastAndroid.SHORT);
    } catch (error) {
      setIsLoading(false)
      return ToastAndroid.show(error.message, ToastAndroid.SHORT);
    }






    verifyOtpMutation(
      {mobile, otp, forwordId},
      {
        onSuccess: async data => {
          console.log( data)
          setIsLoading(false)
          ToastAndroid.show('OTP verified successfully!', ToastAndroid.SHORT);
          try {
            await AsyncStorage.setItem('user', JSON.stringify(data?.user));
          } catch (e) {
            console.error('Failed to save user in storage', e);
          }
          if (data?.user?.role === 'customer') {
            navigation.reset({
              index: 0,
              routes: [{name: 'HomeForCustomer'}],
            });
          }
          if (data?.user?.role === 'company-employee') {
            navigation.reset({
              index: 0,
              routes: [{name: 'HomeForEmployee'}],
            });
          }
          if (data?.user?.role === 'distributor') {
            navigation.reset({
              index: 0,
              routes: [{name: 'HomeForDistributor'}],
            });
          }
        },
        onError: error => {
          console.log( error)
          setIsLoading(false)
          const message =
            error?.response?.data?.message   ||error?.message   || 'OTP verification failed!';
          ToastAndroid.show(message, ToastAndroid.SHORT);
        },
      },
    );
  };

  const handleResendOtp = () => {
    // resendOtp(mobile, {
    //   onSuccess: () => {
        ToastAndroid.show('OTP sent successfully!', ToastAndroid.SHORT);
    //   },
    //   onError: error => {
    //     const message =
    //       error?.response?.data?.message || 'Something went wrong!';
    //     ToastAndroid.show(message, ToastAndroid.SHORT);
    //   },
    // });
  };

  return (
    <ThemeWithBg>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.container}>
        <View style={styles.innerContainer}>
          {/* Fixed Back Button */}
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => navigation.goBack()}>
            <Icon name="arrow-left" size={24} color={color} />
          </TouchableOpacity>

          {/* Logo */}
          <View style={styles.logoContainer}>
            <Image source={Logo} style={styles.logo} resizeMode="contain" />
          </View>

          {/* OTP Card */}
          <View style={styles.bottomCardWrapper}>
            <Card style={styles.formCard}>
              <Card.Content>
                <Text style={[styles.title, {color}]}>Enter OTP</Text>
                <Text style={[styles.subtitle, {color}]}>
                  OTP sent to +91{mobile}
                </Text>

                {/* OTP Input */}
                <View style={styles.inputContainer}>
                  <TextInput
                    ref={otpInputRef}
                    value={otp}
                    onChangeText={handleOtpChange}
                    keyboardType="number-pad"
                    maxLength={6}
                    placeholder="Enter 6 digit OTP"
                    placeholderTextColor={color}
                    style={[styles.otpInput, {color, borderBottomColor: color}]}
                    selectionColor={color}
                  />
                </View>

                {errors.otp && (
                  <Text style={[styles.errorText, {color}]}>{errors.otp}</Text>
                )}

                {/* Forward Code Input */}
                <TextInput
                  value={forwordId}
                  onChangeText={handleForwordChange}
                  keyboardType="default"
                   
                  placeholder="CODE (Optional)"
                  placeholderTextColor={color}
                  style={[styles.otpInput, {color, borderBottomColor: color}]}
                  selectionColor={color}
                />

                {/* Submit Button */}
                <LinearGradient
                  colors={themeColor}
                  style={styles.gradientButton}
                  start={{x: 0, y: 0}}
                  end={{x: 1, y: 0}}>
                  <Button
                    mode="contained"
                    onPress={handleSubmit}
                    loading={isVerifyingOtp}
                    disabled={isVerifyingOtp || otp.length < 6}
                    style={styles.button}
                    labelStyle={styles.buttonLabel}
                    theme={{colors: {primary: 'transparent'}}}>
                    {isVerifyingOtp ? 'Verifying...' : 'Verify OTP'}
                  </Button>
                </LinearGradient>

                {/* Resend Link */}
                {/* <View style={styles.resendContainer}>
                  <Text style={[styles.resendText, {color}]}>
                    Didn't receive OTP?
                  </Text>
                  <TouchableOpacity
                    onPress={handleResendOtp}
                    disabled={isSendingOtp}>
                    <Text style={[styles.resendLink, {color}]}>
                      {isSendingOtp ? 'Sending...' : 'Resend OTP'}
                    </Text>
                  </TouchableOpacity>
                </View> */}
              </Card.Content>
            </Card>
          </View>
        </View>
      </KeyboardAvoidingView>
    </ThemeWithBg>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  innerContainer: {
    flex: 1,
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: 50,
  },
  backButton: {
    position: 'absolute',
    left: 10,
    zIndex: 10,
    backgroundColor: '#ffffff30',
    padding: 8,
    borderRadius: 20,
  },
  logoContainer: {
    alignItems: 'center',
    marginTop: 60,
    marginBottom: 20,
  },
  logo: {
    width: 180,
    height: 180,
  },
  bottomCardWrapper: {
    marginBottom: 20,
  },
  formCard: {
    backgroundColor: 'transparent',
    shadowColor: 'transparent',
    padding: 10,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 10,
  },
  subtitle: {
    textAlign: 'center',
    marginBottom: 30,
  },
  inputContainer: {
    marginBottom: 4,
  },
  otpInput: {
    fontSize: 14,
    paddingVertical: 1,
    borderBottomWidth: 1,
    textAlign: 'left',
    backgroundColor: 'transparent',
    marginBottom: 20,
  },
  errorText: {
    textAlign: 'left',
    marginBottom: 30,
  },
  gradientButton: {
    borderRadius: 5,
    marginTop: 20,
    overflow: 'hidden',
  },
  button: {
    backgroundColor: 'transparent',
  },
  buttonLabel: {
    color: 'white',
    fontWeight: 'bold',
  },
  resendContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 20,
  },
  resendText: {
    marginRight: 5,
  },
  resendLink: {
    fontWeight: 'bold',
    textDecorationLine: 'underline',
  },
});

export default OtpScreen;
