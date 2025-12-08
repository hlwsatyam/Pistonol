// components/MonthlySaleInput.js
import React, { useState, useEffect, useRef } from 'react';
import { View, Text, TextInput, StyleSheet } from 'react-native';

const MonthlySaleInput = ({ 
  label, 
  field, 
  initialValue = '', 
  isNumeric = true,
  isDate = false,
  isSubmitted = false,
  onValueChange 
}) => {
  const [value, setValue] = useState(initialValue);
  const inputRef = useRef(null);
  
  // Parent से initial value update होने पर
  useEffect(() => {
    setValue(initialValue);
  }, [initialValue]);

  const handleChange = (text) => {
    let cleanedText = text;
    
    if (isNumeric) {
      // सिर्फ numbers और decimal point allow करें
      cleanedText = text.replace(/[^0-9.]/g, '');
      
      // एक से ज्यादा decimal point नहीं
      const parts = cleanedText.split('.');
      if (parts.length > 2) {
        cleanedText = parts[0] + '.' + parts.slice(1).join('');
      }
    }
    
    setValue(cleanedText);
    onValueChange(field, cleanedText);
  };

  const handleFocus = () => {
    // Focus होने पर सारा text select करें
    setTimeout(() => {
      inputRef.current?.setNativeProps({
        selection: { start: 0, end: value.length }
      });
    }, 100);
  };

  return (
    <View style={styles.inputContainer}>
      <Text style={styles.label}>{label}</Text>
      <TextInput
        ref={inputRef}
        style={styles.input}
        value={value}
        onChangeText={handleChange}
        onFocus={handleFocus}
        placeholder={isDate ? "YYYY-MM-DD" : "Enter amount"}
        editable={!isSubmitted}
        keyboardType={isNumeric ? "number-pad" : "default"}
        autoCorrect={false}
        spellCheck={false}
        autoCapitalize="none"
        contextMenuHidden={true}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  inputContainer: {
    marginBottom: 16,
  },
  label: {
    fontSize: 14,
    fontWeight: 'bold',
    marginBottom: 8,
    color: '#333',
  },
  input: {
    backgroundColor: 'white',
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#ddd',
    fontSize: 16,
    height: 50,
  },
});

export default MonthlySaleInput;