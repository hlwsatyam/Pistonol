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
import LinearGradient from 'react-native-linear-gradient';
import ThemeWithBg from '../../Skeleton/ThemeWithBg';
import {
  color,
  endDirectionTheme,
  Logo,
  startDirectionTheme,
  themeColor,
} from '../../locale/Locale';
import {sendOtp} from '../../hooks/auth';

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
          keyboardShouldPersistTaps="handled">
          <View style={styles.logoContainer}>
            <Image source={Logo} style={styles.logo} resizeMode="contain" />
          </View>

          <View style={styles.formCard}>
            <Text style={[styles.title, {color}]}>Login</Text>

            <View style={styles.inputContainer}>
              <Icon
                name="phone"
                color={color}
                size={20}
                style={styles.inputIcon}
              />
              <TextInput
                placeholder="Mobile Number"
                placeholderTextColor={color}
                value={mobile}
                onChangeText={setMobile}
                keyboardType="phone-pad"
                maxLength={10}
                style={[styles.input, {color, borderBottomColor: color}]}
                selectionColor={color}
              />
            </View>

            {errors.mobile ? (
              <Text style={[styles.errorText, {color}]}>{errors.mobile}</Text>
            ) : null}

            <LinearGradient
              colors={themeColor}
              style={styles.gradientButton}
              start={startDirectionTheme}
              end={endDirectionTheme}>
              <TouchableOpacity
                style={styles.button}
                onPress={handleSubmit}
                disabled={isLoading}>
                {isLoading ? (
                  <ActivityIndicator color="#fff" />
                ) : (
                  <Text style={[styles.buttonLabel, {color: 'white'}]}>
                    Login
                  </Text>
                )}
              </TouchableOpacity>
            </LinearGradient>
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
    padding: 20,
  },
  logoContainer: {
    alignItems: 'center',
    marginBottom: 20,
    marginTop: 40,
  },
  logo: {
    width: 200,
    height: 200,
  },
  formCard: {
    backgroundColor: 'transparent',
    width: '100%',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 30,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 15,
    borderBottomWidth: 1,
    borderBottomColor: color,
  },
  inputIcon: {
    marginRight: 10,
  },
  input: {
    flex: 1,
    fontSize: 16,
    paddingVertical: 12,
    backgroundColor: 'transparent',
  },
  errorText: {
    marginBottom: 15,
    marginLeft: 5,
  },
  gradientButton: {
    borderRadius: 5,
    marginTop: 20,
    overflow: 'hidden',
  },
  button: {
    paddingVertical: 15,
    alignItems: 'center',
  },
  buttonLabel: {
    fontWeight: 'bold',
    fontSize: 16,
  },
});

export default Login;
