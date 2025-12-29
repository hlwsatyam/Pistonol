import React, { useEffect, useState } from 'react';
import {
  Button,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
 
} from 'react-native';
 
import { SafeAreaView } from 'react-native-safe-area-context';
 
import MarqueeText from '../screens/HomeForCustomer/MarqueText';
import WalletCard from '../components/wallet/WalletCard';
import QRCodeScannerButton from '../components/wallet/QRCodeScannerButton';
import { useNavigation } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import DMRDashboard from '../components/DMRDashboard';
import PromotionCardSlider from '../screens/HomeForCustomer/PromotionCard';

const SimpleDistributorDashboard = () => {
 
  const [user, setUser] = useState(null);
 useEffect(() => {
    loadUserData();
  }, []);

  const loadUserData = async () => {
    try {
      const userData = await AsyncStorage.getItem('user');
      if (userData) {
        const parsedUser = JSON.parse(userData);
        setUser(parsedUser);
      }
    } catch (error) {
      console.error('Error loading user data:', error);
      Alert.alert('Error', 'Failed to load user data');
    }
  };
 

const navigation=useNavigation()
  return (
    <View style={{ flex: 1, backgroundColor: '#f8f9fa' }}>
      <SafeAreaView style={{ flex: 1 }}>
<QRCodeScannerButton/>
<ScrollView>

        <MarqueeText   color={'#007AFF'} role="distributor" />
      
<PromotionCardSlider role="distributor"/>
  <WalletCard/>

<DMRDashboard/>




 

{/* View My Target */}
<TouchableOpacity
  onPress={() =>
    navigation.navigate("UserTargetView", {
      user: user,
      userType: "distributor",
    })
  }
  style={{
    backgroundColor: "#2563EB",
    paddingVertical: 8,
    paddingHorizontal: 18,
    borderRadius: 12,
    alignItems: "center",
    marginHorizontal: 12,
    marginVertical: 6,
    elevation: 3,
    shadowColor: "#000",
    shadowOpacity: 0.2,
    shadowRadius: 4,
    shadowOffset: { height: 2, width: 0 },
  }}
>
  <Text style={{ color: "#fff", fontSize: 14, fontWeight: "700" }}>
    VIEW MY TARGET
  </Text>
</TouchableOpacity>






{/* Create Order */}
<TouchableOpacity
  onPress={() =>
    navigation.navigate("OrderManagement", {
      user: user,
      userType: "distributor",
    })
  }
  style={{
    backgroundColor: "#2563EB",
    paddingVertical: 8,
    paddingHorizontal: 1,
    borderRadius: 12,
    alignItems: "center",
    marginHorizontal: 12,
    marginVertical: 6,
    elevation: 3,
    shadowColor: "#000",
    shadowOpacity: 0.2,
    shadowRadius: 4,
    shadowOffset: { height: 2, width: 0 },
  }}
>
  <Text style={{ color: "#fff", fontSize: 14, fontWeight: "700" }}>
    CREATE ORDER
  </Text>
</TouchableOpacity>






<View style={{ margin: 10 }}>
  <TouchableOpacity
    onPress={() => {
      navigation.navigate("OrdersManagement");
    }}
    style={{
      backgroundColor: "#007AFF",
      paddingVertical: 12,
      borderRadius: 10,
      alignItems: "center",
    }}
  >
    <Text style={{ color: "#fff", fontSize: 16, fontWeight: "600" }}>
      Orders Management
    </Text>
  </TouchableOpacity>
</View>




 






</ScrollView>











      </SafeAreaView>
    </View>
  );
};

export default SimpleDistributorDashboard;
