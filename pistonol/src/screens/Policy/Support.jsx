import React, { useState } from 'react';
import { SafeAreaView, View, Text, TextInput, TouchableOpacity, StyleSheet, ScrollView, Alert, Linking, KeyboardAvoidingView, Platform } from 'react-native';

// Usage: Register this screen in your navigator (React Navigation)
// <Stack.Screen name="ContactSupport" component={PistonolContactSupportScreen} />

export default function PistonolContactSupportScreen({ navigation }) {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [message, setMessage] = useState('');
  const supportEmail = 'info@pistonol.com';
  const supportPhone = '+919122926523';
  const whatsappNumber = '919122926523'; // international format without '+' for wa.me
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

  const handleSubmit = () => {
    if (!name.trim() || !message.trim()) {
      return Alert.alert('Validation', 'Please enter your name and a message.');
    }

    // Example: send to your backend API endpoint
    // fetch('https://your-backend.example.com/support', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ name, email, phone, message }) })
    //   .then(r => r.ok ? Alert.alert('Thanks', 'Support request sent') : Alert.alert('Error'))
    //   .catch(() => Alert.alert('Error', 'Unable to send request'));

    // For now we'll just open the email composer with prefilled content
    const mailto = `mailto:${supportEmail}?subject=${encodeURIComponent('App Support Request')}&body=${encodeURIComponent(`Name: ${name}\nPhone: ${phone}\nEmail: ${email}\n\nMessage:\n${message}`)}`;
    Linking.openURL(mailto).catch(() => Alert.alert('Error', 'Unable to open mail app'));
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

      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={{ flex: 1 }}>
        <ScrollView contentContainerStyle={styles.container} keyboardShouldPersistTaps='handled'>
          <Text style={styles.brand}>Pistonol Support</Text>

          <View style={styles.card}>
            <Text style={styles.cardTitle}>Quick Actions</Text>
            <TouchableOpacity style={styles.actionRow} onPress={openDialer}>
              <Text style={styles.actionText}>Call Support</Text>
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
              <Text style={styles.actionText}>Visit Website</Text>
              <Text style={styles.actionSub}>pistonol.com</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.actionRow} onPress={openMaps}>
              <Text style={styles.actionText}>Locate Office</Text>
              <Text style={styles.actionSub}>{address}</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.card}>
            <Text style={styles.cardTitle}>Send Us a Message</Text>
            <TextInput placeholder="Your name *" value={name} onChangeText={setName} style={styles.input} />
            <TextInput placeholder="Email" value={email} onChangeText={setEmail} keyboardType="email-address" style={styles.input} />
            <TextInput placeholder="Phone" value={phone} onChangeText={setPhone} keyboardType="phone-pad" style={styles.input} />
            <TextInput placeholder="Message *" value={message} onChangeText={setMessage} multiline numberOfLines={4} style={[styles.input, { height: 110 }]} />

            <TouchableOpacity style={styles.submitBtn} onPress={handleSubmit}>
              <Text style={styles.submitText}>Send Message</Text>
            </TouchableOpacity>

            <Text style={styles.note}>Working hours: Mon–Fri 08:30–18:30. We aim to respond within 1–2 business days.</Text>
          </View>

          <View style={{ height: 40 }} />
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: '#fff' },
  header: { height: 56, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 12, borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: '#ddd' },
  backBtn: { width: 60, justifyContent: 'center' },
  backText: { fontSize: 16, color: '#007aff' },
  headerTitle: { fontSize: 16, fontWeight: '600' },
  container: { padding: 16 },
  brand: { fontSize: 18, fontWeight: '700', marginBottom: 12 },
  card: { backgroundColor: '#fafafa', padding: 12, borderRadius: 10, marginBottom: 12, shadowColor: '#000', shadowOpacity: 0.03, shadowRadius: 6, elevation: 1 },
  cardTitle: { fontSize: 14, fontWeight: '600', marginBottom: 8 },
  actionRow: { paddingVertical: 10, borderTopWidth: 1, borderTopColor: '#eee' },
  actionText: { fontSize: 15, fontWeight: '600' },
  actionSub: { fontSize: 13, color: '#666', marginTop: 4 },
  input: { backgroundColor: '#fff', borderWidth: 1, borderColor: '#e6e6e6', borderRadius: 8, padding: 10, marginTop: 8 },
  submitBtn: { backgroundColor: '#007aff', paddingVertical: 12, borderRadius: 8, marginTop: 12, alignItems: 'center' },
  submitText: { color: '#fff', fontWeight: '700' },
  note: { fontSize: 12, color: '#666', marginTop: 10 }
});
