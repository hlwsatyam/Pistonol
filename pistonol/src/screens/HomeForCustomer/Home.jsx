// import {ScrollView} from 'react-native';
// import React, {useState} from 'react';
// import ThemeWithBg from '../../Skeleton/ThemeWithBg';
// import CustomerHeader from '../../components/layout/CustomerHeader';
// import MarqueText from './MarqueText';
// import PrizeCard from './PrizeCard';
// import PromotionCard from './PromotionCard';
// import HomeItemCard from './HomeItemCard';
// import {useFocusEffect} from '@react-navigation/native';
// import AsyncStorage from '@react-native-async-storage/async-storage';
// import {formatDate} from '../../locale/Locale';

// const CustomerHome = ({setScanVisible, setScanTab}) => {
//   const [user, setUser] = useState(null);
//   useFocusEffect(
//     React.useCallback(() => {
//       const fetchUser = async () => {
//         try {
//           const storedUser = await AsyncStorage.getItem('user');
//           if (storedUser) {
//             setUser(JSON.parse(storedUser));
//           }
//         } catch (error) {
//           console.error('Error fetching user:', error);
//         }
//       };
//       fetchUser();
//     }, []),
//   );
//   return (
//     <ThemeWithBg>
//       <CustomerHeader />
//       <ScrollView style={{flex: 1,  marginBottom:60}}>
//         <MarqueText role={user?.role} />
//         <PrizeCard
//           user={user}
//           lastTransferedAt={formatDate(user?.lastTransferedAt)}
//           lastScannedAt={formatDate(user?.lastScannedAt)}
//           amount={user?.wallet}
//         />
//         <PromotionCard role={user?.role} />
//         <HomeItemCard setScanVisible={setScanVisible} setScanTab={setScanTab} />
//       </ScrollView>
//     </ThemeWithBg>
//   );
// };

// export default CustomerHome;






import {ScrollView, RefreshControl, ToastAndroid} from 'react-native';
import React, {useState, useCallback} from 'react';
import ThemeWithBg from '../../Skeleton/ThemeWithBg';
import CustomerHeader from '../../components/layout/CustomerHeader';
import MarqueText from './MarqueText';
import PrizeCard from './PrizeCard';
import PromotionCard from './PromotionCard';
import HomeItemCard from './HomeItemCard';
import {useFocusEffect} from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {formatDate} from '../../locale/Locale';
import axios from 'axios';

const CustomerHome = ({setScanVisible, setScanTab}) => {
  const [user, setUser] = useState(null);
  const [refreshing, setRefreshing] = useState(false);
  const [loading, setLoading] = useState(false);

 
  // Function to fetch fresh user data from backend
  const fetchFreshUserData = async (userId) => {
    try {
      const response = await axios.get(`/auth/${userId}`);
      if (response.data) {
        // Update AsyncStorage with fresh data
        await AsyncStorage.setItem('user', JSON.stringify(response.data));
        return response.data;
      }
    } catch (error) {
      console.error('Backend fetch error:', error);
      throw error;
    }
  };

  // Function to load user data
  const loadUserData = async (forceRefresh = false) => {
    try {
      if (forceRefresh) setRefreshing(true);
      else setLoading(true);

      // First check if we have stored user
      const storedUser = await AsyncStorage.getItem('user');
      if (!storedUser) {
        ToastAndroid.show('Please login again', ToastAndroid.SHORT);
        return;
      }

      const parsedUser = JSON.parse(storedUser);
      
      // Always fetch from backend for latest data
      const freshUser = await fetchFreshUserData(parsedUser._id);
      
      if (freshUser) {
        setUser(freshUser);
        ToastAndroid.show('Data updated', ToastAndroid.SHORT);
      } else {
        setUser(parsedUser);
      }
      
    } catch (error) {   
      // Fallback: Use stored data if network error
      const storedUser = await AsyncStorage.getItem('user');
      if (storedUser) {
        setUser(JSON.parse(storedUser));
      }
      
      if (error.response?.status !== 404) {
        ToastAndroid.show('Failed to update', ToastAndroid.SHORT);
      }
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  // Fetch user on screen focus
  useFocusEffect(
    useCallback(() => {
      loadUserData();
      
      // Cleanup function
      return () => {
        // Any cleanup if needed
      };
    }, [])
  );

  // Pull to refresh handler
  const onRefresh = useCallback(() => {
    loadUserData(true);
  }, []);

  return (
    <ThemeWithBg>
      <CustomerHeader />
      <ScrollView 
        style={{flex: 1, marginBottom: 60}}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={['#ffffff']}
            tintColor="#ffffff"
            title="Updating..."
            titleColor="#ffffff"
          />
        }
      >
        <MarqueText role={user?.role} />
        <PrizeCard
          user={user}
          lastTransferedAt={formatDate(user?.lastTransferedAt)}
          lastScannedAt={formatDate(user?.lastScannedAt)}
          amount={user?.wallet}
        />
        <PromotionCard role={user?.role} />
        <HomeItemCard 
          setScanVisible={setScanVisible} 
          setScanTab={setScanTab} 
          user={user}
        />
      </ScrollView>
    </ThemeWithBg>
  );
};

export default CustomerHome;