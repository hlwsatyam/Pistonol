// // screens/MonthlySaleReport.js
// import React, { useState, useEffect } from 'react';
// import {
//   View,
//   Text,
//   TextInput,
//   TouchableOpacity,
//   ScrollView,
//   Alert,
//   StyleSheet,
//   ActivityIndicator,
// } from 'react-native';
// import axios from 'axios';
// import AsyncStorage from '@react-native-async-storage/async-storage';

// const MonthlySaleReport = ({ navigation }) => {
//   const [formData, setFormData] = useState({
//     positionAsOnDate: new Date().toISOString().split('T')[0],
//     totalMonthSale: '',
//     totalSaleTillDate: '',
//     debtors: '',
//     creditors: '',
//     totalStock: '',
//     cashAtBank: '',
//     cashInHand: '',
//     purchaseOfBusinessAssets: ''
//   });
//   const [distributorId, setDistributorId] = useState('');
//   const [loading, setLoading] = useState(false);
//   const [existingReport, setExistingReport] = useState(null);

//   useEffect(() => {
//     loadUserData();
//     loadExistingReport();
//   }, []);

//   const loadUserData = async () => {
//     try {
//       const userData = await AsyncStorage.getItem('user');
//       if (userData) {
//         const user = JSON.parse(userData);
//         setDistributorId(user._id);
//       }
//     } catch (error) {
//       console.error('Error loading user data:', error);
//     }
//   };

//   const loadExistingReport = async () => {
//     try {
//       const userData = await AsyncStorage.getItem('user');
//       if (userData) {
//         const user = JSON.parse(userData);
//         const response = await axios.get(`/dmr/my-reports/${user._id}`);

//         if (response.data.data.monthlySale) {
//           setExistingReport(response.data.data.monthlySale);
//           setFormData({
//             positionAsOnDate: response.data.data.monthlySale.positionAsOnDate?.split('T')[0] || new Date().toISOString().split('T')[0],
//             totalMonthSale: response.data.data.monthlySale.totalMonthSale?.toString() || '',
//             totalSaleTillDate: response.data.data.monthlySale.totalSaleTillDate?.toString() || '',
//             debtors: response.data.data.monthlySale.debtors?.toString() || '',
//             creditors: response.data.data.monthlySale.creditors?.toString() || '',
//             totalStock: response.data.data.monthlySale.totalStock?.toString() || '',
//             cashAtBank: response.data.data.monthlySale.cashAtBank?.toString() || '',
//             cashInHand: response.data.data.monthlySale.cashInHand?.toString() || '',
//             purchaseOfBusinessAssets: response.data.data.monthlySale.purchaseOfBusinessAssets?.toString() || ''
//           });
//         }
//       }
//     } catch (error) {
//       console.error('Error loading existing report:', error);
//     }
//   };

//   const handleSave = async () => {
//     if (!distributorId) {
//       Alert.alert('Error', 'User not found');
//       return;
//     }

//     setLoading(true);
//     try {
//       await axios.post('/dmr/monthly-sale', {
//         distributorId,
//         ...formData
//       });
//       Alert.alert('Success', 'Report saved successfully');
//     } catch (error) {
//       Alert.alert('Error', error.response?.data?.message || 'Failed to save report');
//     }
//     setLoading(false);
//   };

//   const handleSubmit = async () => {
//     if (!distributorId) {
//       Alert.alert('Error', 'User not found');
//       return;
//     }

//     Alert.alert(
//       'Confirm Submission',
//       'Are you sure you want to submit this report? Once submitted, it cannot be modified.',
//       [
//         { text: 'Cancel', style: 'cancel' },
//         {
//           text: 'Submit',
//           onPress: async () => {
//             setLoading(true);
//             try {
//               await axios.post('/dmr/monthly-sale/submit', { distributorId });
//               Alert.alert('Success', 'Report submitted successfully', [
//                 { text: 'OK', onPress: () => navigation.goBack() }
//               ]);
//             } catch (error) {
//               Alert.alert('Error', error.response?.data?.message || 'Failed to submit report');
//             }
//             setLoading(false);
//           }
//         }
//       ]
//     );
//   };

//   const updateField = (field, value) => {
//     setFormData(prev => ({ ...prev, [field]: value }));
//   };

//   const InputField = ({ label, field, placeholder }) => (
//     <View style={styles.inputContainer}>
//       <Text style={styles.label}>{label}</Text>
//       <TextInput
//         style={styles.input}
//         value={formData[field]}
//         onChangeText={(value) => updateField(field, value)}
//         placeholder={placeholder}
//         keyboardType="numeric"
//       />
//     </View>
//   );

//   const isSubmitted = existingReport?.status === 'submitted';

//   return (
//     <View style={styles.container}>
//       <Text style={styles.header}>Monthly Sale Report</Text>
      
//       {isSubmitted && (
//         <View style={styles.submittedBanner}>
//           <Text style={styles.submittedText}>Report Already Submitted</Text>
//         </View>
//       )}

//       <ScrollView style={styles.scrollView}>
//         <InputField label="a) Position as on Date" field="positionAsOnDate" placeholder="YYYY-MM-DD" />
//         <InputField label="b) Total Month Sale (₹)" field="totalMonthSale" placeholder="Enter amount" />
//         <InputField label="c) Total Sale Till Date (₹)" field="totalSaleTillDate" placeholder="Enter amount" />
//         <InputField label="d) Debtors (₹)" field="debtors" placeholder="Enter amount" />
//         <InputField label="e) Creditors (₹)" field="creditors" placeholder="Enter amount" />
//         <InputField label="f) Total Stock (₹)" field="totalStock" placeholder="Enter amount" />
//         <InputField label="g) Cash at Bank (₹)" field="cashAtBank" placeholder="Enter amount" />
//         <InputField label="h) Cash in Hand (₹)" field="cashInHand" placeholder="Enter amount" />
//         <InputField label="i) Purchase of Business Assets (₹)" field="purchaseOfBusinessAssets" placeholder="Enter amount" />

//         {!isSubmitted && (
//           <View style={styles.buttonContainer}>
//             <TouchableOpacity 
//               style={[styles.button, styles.saveButton]} 
//               onPress={handleSave}
//               disabled={loading}
//             >
//               {loading ? <ActivityIndicator color="white" /> : <Text style={styles.buttonText}>Save Draft</Text>}
//             </TouchableOpacity>
            
//             <TouchableOpacity 
//               style={[styles.button, styles.submitButton]} 
//               onPress={handleSubmit}
//               disabled={loading}
//             >
//               {loading ? <ActivityIndicator color="white" /> : <Text style={styles.buttonText}>Submit Report</Text>}
//             </TouchableOpacity>
//           </View>
//         )}
//       </ScrollView>
//     </View>
//   );
// };

// const styles = StyleSheet.create({
//   container: {
//     flex: 1,
//     backgroundColor: '#f5f5f5',
//     padding: 16,
//   },
//   header: {
//     fontSize: 20,
//     fontWeight: 'bold',
//     textAlign: 'center',
//     marginVertical: 16,
//     color: '#333',
//   },
//   submittedBanner: {
//     backgroundColor: '#4CAF50',
//     padding: 12,
//     borderRadius: 8,
//     marginBottom: 16,
//   },
//   submittedText: {
//     color: 'white',
//     textAlign: 'center',
//     fontWeight: 'bold',
//   },
//   scrollView: {
//     flex: 1,
//   },
//   inputContainer: {
//     marginBottom: 16,
//   },
//   label: {
//     fontSize: 14,
//     fontWeight: 'bold',
//     marginBottom: 8,
//     color: '#333',
//   },
//   input: {
//     backgroundColor: 'white',
//     padding: 12,
//     borderRadius: 8,
//     borderWidth: 1,
//     borderColor: '#ddd',
//   },
//   buttonContainer: {
//     flexDirection: 'row',
//     justifyContent: 'space-between',
//     marginTop: 20,
//     marginBottom: 30,
//   },
//   button: {
//     flex: 1,
//     padding: 15,
//     borderRadius: 8,
//     alignItems: 'center',
//     marginHorizontal: 8,
//   },
//   saveButton: {
//     backgroundColor: '#2196F3',
//   },
//   submitButton: {
//     backgroundColor: '#4CAF50',
//   },
//   buttonText: {
//     color: 'white',
//     fontWeight: 'bold',
//     fontSize: 16,
//   },
// });

// export default MonthlySaleReport;



// screens/MonthlySaleReport.js
import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  Alert,
  StyleSheet,
  ActivityIndicator,
  KeyboardAvoidingView,
  TouchableWithoutFeedback,
  Keyboard,
} from 'react-native';
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Icon from 'react-native-vector-icons/MaterialIcons';
import MonthlySaleInput from '../components/Mont';
import DateTimePicker from '@react-native-community/datetimepicker';
import { SafeAreaView } from 'react-native-safe-area-context';
const MonthlySaleReport = ({ navigation }) => {
  const [formData, setFormData] = useState({
    positionAsOnDate: new Date().toISOString().split('T')[0],
    totalMonthSale: '',
    totalSaleTillDate: '',
    debtors: '',
    creditors: '',
    totalStock: '',
    cashAtBank: '',
    cashInHand: '',
    purchaseOfBusinessAssets: ''
  });
  const [showDate, setShowDate] = useState(false);
  const [distributorId, setDistributorId] = useState('');
  const [loading, setLoading] = useState(false);
  const [existingReport, setExistingReport] = useState(null);
  const [userx, setUser] = useState(null);
  const [isDataLoaded, setIsDataLoaded] = useState(false);
const today = new Date();

// 🔒 Current month start & end
const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
const endOfMonth = new Date(today.getFullYear(), today.getMonth() + 1, 0);
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
        setUser(user)
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

        if (response.data.data.monthlySale) {
          setExistingReport(response.data.data.monthlySale);
          const loadedData = {
            positionAsOnDate: response.data.data.monthlySale.positionAsOnDate?.split('T')[0] || new Date().toISOString().split('T')[0],
            totalMonthSale: response.data.data.monthlySale.totalMonthSale?.toString() || '',
            totalSaleTillDate: response.data.data.monthlySale.totalSaleTillDate?.toString() || '',
            debtors: response.data.data.monthlySale.debtors?.toString() || '',
            creditors: response.data.data.monthlySale.creditors?.toString() || '',
            totalStock: response.data.data.monthlySale.totalStock?.toString() || '',
            cashAtBank: response.data.data.monthlySale.cashAtBank?.toString() || '',
            cashInHand: response.data.data.monthlySale.cashInHand?.toString() || '',
            purchaseOfBusinessAssets: response.data.data.monthlySale.purchaseOfBusinessAssets?.toString() || ''
          };
          setFormData(loadedData);
        }
        setIsDataLoaded(true);
      }
    } catch (error) {
      console.error('Error loading existing report:', error);
      setIsDataLoaded(true);
    }
  };

  const handleValueChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSave = async () => {
    if (!distributorId) {
      Alert.alert('Error', 'User not found');
      return;
    }

    setLoading(true);
    try {
      await axios.post('/dmr/monthly-sale', {
        distributorId,
        ...formData
      });
      Alert.alert('Success', 'Report saved successfully');
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
      'Are you sure you want to submit this report? Once submitted, it cannot be modified.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Submit',
          onPress: async () => {
            setLoading(true);
            try {
              await axios.post('/dmr/monthly-sale/submit', { distributorId });
              Alert.alert('Success', 'Report submitted successfully', [
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

  if (!isDataLoaded) {
    return (
      <View style={styles.loadingContainer}>
      
        <ActivityIndicator size="large" color="#2196F3" />
        <Text style={styles.loadingText}>Loading...</Text>
      </View>
    );
  }
  const handleOutsidePress = () => {
    Keyboard.dismiss();
  };
  return (
        
<SafeAreaView style={{flex:1}}>

      <TouchableWithoutFeedback onPress={handleOutsidePress}>
      













      <KeyboardAvoidingView
        style={styles.keyboardAvoidingView}
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        keyboardVerticalOffset={Platform.OS === "ios" ? 0 : 0}
      >

<View
  style={{
    flexDirection: 'row',
    alignItems: 'center',
    height: 50,
  padding:5,
  }}
>
  {/* ⬅️ Back */}
  <TouchableOpacity
    onPress={() => navigation.goBack()}
    style={{ width: 40 }}
    hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
  >
    <Icon name="arrow-back" size={24} color="#000" />
  </TouchableOpacity>

  {/* 🟰 Center Title */}
  <View style={{ flex: 1, alignItems: 'center' }}>
    <Text
      style={{
        fontSize: 16,
        fontWeight: '600',
      }}
    >
      Monthly Sell
    </Text>
  </View>

  {/* 🕘 History */}
  <TouchableOpacity
    onPress={() =>  navigation.navigate('DMRHistory', { distributorId: userx._id })}
    style={{ width: 60, alignItems: 'flex-end' }}
  >
    <Text
      style={{
        fontSize: 13,
        fontWeight: '600',
        color: '#e74c3c',
      }}
    >
      History
    </Text>
  </TouchableOpacity>
</View>




    <View style={styles.container}>

       
      
      {isSubmitted && (
        <View style={styles.submittedBanner}>
          <Text style={styles.submittedText}>Report Already Submitted</Text>
        </View>
      )}

      <ScrollView 
        style={styles.scrollView}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
   



 












<Text>Position As On Date</Text>

<TouchableOpacity
  onPress={() => setShowDate(true)}
  style={{
    height: 44,
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    justifyContent: 'center',
    paddingHorizontal: 12,
  }}
>
  <Text>
    {formData.positionAsOnDate || 'Select date'}
  </Text>
</TouchableOpacity>

{showDate && (
  <DateTimePicker
    value={
      formData.positionAsOnDate
        ? new Date(formData.positionAsOnDate)
        : today
    }
    mode="date"
    minimumDate={startOfMonth}   // ✅ only current month start
    maximumDate={endOfMonth}     // ✅ only current month end
    onChange={(e, selectedDate) => {
      setShowDate(false);

      if (selectedDate) {
        const formattedDate =
          selectedDate.getFullYear() +
          '-' +
          String(selectedDate.getMonth() + 1).padStart(2, '0') +
          '-' +
          String(selectedDate.getDate()).padStart(2, '0');

        handleValueChange('positionAsOnDate', formattedDate);
      }
    }}
  />
)}


















        {/* Date Field */}
        {/* <MonthlySaleInput
          label="a) Position as on Date"
          field="positionAsOnDate"
          initialValue={formData.positionAsOnDate}
          isNumeric={false}
          isDate={true}
          isSubmitted={isSubmitted}
          onValueChange={handleValueChange}
        /> */}

        {/* Numeric Fields - हर एक अलग component */}
        <MonthlySaleInput
          label="b) Total Month Sale (₹)"
          field="totalMonthSale"
          initialValue={formData.totalMonthSale}
          isNumeric={true}
          isSubmitted={isSubmitted}
          onValueChange={handleValueChange}
        />

        <MonthlySaleInput
          label="c) Total Sale Till Date (₹)"
          field="totalSaleTillDate"
          initialValue={formData.totalSaleTillDate}
          isNumeric={true}
          isSubmitted={isSubmitted}
          onValueChange={handleValueChange}
        />

        <MonthlySaleInput
          label="d) Debtors (₹)"
          field="debtors"
          initialValue={formData.debtors}
          isNumeric={true}
          isSubmitted={isSubmitted}
          onValueChange={handleValueChange}
        />

        <MonthlySaleInput
          label="e) Creditors (₹)"
          field="creditors"
          initialValue={formData.creditors}
          isNumeric={true}
          isSubmitted={isSubmitted}
          onValueChange={handleValueChange}
        />

        <MonthlySaleInput
          label="f) Total Stock (₹)"
          field="totalStock"
          initialValue={formData.totalStock}
          isNumeric={true}
          isSubmitted={isSubmitted}
          onValueChange={handleValueChange}
        />

        <MonthlySaleInput
          label="g) Cash at Bank (₹)"
          field="cashAtBank"
          initialValue={formData.cashAtBank}
          isNumeric={true}
          isSubmitted={isSubmitted}
          onValueChange={handleValueChange}
        />

        <MonthlySaleInput
          label="h) Cash in Hand (₹)"
          field="cashInHand"
          initialValue={formData.cashInHand}
          isNumeric={true}
          isSubmitted={isSubmitted}
          onValueChange={handleValueChange}
        />

        <MonthlySaleInput
          label="i) Purchase of Business Assets (₹)"
          field="purchaseOfBusinessAssets"
          initialValue={formData.purchaseOfBusinessAssets}
          isNumeric={true}
          isSubmitted={isSubmitted}
          onValueChange={handleValueChange}
        />

        {!isSubmitted && (
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
        )}
               
      </ScrollView>
    </View> 
    
    
  

      </KeyboardAvoidingView>
    </TouchableWithoutFeedback>
</SafeAreaView>





  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
    padding: 16,
  },  keyboardAvoidingView: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f5f5f5',
  },
  loadingText: {
    marginTop: 12,
    fontSize: 16,
    color: '#666',
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
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 20,
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

export default MonthlySaleReport;