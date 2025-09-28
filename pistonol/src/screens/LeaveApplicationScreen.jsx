// LeaveApplicationScreen.js
import React, { useState } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  TouchableOpacity, 
  TextInput, 
  ScrollView,
  Alert,
  Platform 
} from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import axios from 'axios';
import { useAuth } from './AuthContext';

const LeaveApplicationScreen = () => {
  const [startDate, setStartDate] = useState(new Date());
  const [endDate, setEndDate] = useState(new Date());
  const [reason, setReason] = useState('');
  const [type, setType] = useState('casual');
  const [showStartDatePicker, setShowStartDatePicker] = useState(false);
  const [showEndDatePicker, setShowEndDatePicker] = useState(false);
  const { user } = useAuth();

  const applyForLeave = async () => {
    if (!reason) {
      Alert.alert('Error', 'Please provide a reason for leave');
      return;
    }

    if (startDate > endDate) {
      Alert.alert('Error', 'End date cannot be before start date');
      return;
    }

    try {
      await axios.post('/api/leave/apply', {
        startDate: startDate.toISOString(),
        endDate: endDate.toISOString(),
        reason,
        type,
        storeId: user.store // Assuming user has a store field
      });

      Alert.alert('Success', 'Leave application submitted successfully');
      setReason('');
    } catch (error) {
      Alert.alert('Error', error.response?.data?.message || 'Failed to apply for leave');
    }
  };

  const onStartDateChange = (event, selectedDate) => {
    setShowStartDatePicker(Platform.OS === 'ios');
    if (selectedDate) {
      setStartDate(selectedDate);
      if (selectedDate > endDate) {
        setEndDate(selectedDate);
      }
    }
  };

  const onEndDateChange = (event, selectedDate) => {
    setShowEndDatePicker(Platform.OS === 'ios');
    if (selectedDate && selectedDate >= startDate) {
      setEndDate(selectedDate);
    }
  };

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>Apply for Leave</Text>

      <View style={styles.inputGroup}>
        <Text style={styles.label}>Start Date</Text>
        <TouchableOpacity onPress={() => setShowStartDatePicker(true)}>
          <Text style={styles.dateText}>
            {startDate.toLocaleDateString()}
          </Text>
        </TouchableOpacity>
        {showStartDatePicker && (
          <DateTimePicker
            value={startDate}
            mode="date"
            display="default"
            onChange={onStartDateChange}
          />
        )}
      </View>

      <View style={styles.inputGroup}>
        <Text style={styles.label}>End Date</Text>
        <TouchableOpacity onPress={() => setShowEndDatePicker(true)}>
          <Text style={styles.dateText}>
            {endDate.toLocaleDateString()}
          </Text>
        </TouchableOpacity>
        {showEndDatePicker && (
          <DateTimePicker
            value={endDate}
            mode="date"
            display="default"
            minimumDate={startDate}
            onChange={onEndDateChange}
          />
        )}
      </View>

      <View style={styles.inputGroup}>
        <Text style={styles.label}>Leave Type</Text>
        <View style={styles.radioGroup}>
          {['casual', 'sick', 'earned', 'without-pay'].map(option => (
            <TouchableOpacity
              key={option}
              style={styles.radioOption}
              onPress={() => setType(option)}
            >
              <View style={styles.radioCircle}>
                {type === option && <View style={styles.radioSelected} />}
              </View>
              <Text style={styles.radioText}>
                {option.charAt(0).toUpperCase() + option.slice(1)}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      <View style={styles.inputGroup}>
        <Text style={styles.label}>Reason</Text>
        <TextInput
          style={styles.textInput}
          multiline
          numberOfLines={4}
          value={reason}
          onChangeText={setReason}
          placeholder="Enter reason for leave"
        />
      </View>

      <TouchableOpacity style={styles.button} onPress={applyForLeave}>
        <Text style={styles.buttonText}>Apply for Leave</Text>
      </TouchableOpacity>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
    textAlign: 'center',
  },
  inputGroup: {
    marginBottom: 20,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 8,
  },
  dateText: {
    padding: 12,
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 5,
  },
  radioGroup: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  radioOption: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 20,
    marginBottom: 10,
  },
  radioCircle: {
    height: 20,
    width: 20,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#007bff',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 5,
  },
  radioSelected: {
    height: 12,
    width: 12,
    borderRadius: 6,
    backgroundColor: '#007bff',
  },
  radioText: {
    fontSize: 16,
  },
  textInput: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 5,
    padding: 10,
    textAlignVertical: 'top',
  },
  button: {
    backgroundColor: '#007bff',
    padding: 15,
    borderRadius: 5,
    alignItems: 'center',
  },
  buttonText: {
    color: 'white',
    fontWeight: 'bold',
  },
});

export default LeaveApplicationScreen;