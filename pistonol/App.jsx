import React from 'react';
import {StatusBar} from 'react-native';
import {NavigationContainer} from '@react-navigation/native';
import {createNativeStackNavigator} from '@react-navigation/native-stack';
import TopBar from './src/navigation/TopBar';
import TempLog from './src/screens/auth/TempLogin';
import Splash from './src/screens/splash/Splash';
import Login from './src/screens/auth/Login';
import OtpScreen from './src/screens/auth/Otp';
import ProfileEditScreen from './src/screens/onboarding/ProfileEdit';
import MakePasswordScreen from './src/screens/auth/MakePassword';
import Onboarding from './src/screens/onboarding/Onboarding';
import {QueryClient, QueryClientProvider} from '@tanstack/react-query';
import HomeForCustomer from './src/screens/HomeForCustomer/HomeForCustomer';
import NotificationScreen from './src/components/Notifications/Notifications';
import HelpSupportScreen from './src/components/support/help';
import WalletScreen from './src/components/wallet/Wallet';
import LearningAcademyScreen from './src/screens/HomeForCustomer/LearningAcademy';
import TestNotification from './src/components/Notifications/TestNotification';
import TermsAndConditionsScreen from './src/screens/HomeForCustomer/TermsCondition';
import ProductListingScreen from './src/tabs/ProductListingScreen';
import ProfileScreen from './src/screens/onboarding/Profile';
import Histary from './src/components/wallet/Histary';
import TransferScreen from './src/components/wallet/TransferScreen';
import HomeForEmployee from './src/screens/HomeForEmployee/HomeForEmployee';
import LeadDetailScreen from './src/screens/HomeForEmployee/LeadDetail';
import LeadAnalytics from './src/screens/HomeForEmployee/LeadAnalytics';
import AttendanceScreen from './src/screens/AttendanceScreen';
import Leave from './src/screens/Leave';

const queryClient = new QueryClient();
const Stack = createNativeStackNavigator();

const App = () => {
  return (
    <NavigationContainer>
      <QueryClientProvider client={queryClient}>
        <StatusBar
          barStyle="dark-content"
          backgroundColor="transparent"
          translucent
        />

        <Stack.Navigator
          screenOptions={{headerShown: false}}
          initialRouteName="Splash">
          <Stack.Screen name="Splash" component={Splash} />
          <Stack.Screen name="Login" component={Login} />
          <Stack.Screen name="Otp" component={OtpScreen} />
          <Stack.Screen name="ProfileEdit" component={ProfileEditScreen} />
          <Stack.Screen name="MakePassword" component={MakePasswordScreen} />
          <Stack.Screen name="TempLog" component={TempLog} />
          <Stack.Screen name="Onboarding" component={Onboarding} />
          <Stack.Screen name="Wallet" component={WalletScreen} />
          <Stack.Screen name="attandance" component={AttendanceScreen} />
          <Stack.Screen name="LEAVE" component={Leave} />
          <Stack.Screen name="walletHistory" component={Histary} />
          <Stack.Screen name="TransferScreen" component={TransferScreen} />
          <Stack.Screen
            name="NotificationScreen"
            component={NotificationScreen}
          />
          <Stack.Screen name="TestNotification" component={TestNotification} />
          <Stack.Screen name="Terms" component={TermsAndConditionsScreen} />
          <Stack.Screen
            name="HelpSupportScreen"
            component={HelpSupportScreen}
          />
          <Stack.Screen
            name="LearningAcademyScreen"
            component={LearningAcademyScreen}
          />
          <Stack.Screen
            name="ProductListingScreen"
            component={ProductListingScreen}
          />
         

          {/* for User */}
          <Stack.Screen name="HomeForCustomer" component={HomeForCustomer} />
          <Stack.Screen name="HomeForEmployee" component={HomeForEmployee} />
           <Stack.Screen name="HomeForDistributor" component={TopBar} />
          <Stack.Screen name="LeadDetail" component={LeadDetailScreen} />
          <Stack.Screen name="Profile" component={ProfileScreen} />
          <Stack.Screen name="LeadAnalytics" component={LeadAnalytics} />
        </Stack.Navigator>
      </QueryClientProvider>
    </NavigationContainer>
  );
};

export default App;