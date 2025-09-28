import React, {useRef, useState} from 'react';
import {
  View,
  TouchableOpacity,
  Animated,
  StyleSheet,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import Ionicons from 'react-native-vector-icons/Ionicons';
import ThemeWithBg from '../Skeleton/ThemeWithBg';
import {createMaterialTopTabNavigator} from '@react-navigation/material-top-tabs';
import HomeScreen from '../screens/Home';
import {Text} from 'react-native-paper';
import Scan from '../screens/Scan';
import OrderProduct from '../screens/OrderProduct';
 

const Tab = createMaterialTopTabNavigator();

const TopBar = () => {
  // Animation values
  const scaleValue = useRef(new Animated.Value(1)).current;
  const rotateValue = useRef(new Animated.Value(0)).current;
  const [activeTab, setActiveTab] = useState('Home');

  const animateScanIcon = () => {
    // Reset values
    scaleValue.setValue(1);
    rotateValue.setValue(0);

    // Parallel animations
    Animated.parallel([
      Animated.spring(scaleValue, {
        toValue: 1.2,
        friction: 3,
        useNativeDriver: true,
      }),
      Animated.loop(
        Animated.timing(rotateValue, {
          toValue: 1,
          duration: 2000,
          useNativeDriver: true,
        }),
      ),
    ]).start();
  };

  const rotateInterpolation = rotateValue.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '360deg'],
  });

  return (
    <ThemeWithBg>
      {activeTab === 'Home' && (
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Pistonol</Text>
          <View style={styles.headerIcons}>
            <TouchableOpacity style={styles.iconButton}>
              <Ionicons name="notifications-outline" size={24} color="#000" />
            </TouchableOpacity>
            <TouchableOpacity style={styles.iconButton}>
              <Ionicons name="wallet-outline" size={24} color="#000" />
            </TouchableOpacity>
          </View>
        </View>
      )}

      <Tab.Navigator
        screenOptions={{
          tabBarActiveTintColor: 'tomato',
          tabBarInactiveTintColor: 'gray',
          tabBarLabelStyle: {fontSize: 8},
          tabBarStyle: {
            backgroundColor: 'transparent',
            elevation: 0,
            margin: 0,
            padding: 0,
            shadowColor: 'transparent',
          },
          tabBarItemStyle: {margin: 0, padding: 0},
          tabBarIndicatorStyle: {backgroundColor: 'tomato'},
        }}
        screenListeners={{
          state: (e) => {
            // Get the current route name when tab changes
            const routeName = e.data?.state?.routes[e.data.state.index]?.name;
            if (routeName) {
              setActiveTab(routeName);
            }
          },
        }}>
        <Tab.Screen
          name="Home"
          component={HomeScreen}
          options={{
            tabBarIcon: ({color}) => (
              <Icon name="home-outline" size={24} color={color} />
            ),
          }}
        />
        <Tab.Screen
          name="Product"
          component={OrderProduct}
          options={{
            tabBarIcon: ({color}) => (
              <Ionicons name="briefcase-outline" size={24} color={color} />
            ),
          }}
        />
        <Tab.Screen
          name="Scan"
          component={Scan}
          options={{
            tabBarIcon: ({color}) => (
              <Animated.View
                style={[
                  styles.scanIconContainer,
                  {
                    transform: [
                      {scale: scaleValue},
                      {rotate: rotateInterpolation},
                    ],
                  },
                ]}>
                <Icon name="line-scan" size={32} color={color} />
              </Animated.View>
            ),
            tabBarLabel: '',
          }}
          listeners={{
            tabPress: animateScanIcon,
          }}
        />
        <Tab.Screen
          name="Rating"
          component={HomeScreen}
          options={{
            tabBarIcon: ({color}) => (
              <Icon name="star-outline" size={24} color={color} />
            ),
          }}
        />
       
      </Tab.Navigator>
    </ThemeWithBg>
  );
};

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    paddingHorizontal: 20,
     
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: 'transparent',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#000',
  },
  headerIcons: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 15,
  },
  iconButton: {
    
  },
  scanIconContainer: {
    width: 40,
    height: 40,
    position: 'absolute',
    top: -12,
    left: '50%',
    marginLeft: -30,
    borderRadius: 30,
    justifyContent: 'center',
    alignItems: 'center',
   

  },
});

export default TopBar;6