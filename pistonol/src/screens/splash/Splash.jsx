// import React, { useEffect } from 'react';
// import { View, Image, StyleSheet } from 'react-native';
// import { Logo } from '../../locale/Locale';
// import ThemeWithBg from '../../Skeleton/ThemeWithBg';

// const Splash = ({ navigation }) => {
//   useEffect(() => {
//     const timer = setTimeout(() => {
//       navigation.navigate('Login');
//     }, 500);

//     return () => clearTimeout(timer);
//   }, [navigation]);

//   return (
//     <ThemeWithBg>
//       <View style={styles.container}>
//         <Image source={Logo} style={styles.logo} resizeMode="contain" />
//       </View>
//     </ThemeWithBg>
//   );
// };

// const styles = StyleSheet.create({
//   container: {
//     flex: 1,
//     justifyContent: 'center',
//     alignItems: 'center',
//   },
//   logo: {
//     width: 200,
//     height: 200,
//   },
// });

// export default Splash;

import React, {useEffect} from 'react';
import {View, Image, StyleSheet} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {Logo} from '../../locale/Locale';
import ThemeWithBg from '../../Skeleton/ThemeWithBg';

const Splash = ({navigation}) => {
  useEffect(() => {
    const timer = setTimeout(async () => {
      let user = await AsyncStorage.getItem('user');

      if (user) {
        user = JSON.parse(user);
        if (user?.role === 'customer') {
          navigation.reset({
            index: 0,
            routes: [{name: 'HomeForCustomer'}],
          });
        } 
        
        if (user?.role === 'company-employee') {
          navigation.reset({
            index: 0,
            routes: [{name: 'HomeForEmployee'}],
          });
        } 
        



if (user?.role === 'distributor') {
            navigation.reset({
              index: 0,
              routes: [{name: 'HomeForDistributor'}],
            });}
if (user?.role === 'dealer') {
            navigation.reset({
              index: 0,
              routes: [{name: 'HomeForDealer'}],
            });}
if (user?.role === 'mechanic') {
            navigation.reset({
              index: 0,
              routes: [{name: 'HomeForMechanic'}],
            });}








        
        // else {
        //   navigation.reset({
        //     index: 0,
        //     routes: [{name: 'Home'}],
        //   });
        // }
      } else {
        navigation.reset({
          index: 0,
          routes: [{name: 'Login'}],
        });
      }
    }, 1200);  

    return () => clearTimeout(timer);
  }, [navigation]);

  return (
    <ThemeWithBg>
      <View style={styles.container}>
        <Image source={Logo} style={styles.logo} resizeMode="contain" />
      </View>
    </ThemeWithBg>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  logo: {
    width: 200,
    height: 200,
  },
});

export default Splash;
