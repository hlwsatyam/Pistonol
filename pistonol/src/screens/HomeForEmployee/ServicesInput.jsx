import React from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, ScrollView } from 'react-native';

export default function ServicesInput({ formData, handleChange }) {
  // Parse the string into array of key-value pairs
  const servicesArray = formData.servicesOffered
    ? formData.servicesOffered.split('\n').map(line => {
        const [key = '', value = ''] = line.split(':');
        return { key, value };
      })
    : [];

  const handleLineChange = (index, field, text) => {
    const updated = [...servicesArray];
    updated[index][field] = text;
    // Convert back to string inline
    const newString = updated.map(item => `${item.key}:${item.value}`).join('\n');
    handleChange('servicesOffered', newString);
  };

  const handleAdd = () => {
    const newString = [...servicesArray, { key: '', value: '' }]
      .map(item => `${item.key}:${item.value}`)
      .join('\n');
    handleChange('servicesOffered', newString);
  };

  const handleRemove = index => {
    const updated = servicesArray.filter((_, i) => i !== index);
    const newString = updated.map(item => `${item.key}:${item.value}`).join('\n');
    handleChange('servicesOffered', newString);
  };

  return (
    <View style={styles.inputGroup}>
      <Text style={styles.inputLabel}>Order Offered</Text>
      <ScrollView style={{ maxHeight: 200 }}>
        {servicesArray.map((item, index) => (
          <View key={index} style={styles.row}>
            <TextInput
              style={[styles.leadInput, styles.keyInput]}
              value={item.key}
              onChangeText={text => handleLineChange(index, 'key', text)}
              placeholder="Key"
            />
            <TextInput
              style={[styles.leadInput, styles.valueInput]}
              value={item.value}
              onChangeText={text => handleLineChange(index, 'value', text)}
              placeholder="Value"
            />
            <TouchableOpacity onPress={() => handleRemove(index)} style={styles.removeBtn}>
              <Text style={{ color: 'red', fontSize: 18 }}>−</Text>
            </TouchableOpacity>
          </View>
        ))}
      </ScrollView>
      <TouchableOpacity onPress={handleAdd} style={styles.addBtn}>
        <Text style={{ color: 'green', fontSize: 18 }}>＋ Add Service</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  inputGroup: { marginVertical: 10 },
  inputLabel: { fontSize: 16, fontWeight: 'bold', marginBottom: 5 },
  leadInput: { borderWidth: 1, borderColor: '#ccc', borderRadius: 5, padding: 8, marginBottom: 5 },
  row: { flexDirection: 'row', alignItems: 'center', marginBottom: 5 },
  keyInput: { flex: 1, marginRight: 5 },
  valueInput: { flex: 2, marginRight: 5 },
  removeBtn: { padding: 5 },
  addBtn: { marginTop: 5, alignItems: 'center' },
});
