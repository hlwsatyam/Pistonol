import {View, Text, StyleSheet, TouchableOpacity, Image, Platform} from 'react-native';
import React from 'react';
import Ionicons from 'react-native-vector-icons/Ionicons';
import {Logo} from '../../locale/Locale';
import { useNavigation } from '@react-navigation/native';

const CustomerHeader = () => {
  const navigation=useNavigation()
  return (
    <View style={styles.headerWrapper}>
      <View style={styles.header}>
        <Image style={styles.img} source={Logo} />
        <View style={styles.headerIcons}>
          <TouchableOpacity  onPress={()=> navigation.navigate('NotificationScreen') } style={styles.iconButton}>
            <Ionicons name="notifications-outline" size={24} color="#000" />
          </TouchableOpacity>
        
        </View>
      </View>
    </View>
  );
};

export default CustomerHeader;

const styles = StyleSheet.create({
  headerWrapper: {
    backgroundColor: '#fff',
    paddingVertical:2,
    paddingHorizontal: 15,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: {width: 0, height: 2},
        shadowOpacity: 0.1,
        shadowRadius: 4,
      },
      android: {
        elevation: 5,
      },
    }),
 
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  headerIcons: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 15,
  },
  img: {
    width: 100,
    height: 40,  
    resizeMode: 'contain',
  },
  iconButton: {
    padding: 6,
  },
});
