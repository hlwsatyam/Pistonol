import React, {useState} from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Animated,
  ScrollView,
  Linking,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import Icon2 from 'react-native-vector-icons/FontAwesome';
import {useNavigation} from '@react-navigation/native';
import Collapsible from 'react-native-collapsible';
import ThemeWithBg from '../../Skeleton/ThemeWithBg';

const HelpSupportScreen = () => {
  const navigation = useNavigation();
  const [activeSection, setActiveSection] = useState(null);
  const [rating, setRating] = useState(0);

  const handleBack = () => navigation.goBack();

  const toggleSection = section => {
    setActiveSection(activeSection === section ? null : section);
  };

  const faqs = [
    {
      question: 'How do I place an order?',
      answer:
        'Go to Products section, select your oil type, choose quantity and proceed to checkout.',
    },
    {
      question: 'What payment methods are accepted?',
      answer:
        'We accept credit/debit cards, UPI, net banking, and cash on delivery (for select areas).',
    },
    {
      question: 'How can I track my order?',
      answer:
        "Go to Orders section and click on your order number. You'll see real-time tracking information.",
    },
    {
      question: "What's your return policy?",
      answer:
        'Unopened products can be returned within 7 days of delivery. Contact customer support for assistance.',
    },
  ];

  const contactMethods = [
    {
      icon: 'phone',
      title: 'Call Us',
      detail: '+91 9876543210',
      action: () => Linking.openURL('tel:+919876543210'),
    },
    {
      icon: 'email',
      title: 'Email Us',
      detail: 'support@pistonoil.com',
      action: () => Linking.openURL('mailto:support@pistonoil.com'),
    },
    {
      icon: 'chat',
      title: 'Live Chat',
      detail: 'Available 9AM-6PM (Mon-Sat)',
      action: () => navigation.navigate('LiveChat'),
    },
    {
      icon: 'location-on',
      title: 'Visit Office',
      detail: 'Pistonoil HQ, Industrial Area, Mumbai',
      action: () =>
        Linking.openURL('https://maps.google.com/?q=Pistonoil+Mumbai'),
    },
  ];

  return (
    <ThemeWithBg>
      <View style={styles.container}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={handleBack} style={styles.backButton}>
            <Icon name="arrow-back" size={28} color="#333" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Help & Support</Text>
          <View style={{width: 28}} /> {/* For alignment */}
        </View>

        <ScrollView contentContainerStyle={styles.content}>
          {/* Customer Care Section */}
          <TouchableOpacity
            style={styles.sectionHeader}
            onPress={() => toggleSection('customerCare')}
            activeOpacity={0.8}>
            <Text style={styles.sectionTitle}>Customer Care</Text>
            <Icon
              name={
                activeSection === 'customerCare'
                  ? 'keyboard-arrow-up'
                  : 'keyboard-arrow-down'
              }
              size={24}
              color="#555"
            />
          </TouchableOpacity>

          <Collapsible collapsed={activeSection !== 'customerCare'}>
            <View style={styles.sectionContent}>
              {contactMethods.map((method, index) => (
                <TouchableOpacity
                  key={index}
                  style={styles.contactCard}
                  onPress={method.action}
                  activeOpacity={0.7}>
                  <View style={styles.contactIcon}>
                    <Icon name={method.icon} size={22} color="#fff" />
                  </View>
                  <View style={styles.contactText}>
                    <Text style={styles.contactTitle}>{method.title}</Text>
                    <Text style={styles.contactDetail}>{method.detail}</Text>
                  </View>
                  <Icon name="chevron-right" size={20} color="#999" />
                </TouchableOpacity>
              ))}
            </View>
          </Collapsible>

          {/* Rate Our App Section */}
          <TouchableOpacity
            style={styles.sectionHeader}
            onPress={() => toggleSection('rateApp')}
            activeOpacity={0.8}>
            <Text style={styles.sectionTitle}>Rate Our App</Text>
            <Icon
              name={
                activeSection === 'rateApp'
                  ? 'keyboard-arrow-up'
                  : 'keyboard-arrow-down'
              }
              size={24}
              color="#555"
            />
          </TouchableOpacity>

          <Collapsible collapsed={activeSection !== 'rateApp'}>
            <View style={[styles.sectionContent, styles.ratingContainer]}>
              <Text style={styles.ratingText}>
                How would you rate your experience?
              </Text>
              <View style={styles.starsContainer}>
                {[1, 2, 3, 4, 5].map(star => (
                  <TouchableOpacity key={star} onPress={() => setRating(star)}>
                    <Icon2
                      name={star <= rating ? 'star' : 'star-o'}
                      size={36}
                      color={star <= rating ? '#FFD700' : '#CCC'}
                    />
                  </TouchableOpacity>
                ))}
              </View>
              <TouchableOpacity style={styles.submitButton}>
                <Text style={styles.submitButtonText}>Submit Rating</Text>
              </TouchableOpacity>
            </View>
          </Collapsible>

          {/* FAQ Section */}
          <TouchableOpacity
            style={styles.sectionHeader}
            onPress={() => toggleSection('faq')}
            activeOpacity={0.8}>
            <Text style={styles.sectionTitle}>FAQs</Text>
            <Icon
              name={
                activeSection === 'faq'
                  ? 'keyboard-arrow-up'
                  : 'keyboard-arrow-down'
              }
              size={24}
              color="#555"
            />
          </TouchableOpacity>

          <Collapsible collapsed={activeSection !== 'faq'}>
            <View style={styles.sectionContent}>
              {faqs.map((item, index) => (
                <View key={index} style={styles.faqItem}>
                  <Text style={styles.faqQuestion}>Q: {item.question}</Text>
                  <Text style={styles.faqAnswer}>A: {item.answer}</Text>
                  {index < faqs.length - 1 && <View style={styles.divider} />}
                </View>
              ))}
            </View>
          </Collapsible>

          {/* User Manual Section */}
          <TouchableOpacity
            style={styles.sectionHeader}
            onPress={() => toggleSection('userManual')}
            activeOpacity={0.8}>
            <Text style={styles.sectionTitle}>User Manual</Text>
            <Icon
              name={
                activeSection === 'userManual'
                  ? 'keyboard-arrow-up'
                  : 'keyboard-arrow-down'
              }
              size={24}
              color="#555"
            />
          </TouchableOpacity>

          <Collapsible collapsed={activeSection !== 'userManual'}>
            <View style={styles.sectionContent}>
              <TouchableOpacity style={styles.manualItem}>
                <Icon name="picture-as-pdf" size={24} color="#E53935" />
                <Text style={styles.manualText}>Product Catalog 2023</Text>
                <Icon name="download" size={24} color="#6200EE" />
              </TouchableOpacity>

              <View style={styles.divider} />

              <TouchableOpacity style={styles.manualItem}>
                <Icon name="video-library" size={24} color="#3949AB" />
                <Text style={styles.manualText}>
                  How to Use Pistonoil Products
                </Text>
                <Icon name="play-arrow" size={24} color="#6200EE" />
              </TouchableOpacity>
              <View style={styles.divider} />
              <TouchableOpacity style={styles.manualItem}>
                <Icon name="description" size={24} color="#43A047" />
                <Text style={styles.manualText}>Safety Guidelines</Text>
                <Icon name="open-in-new" size={24} color="#6200EE" />
              </TouchableOpacity>
            </View>
          </Collapsible>
        </ScrollView>
      </View>
    </ThemeWithBg>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 5,
    backgroundColor: 'white',
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  backButton: {
    marginRight: 15,
  },
  headerTitle: {
    fontSize: 15,
    fontWeight: 'bold',
    color: '#333',
    flex: 1,
  },
  content: {
    paddingBottom: 30,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 15,
    backgroundColor: 'white',
    marginTop: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
  },
  sectionContent: {
    backgroundColor: '#fff',
    paddingHorizontal: 15,
  },
  contactCard: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 15,
  },
  contactIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#6200EE',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 15,
  },
  contactText: {
    flex: 1,
  },
  contactTitle: {
    fontSize: 16,
    fontWeight: '500',
    color: '#333',
  },
  contactDetail: {
    fontSize: 14,
    color: '#666',
    marginTop: 3,
  },
  ratingContainer: {
    alignItems: 'center',
    paddingVertical: 20,
  },
  ratingText: {
    fontSize: 16,
    marginBottom: 20,
    color: '#555',
  },
  starsContainer: {
    flexDirection: 'row',
    marginBottom: 20,
  },
  submitButton: {
    backgroundColor: '#6200EE',
    paddingVertical: 12,
    paddingHorizontal: 30,
    borderRadius: 25,
  },
  submitButtonText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 16,
  },
  faqItem: {
    paddingVertical: 15,
  },
  faqQuestion: {
    fontSize: 16,
    fontWeight: '500',
    color: '#333',
    marginBottom: 8,
  },
  faqAnswer: {
    fontSize: 14,
    color: '#666',
    lineHeight: 20,
  },
  divider: {
    height: 1,
    backgroundColor: '#eee',
    marginVertical: 5,
  },
  manualItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 15,
  },
  manualText: {
    flex: 1,
    fontSize: 15,
    color: '#333',
    marginLeft: 15,
  },
});

export default HelpSupportScreen;
