// screens/StockReport.js
import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Alert,
  StyleSheet,
  ActivityIndicator,
} from 'react-native';
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Picker } from '@react-native-picker/picker';
const StockReport = ({ navigation }) => {
  const [stockItems, setStockItems] = useState([{ productName: '', volumeSize: '', quantityInBox: '' }]);
  const [distributorId, setDistributorId] = useState('');
  const [loading, setLoading] = useState(false);
  const [existingReport, setExistingReport] = useState(null);

  useEffect(() => {
    loadUserData();
    loadExistingReport();
  }, []);

  const loadUserData = async () => {
    try {
      const userData = await AsyncStorage.getItem('user');
      if (userData) {
        const user = JSON.parse(userData);
        setDistributorId(user._id);
      }
    } catch (error) {
      console.error('Error loading user data:', error);
    }
  };

  const loadExistingReport = async () => {
    try {
      const userData = await AsyncStorage.getItem('user');
      if (userData) {
        const user = JSON.parse(userData);
        const response = await axios.get(`/dmr/my-reports/${user._id}`);
        if (response.data.data.stockReport) {
          setExistingReport(response.data.data.stockReport);
          setStockItems(response.data.data.stockReport.stockItems || [{ productName: '', volumeSize: '', quantityInBox: '' }]);
        }
      }
    } catch (error) {
      console.error('Error loading existing report:', error);
    }
  };

  const addStockItem = () => {
    setStockItems(prev => [...prev, { productName: '', volumeSize: '', quantityInBox: '' }]);
  };

  const removeStockItem = (index) => {
    if (stockItems.length > 1) {
      setStockItems(prev => prev.filter((_, i) => i !== index));
    }
  };

  const updateStockItem = (index, field, value) => {
    setStockItems(prev => prev.map((item, i) => 
      i === index ? { ...item, [field]: value } : item
    ));
  };

  const handleSave = async () => {
    if (!distributorId) {
      Alert.alert('Error', 'User not found');
      return;
    }

    setLoading(true);
    try {
      await axios.post('/dmr/stock-report', {
        distributorId,
        stockItems
      });
      Alert.alert('Success', 'Stock report saved successfully');
    } catch (error) {
      Alert.alert('Error', error.response?.data?.message || 'Failed to save report');
    }
    setLoading(false);
  };

  const handleSubmit = async () => {
    if (!distributorId) {
      Alert.alert('Error', 'User not found');
      return;
    }

    Alert.alert(
      'Confirm Submission',
      'Are you sure you want to submit this stock report? Once submitted, it cannot be modified.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Submit',
          onPress: async () => {
            setLoading(true);
            try {
              await axios.post('/dmr/stock-report/submit', { distributorId });
              Alert.alert('Success', 'Stock report submitted successfully', [
                { text: 'OK', onPress: () => navigation.goBack() }
              ]);
            } catch (error) {
              Alert.alert('Error', error.response?.data?.message || 'Failed to submit report');
            }
            setLoading(false);
          }
        }
      ]
    );
  };

  const isSubmitted = existingReport?.status === 'submitted';

  return (
    <View style={styles.container}>
      <Text style={styles.header}>Stock Report</Text>
      
      {isSubmitted && (
        <View style={styles.submittedBanner}>
          <Text style={styles.submittedText}>Report Already Submitted</Text>
        </View>
      )}

      <ScrollView style={styles.scrollView}>
        <Text style={styles.sectionTitle}>B. Stock in Godown</Text>

        {stockItems.map((item, index) => (
          <View key={index} style={styles.stockItem}>
            <View style={styles.itemHeader}>
              <Text style={styles.itemTitle}>Product {index + 1}</Text>
              {stockItems.length > 1 && !isSubmitted && (
                <TouchableOpacity onPress={() => removeStockItem(index)}>
                  <Text style={styles.removeButton}>Remove</Text>
                </TouchableOpacity>
              )}
            </View>

            <Text style={styles.label}>a) Product Name</Text>
            <TextInput
              style={styles.input}
              value={item.productName}
              onChangeText={(value) => updateStockItem(index, 'productName', value)}
              placeholder="Enter product name"
              editable={!isSubmitted}
            />

            {/* <Text style={styles.label}>b) Volume Size</Text>
            <TextInput
              style={styles.input}
              value={item.volumeSize}
              onChangeText={(value) => updateStockItem(index, 'volumeSize', value)}
              placeholder="e.g., 1L, 500ml"
              editable={!isSubmitted}
            /> */}

<Text style={styles.label}>b) Volume Size</Text>
<View style={styles.pickerContainer}>
  <Picker
    selectedValue={item.volumeSize}
    enabled={!isSubmitted}
    onValueChange={(value) => updateStockItem(index, 'volumeSize', value)}
  >
    <Picker.Item label="Select Volume" value="" />
    <Picker.Item label="500ml" value="500ml" />
    <Picker.Item label="900ml" value="900ml" />
    <Picker.Item label="1 Litre" value="1L" />
    <Picker.Item label="1.5 Litre" value="1.5L" />
    <Picker.Item label="2 Litre" value="2L" />
    <Picker.Item label="2.5 Litre" value="2.5L" />
    <Picker.Item label="3 Litre" value="3L" />
    <Picker.Item label="3.5 Litre" value="3.5L" />
    <Picker.Item label="5 Litre" value="5L" />
  </Picker>
</View>







            <Text style={styles.label}>c) Quantity (IN BOX)</Text>
            <TextInput
              style={styles.input}
              value={item.quantityInBox}
              onChangeText={(value) => updateStockItem(index, 'quantityInBox', value.replace(/[^0-9]/g, ''))}
              placeholder="Enter quantity"
              keyboardType="numeric"
              editable={!isSubmitted}
            />
          </View>
        ))}

        {!isSubmitted && (
          <>
            <TouchableOpacity style={styles.addButton} onPress={addStockItem}>
              <Text style={styles.addButtonText}>+ Add Another Product</Text>
            </TouchableOpacity>

            <View style={styles.buttonContainer}>
              <TouchableOpacity 
                style={[styles.button, styles.saveButton]} 
                onPress={handleSave}
                disabled={loading}
              >
                {loading ? <ActivityIndicator color="white" /> : <Text style={styles.buttonText}>Save Draft</Text>}
              </TouchableOpacity>
              
              <TouchableOpacity 
                style={[styles.button, styles.submitButton]} 
                onPress={handleSubmit}
                disabled={loading}
              >
                {loading ? <ActivityIndicator color="white" /> : <Text style={styles.buttonText}>Submit Report</Text>}
              </TouchableOpacity>
            </View>
          </>
        )}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
    padding: 16,
  },
  header: {
    fontSize: 20,
    fontWeight: 'bold',
    textAlign: 'center',
    marginVertical: 16,
    color: '#333',
  },
  submittedBanner: {
    backgroundColor: '#4CAF50',
    padding: 12,
    borderRadius: 8,
    marginBottom: 16,
  },
  submittedText: {
    color: 'white',
    textAlign: 'center',
    fontWeight: 'bold',
  },
  scrollView: {
    flex: 1,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 16,
    color: '#333',
  },
  stockItem: {
    backgroundColor: 'white',
    padding: 16,
    borderRadius: 8,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#ddd',
  },
  itemHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  itemTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
  },
  removeButton: {
    color: '#FF5252',
    fontWeight: 'bold',
  },
  label: {
    fontSize: 14,
    fontWeight: 'bold',
    marginBottom: 8,
    marginTop: 12,
    color: '#333',
  },
  input: {
    backgroundColor: '#f9f9f9',
    padding: 12,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: '#ddd',
  },
  addButton: {
    backgroundColor: '#2196F3',
    padding: 15,
    borderRadius: 8,
    alignItems: 'center',
    marginBottom: 20,
  },
  addButtonText: {
    color: 'white',
    fontWeight: 'bold',
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 30,
  },
  button: {
    flex: 1,
    padding: 15,
    borderRadius: 8,
    alignItems: 'center',
    marginHorizontal: 8,
  },
  saveButton: {
    backgroundColor: '#2196F3',
  },
  submitButton: {
    backgroundColor: '#de5b73',
  },
  buttonText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 16,
  },
});

export default StockReport;