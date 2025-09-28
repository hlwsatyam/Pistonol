import React, { useState, useRef } from 'react';
import {
  View,
  StyleSheet,
  Image,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  TouchableOpacity,
  Text,
  TextInput,
  SafeAreaView,
} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import ThemeWithBg from '../../Skeleton/ThemeWithBg';
import { color, Logo, themeColor } from '../../locale/Locale';

const MakePasswordScreen = ({ navigation, route }) => {
  const { mobile = 'ss' } = route.params;
  const [password, setPassword] = useState(['', '', '', '']);
  const [error, setError] = useState('');

  const passwordInputsRef = useRef([]);

  const handlePasswordChange = (index, value) => {
    const newPass = [...password];
    newPass[index] = value;
    setPassword(newPass);
    if (value && index < 3) {
      passwordInputsRef.current[index + 1]?.focus();
    }
  };

  const validateForm = () => {
    if (password.join('').length !== 4) {
      setError('Please enter complete 4-digit password');
      return false;
    }
    setError('');
    return true;
  };

  const handleSubmit = () => {
    if (validateForm()) {
      console.log('Password set:', password.join(''));
      navigation.navigate('HomeForCustomer');
    }
  };

  const handleBack = () => navigation.goBack();

  return (
    <ThemeWithBg>
      <SafeAreaView style={styles.container}>
        {/* Top Fixed Back Icon */}
        <TouchableOpacity style={styles.backButton} onPress={handleBack}>
          <Icon name="close" size={24} color="#333" />
        </TouchableOpacity>

        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          style={{ flex: 1 }}>
          <ScrollView
            contentContainerStyle={styles.scrollContainer}
            keyboardShouldPersistTaps="handled">
            <View style={styles.logoContainer}>
              <Image source={Logo} style={styles.logo} resizeMode="contain" />
            </View>

            <View style={styles.form}>
              <Text style={styles.title}>Set Your Password</Text>
              <Text style={styles.subtitle}>
                Create a secure 4-digit password for login
              </Text>

              <Text style={styles.inputLabel}>Enter 4-Digit Password</Text>
              <View style={styles.inputRow}>
                {password.map((digit, index) => (
                  <TextInput
                    key={`pass-${index}`}
                    ref={ref => (passwordInputsRef.current[index] = ref)}
                    style={styles.digitInput}
                    keyboardType="number-pad"
                    maxLength={1}
                    secureTextEntry
                    value={digit}
                    onChangeText={value => handlePasswordChange(index, value)}
                  />
                ))}
              </View>
              {error ? <Text style={styles.error}>{error}</Text> : null}

              <Text style={styles.note}>
                Note: This password will be required every time you log in. Please keep it safe.
              </Text>

              <LinearGradient
                colors={themeColor}
                style={styles.gradientButton}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}>
                <TouchableOpacity onPress={handleSubmit} style={styles.button}>
                  <Text style={styles.buttonText}>Set Password</Text>
                </TouchableOpacity>
              </LinearGradient>
            </View>
          </ScrollView>
        </KeyboardAvoidingView>
      </SafeAreaView>
    </ThemeWithBg>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  backButton: {
    position: 'absolute',
    top: 15,
    left: 15,
    zIndex: 10,
    backgroundColor: '#fff',
    padding: 8,
    borderRadius: 20,
    elevation: 4,
  },
  scrollContainer: {
    flexGrow: 1,
    padding: 20,
    paddingTop: 60,
  },
  logoContainer: {
    alignItems: 'center',
    marginBottom: 30,
  },
  logo: {
    width: 120,
    height: 120,
  },
  form: {
    width: '100%',
    marginTop: 10,
  },
  title: {
    fontSize: 22,
    fontWeight: 'bold',
     color: color,
    textAlign: 'center',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 14,
     color: color,
    textAlign: 'center',
    marginBottom: 30,
  },
  inputLabel: {
    marginBottom: 8,
    fontWeight: '600',
 color: color,
    fontSize: 14,
  },
  inputRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 10,
    marginBottom: 10,
  },
  digitInput: {
    borderBottomWidth: 2,
    borderColor: themeColor[0],
    fontSize: 24,
    width: 50,
    textAlign: 'center',
   color: color,
    paddingBottom: 4,
  },
  error: {
   color: color,
    fontSize: 13,
    marginTop: 4,
    marginBottom: 10,
    textAlign: 'center',
  },
  note: {
    fontSize: 13,
    color: color,
    textAlign: 'center',
    marginVertical: 15,
  },
  gradientButton: {
    borderRadius: 6,
    overflow: 'hidden',
    marginTop: 10,
  },
  button: {
    paddingVertical: 12,
    alignItems: 'center',
  },
  buttonText: {
    color: color,
    fontWeight: 'bold',
    fontSize: 16,
  },
});

export default MakePasswordScreen;
