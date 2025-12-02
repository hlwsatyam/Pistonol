import {ScrollView} from 'react-native';
import React, {useState} from 'react';
import ThemeWithBg from '../../Skeleton/ThemeWithBg';
import CustomerHeader from '../../components/layout/CustomerHeader';
import MarqueText from './MarqueText';
import PrizeCard from './PrizeCard';
import PromotionCard from './PromotionCard';
import HomeItemCard from './HomeItemCard';
import {useFocusEffect} from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {formatDate} from '../../locale/Locale';

const CustomerHome = ({setScanVisible, setScanTab}) => {
  const [user, setUser] = useState(null);
  useFocusEffect(
    React.useCallback(() => {
      const fetchUser = async () => {
        try {
          const storedUser = await AsyncStorage.getItem('user');
          if (storedUser) {
            setUser(JSON.parse(storedUser));
          }
        } catch (error) {
          console.error('Error fetching user:', error);
        }
      };
      fetchUser();
    }, []),
  );
  return (
    <ThemeWithBg>
      <CustomerHeader />
      <ScrollView style={{flex: 1,  marginBottom:60}}>
        <MarqueText role={user?.role} />
        <PrizeCard
          user={user}
          lastTransferedAt={formatDate(user?.lastTransferedAt)}
          lastScannedAt={formatDate(user?.lastScannedAt)}
          amount={user?.wallet}
        />
        <PromotionCard role={user?.role} />
        <HomeItemCard setScanVisible={setScanVisible} setScanTab={setScanTab} />
      </ScrollView>
    </ThemeWithBg>
  );
};

export default CustomerHome;
