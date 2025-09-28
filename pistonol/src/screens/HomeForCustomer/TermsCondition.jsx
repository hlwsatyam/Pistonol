import React from 'react';
import {
  ScrollView,
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  SafeAreaView,
  StatusBar,
} from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import ThemeWithBg from '../../Skeleton/ThemeWithBg';
import {color} from '../../locale/Locale';

const TermsAndConditionsScreen = ({navigation}) => {
  return (
    <ThemeWithBg>
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color="#2c3e50" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Terms & Conditions</Text>
        <View style={{width: 24}} />
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        <Text style={styles.title}>
          Pistonol Lubricant PBT Ltd - Terms of Service
        </Text>
        <Text style={styles.effectiveDate}>
          Effective Date: January 1, 2023
        </Text>

        <Text style={styles.sectionTitle}>1. Acceptance of Terms</Text>
        <Text style={styles.paragraph}>
          By accessing or using any products, services, or websites provided by
          Pistonol Lubricant PBT Ltd ("Company"), you agree to be bound by these
          Terms and Conditions. If you do not agree, please discontinue use
          immediately.
        </Text>

        <Text style={styles.sectionTitle}>2. Product Usage</Text>
        <Text style={styles.paragraph}>
          Our lubricants are engineered for specific applications. Misuse may
          cause equipment damage. Always consult product specifications and
          safety data sheets before use. The Company is not liable for improper
          application.
        </Text>

        <Text style={styles.sectionTitle}>3. Intellectual Property</Text>
        <Text style={styles.paragraph}>
          All trademarks, formulas, and proprietary technologies ("Pistonol,"
          "PBT Formula") are owned exclusively by Pistonol Lubricant PBT Ltd.
          Unauthorized reproduction or reverse engineering is strictly
          prohibited.
        </Text>

        <Text style={styles.sectionTitle}>4. Limitation of Liability</Text>
        <Text style={styles.paragraph}>
          In no event shall Pistonol Lubricant PBT Ltd be liable for
          consequential damages exceeding the product's purchase price. This
          includes but is not limited to equipment failure, downtime, or lost
          profits.
        </Text>

        <Text style={styles.sectionTitle}>5. Governing Law</Text>
        <Text style={styles.paragraph}>
          These Terms shall be governed by the laws of [Your Country/State]. Any
          disputes shall be resolved in the courts of [Jurisdiction City].
        </Text>

        <Text style={styles.sectionTitle}>6. Amendments</Text>
        <Text style={styles.paragraph}>
          We reserve the right to modify these Terms at any time. Continued use
          after changes constitutes acceptance of the revised Terms.
        </Text>

        <Text style={styles.contact}>
          For questions: {'\n'}
          Email: legal@pistonolpbt.com {'\n'}
          Phone: +1 (800) 555-0199 {'\n'}
          Address: 123 Industrial Park, Lubricant City, LC 12345
        </Text>
      </ScrollView>
    </ThemeWithBg>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f8f8',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',

    padding: 5,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
    backgroundColor: 'white',
  },
  backButton: {
    padding: 5,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#2c3e50',
  },
  content: {
    padding: 20,
    paddingBottom: 40,
  },
  title: {
    fontSize: 22,
    fontWeight: '700',
    color: 'blue',
    marginBottom: 5,
    textAlign: 'center',
  },
  effectiveDate: {
    fontSize: 14,
    color: 'blue',
    textAlign: 'center',
    marginBottom: 25,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: color,
    marginTop: 15,
    marginBottom: 8,
  },
  paragraph: {
    fontSize: 15,
    lineHeight: 22,
    color: color,
    marginBottom: 12,
  },
  contact: {
    marginTop: 30,
    fontSize: 14,
    lineHeight: 20,
    color: color,
    textAlign: 'center',
    fontStyle: 'italic',
  },
});

export default TermsAndConditionsScreen;
