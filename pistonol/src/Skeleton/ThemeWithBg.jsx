import React from 'react';
import {ImageBackground, StyleSheet} from 'react-native';
import {SafeAreaView} from 'react-native-safe-area-context';
import {BackgroundTheme} from '../locale/Locale'; // Make sure this path is correct

const ThemeWithBg = ({children}) => {
  return (
    <ImageBackground source={BackgroundTheme} style={styles.background}>
      <SafeAreaView style={styles.safeArea}>{children}</SafeAreaView>
    </ImageBackground>
  );
};

const styles = StyleSheet.create({
  background: {
    flex: 1,
    resizeMode: 'cover',
  },
  safeArea: {
    flex: 1,
  },
});

export default ThemeWithBg;
