import React from 'react';
import { 
  View, 
  Text, 
  TouchableOpacity, 
  StyleSheet, 
  ScrollView, 
  Alert, 
  Linking, 
  Platform 
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function PistonolContactSupportScreen({ navigation }) {
  const supportEmail = 'customercare@pistonol.com';
  const supportPhone = '+919122926523';
  const whatsappNumber = '919122926523';
  const address = 'Pistonol Lubetech Pvt. Ltd., Rajkot, Gujarat, India';

  const handleBack = () => navigation?.goBack?.();

  const openDialer = () => Linking.openURL(`tel:${supportPhone}`).catch(() => Alert.alert('Error', 'Unable to open dialer'));
  const openEmail = () => Linking.openURL(`mailto:${supportEmail}`).catch(() => Alert.alert('Error', 'Unable to open mail app'));
  const openWhatsApp = () => Linking.openURL(`https://wa.me/${whatsappNumber}`).catch(() => Alert.alert('Error', 'Unable to open WhatsApp'));
  const openWebsite = () => Linking.openURL('https://pistonol.com').catch(() => {});
  const openMaps = () => {
    const query = encodeURIComponent(address);
    const url = Platform.select({
      ios: `maps:0,0?q=${query}`,
      android: `geo:0,0?q=${query}`,
    });
    Linking.openURL(url).catch(() => Linking.openURL(`https://www.google.com/maps/search/?api=1&query=${query}`));
  };

  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.header}>
        <TouchableOpacity onPress={handleBack} style={styles.backBtn} accessibilityLabel="Back">
          <Text style={styles.backText}>{'<'} Back</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Contact Support</Text>
        <View style={{ width: 60 }} />
      </View>

      <ScrollView contentContainerStyle={styles.container}>
        <Text style={styles.brand}>Pistonol Support</Text>
        
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Quick Actions</Text>
          
          <TouchableOpacity style={styles.actionRow} onPress={openDialer}>
            <Text style={styles.actionText}>Help Line</Text>
            <Text style={styles.actionSub}>{supportPhone}</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.actionRow} onPress={openWhatsApp}>
            <Text style={styles.actionText}>Chat on WhatsApp</Text>
            <Text style={styles.actionSub}>Open WhatsApp</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.actionRow} onPress={openEmail}>
            <Text style={styles.actionText}>Email Support</Text>
            <Text style={styles.actionSub}>{supportEmail}</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.actionRow} onPress={openWebsite}>
            <Text style={styles.actionText}>Official Website</Text>
            <Text style={styles.actionSub}>https://pistonol.com</Text>
          </TouchableOpacity>


        </View>

        <View style={styles.infoCard}>
          <Text style={styles.infoTitle}>Contact Information</Text>
          <Text style={styles.infoText}>Email: {supportEmail}</Text>
          <Text style={styles.infoText}>Phone: {supportPhone}</Text>
          <Text style={styles.infoText}>Address: {address}</Text>
          <Text style={styles.note}>Working hours: Mon–Fri 08:30–18:30</Text>
        </View>

        <View style={{ height: 40 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { 
    flex: 1, 
    backgroundColor: '#fff' 
  },
  header: { 
    height: 56, 
    flexDirection: 'row', 
    alignItems: 'center', 
    justifyContent: 'space-between', 
    paddingHorizontal: 12, 
    borderBottomWidth: StyleSheet.hairlineWidth, 
    borderBottomColor: '#ddd' 
  },
  backBtn: { 
    width: 60, 
    justifyContent: 'center' 
  },
  backText: { 
    fontSize: 16, 
    color: '#007aff' 
  },
  headerTitle: { 
    fontSize: 16, 
    fontWeight: '600' 
  },
  container: { 
    padding: 16 
  },
  brand: { 
    fontSize: 18, 
    fontWeight: '700', 
    marginBottom: 12 
  },
  card: { 
    backgroundColor: '#fafafa', 
    padding: 12, 
    borderRadius: 10, 
    marginBottom: 12, 
    shadowColor: '#000', 
    shadowOpacity: 0.03, 
    shadowRadius: 6, 
    elevation: 1 
  },
  infoCard: {
    backgroundColor: '#f0f8ff',
    padding: 16,
    borderRadius: 10,
    marginBottom: 12,
    borderLeftWidth: 4,
    borderLeftColor: '#007aff'
  },
  cardTitle: { 
    fontSize: 16, 
    fontWeight: '600', 
    marginBottom: 8 
  },
  infoTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 12,
    color: '#007aff'
  },
  actionRow: { 
    paddingVertical: 12, 
    borderTopWidth: 1, 
    borderTopColor: '#eee' 
  },
  actionText: { 
    fontSize: 15, 
    fontWeight: '600' 
  },
  actionSub: { 
    fontSize: 13, 
    color: '#666', 
    marginTop: 4 
  },
  infoText: {
    fontSize: 14,
    color: '#333',
    marginBottom: 8
  },
  note: { 
    fontSize: 12, 
    color: '#666', 
    marginTop: 10 
  }
});