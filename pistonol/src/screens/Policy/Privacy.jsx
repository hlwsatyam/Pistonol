import React from 'react';
import {
  ScrollView,
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Linking,
  Alert,
 
} from 'react-native';
import { HeaderBackButton } from '@react-navigation/elements';
import { useNavigation } from '@react-navigation/native';
import { SafeAreaView } from 'react-native-safe-area-context';
import CustomBackButton from '../../components/layout/CustomBackButton';

const PrivacyPolicyScreen = () => {
  const navigation = useNavigation();

  // Custom back button handler
  const handleBackPress = () => {
    // You can add custom logic here before going back
    Alert.alert(
      'Confirm',
      'Are you sure you want to go back?',
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'Yes',
          onPress: () => navigation.goBack(),
        },
      ]
    );
  };

  // Set navigation options
  React.useLayoutEffect(() => {
    navigation.setOptions({
      headerLeft: (props) => (
        <HeaderBackButton
          {...props}
          onPress={handleBackPress}
          tintColor="#000" // Custom color
          label="Back" // Custom label
        />
      ),
    });
  }, [navigation]);

  const openWebsite = () => {
    Linking.openURL('https://pistonol.com');
  };

  const sendEmail = () => {
    Linking.openURL('mailto:info@pistonol.com');
  };

  const makeCall = () => {
    Linking.openURL('tel:+919122926523');
  };

  return (
    <SafeAreaView  style={{flex:1}}  >
<CustomBackButton/>

         <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      <Text style={styles.title}>PISTONOL PRIVACY POLICY</Text>
      <Text style={styles.effectiveDate}>Effective date: November 2, 2025</Text>

      <Text style={styles.paragraph}>
        Pistonol Lubetech Pvt. Ltd. ("Pistonol", "we", "us", "our") operates the Pistonol website and the Pistonol mobile application (together, the "Services"). This Privacy Policy explains how we collect, use, disclose, and protect information when you use our Services.
      </Text>

      <Text style={styles.sectionHeader}>1. Information We Collect</Text>
      
      <Text style={styles.subHeader}>a. Information you provide directly</Text>
      <Text style={styles.paragraph}>
        • Contact information (name, email, phone) when you contact us, register for an account, submit distributor enquiries, or use contact forms.{"\n"}
        • Any messages, enquiries, resumes (career section), or media you upload while using the Services.
      </Text>

      <Text style={styles.subHeader}>b. Automatically collected information</Text>
      <Text style={styles.paragraph}>
        • Device and usage data such as device model, operating system, app version, IP address, and analytics events.{"\n"}
        • Performance and crash logs to help us diagnose and fix issues.
      </Text>

      <Text style={styles.subHeader}>c. Cookies, webviews and local storage</Text>
      <Text style={styles.paragraph}>
        When the app loads web pages (webview) or you visit pistonol.com, cookies and similar technologies may apply. In-app we may store preferences and tokens in secure local storage.
      </Text>

      <Text style={styles.sectionHeader}>2. How We Use Your Information</Text>
      <Text style={styles.paragraph}>
        • Provide, operate, and maintain the Services{"\n"}
        • Respond to inquiries, process distributor applications, career submissions{"\n"}
        • Send administrative messages and promotional messages (with consent){"\n"}
        • Improve and personalize the app and website experience{"\n"}
        • Maintain records for compliance and business operations
      </Text>

      <Text style={styles.sectionHeader}>3. Sharing & Disclosure</Text>
      <Text style={styles.paragraph}>
        We will not sell your personal data. We may share information with:{"\n"}
        • Service providers who perform services on our behalf{"\n"}
        • Business partners where you opt into third-party features{"\n"}
        • Legal authorities when required by law{"\n"}
        • In case of merger, sale, acquisition, or reorganization
      </Text>

      <Text style={styles.sectionHeader}>11. Contact Information</Text>
      
      <TouchableOpacity onPress={sendEmail} style={styles.contactButton}>
        <Text style={styles.contactText}>Email: info@pistonol.com</Text>
      </TouchableOpacity>

      <TouchableOpacity onPress={makeCall} style={styles.contactButton}>
        <Text style={styles.contactText}>Phone: +91-9122926523</Text>
      </TouchableOpacity>

      <TouchableOpacity onPress={openWebsite} style={styles.contactButton}>
        <Text style={styles.contactText}>Website: pistonol.com</Text>
      </TouchableOpacity>

      <Text style={styles.workingHours}>
        Working hours: Mon – Fri: 8:30 – 18:30
      </Text>

      <Text style={styles.companyInfo}>
        PISTONOL LUBETECH PVT LIMITED - blending plants located at Rajkot (Gujarat); ISO 9001:2015 and ISO 14001:2015 certifications
      </Text>

      <View style={styles.footer} />
    </ScrollView>
    </SafeAreaView>
   
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    padding: 16,
  },
  title: {
    fontSize: 22,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 8,
    color: '#333',
  },
  effectiveDate: {
    fontSize: 14,
    textAlign: 'center',
    marginBottom: 20,
    color: '#666',
    fontStyle: 'italic',
  },
  sectionHeader: {
    fontSize: 18,
    fontWeight: 'bold',
    marginTop: 16,
    marginBottom: 8,
    color: '#2c3e50',
  },
  subHeader: {
    fontSize: 16,
    fontWeight: '600',
    marginTop: 12,
    marginBottom: 4,
    color: '#34495e',
  },
  paragraph: {
    fontSize: 14,
    lineHeight: 20,
    marginBottom: 12,
    color: '#555',
  },
  contactButton: {
    backgroundColor: '#f8f9fa',
    padding: 12,
    borderRadius: 8,
    marginBottom: 8,
    borderLeftWidth: 4,
    borderLeftColor: '#3498db',
  },
  contactText: {
    fontSize: 14,
    color: '#2980b9',
    fontWeight: '500',
  },
  workingHours: {
    fontSize: 14,
    color: '#666',
    marginTop: 8,
    textAlign: 'center',
  },
  companyInfo: {
    fontSize: 12,
    color: '#777',
    marginTop: 16,
    fontStyle: 'italic',
    textAlign: 'center',
  },
  footer: {
    height: 40,
  },
});

export default PrivacyPolicyScreen;