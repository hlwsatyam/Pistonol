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

const TopBarForMechanic = () => {
 
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

        <MarqueeText   color={'#007AFF'} role="mechanic" />
      
<PromotionCardSlider role="mechanic"/>
  <WalletCard   reciever={"dealer"  }    />

{/* <DMRDashboard/> */}




{/* <View style={{margin:10}}>
<Button
  title="View MY Target"
  
  onPress={()=> {

navigation.navigate('UserTargetView', {
  user: user,
  userType: 'dealer'
});

  }}
  color="#007AFF"
/>
</View>
<View style={{margin:10}}>

<Button
  title="Create Order"
  onPress={()=> {

navigation.navigate('OrderManagement', {
  user: user,
  userType: 'dealer'
});

  }}
  color="#007AFF"
/>

</View> */}






<View style={{ margin: 10 }}>
  <TouchableOpacity
    onPress={() => {
      navigation.navigate("UserTargetView", {
        user: user,
        userType: "mechanic",
      });
    }}
    style={{
      backgroundColor: "#007AFF",
      paddingVertical: 12,
      borderRadius: 10,
      alignItems: "center",
    }}
  >
    <Text style={{ color: "#fff", fontSize: 16, fontWeight: "600" }}>
      View My Target
    </Text>
  </TouchableOpacity>
</View>

<View style={{ margin: 10 }}>
  <TouchableOpacity
    onPress={() => {
      navigation.navigate("OrderManagement", {
        user: user,
        userType: "mechanic",
      });
    }}
    style={{
      backgroundColor: "#007AFF",
      paddingVertical: 12,
      borderRadius: 10,
      alignItems: "center",
    }}
  >
    <Text style={{ color: "#fff", fontSize: 16, fontWeight: "600" }}>
      Create Order
    </Text>
  </TouchableOpacity>
</View>









</ScrollView>











      </SafeAreaView>
    </View>
  );
};

export default TopBarForMechanic;
