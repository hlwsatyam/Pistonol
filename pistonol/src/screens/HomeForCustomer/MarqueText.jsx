 

import {View, StyleSheet, Animated, Easing, Dimensions} from 'react-native';
import React, {useEffect, useRef, useMemo} from 'react';
import Ionicons from 'react-native-vector-icons/Ionicons';
import {
  color,
  endDirectionTheme,
  startDirectionTheme,
  themeColor,
} from '../../locale/Locale';
import LinearGradient from 'react-native-linear-gradient';
import { useMarquees } from '../../hooks/auth';

const {width} = Dimensions.get('window');

const MarqueeText = ({role}) => {
  const animatedValue = useRef(new Animated.Value(0)).current;
  const { data: marquees,  } = useMarquees();
 
  // Filter active marquees that match the role or are for "All"
  const filteredMarquees = useMemo(() => {
    if (!marquees) return [];
    
    const now = new Date();
    return marquees.filter(marquee => 
      marquee.isActive && 
      (marquee.targetAudience === 'All' || marquee.targetAudience === role) &&
      new Date(marquee.startDate) <= now && 
      new Date(marquee.endDate) >= now
    );
  }, [marquees, role]);

  // Combine the texts of filtered marquees
  const combinedText = useMemo(() => {
    return filteredMarquees.map(marquee => marquee.text).join('    •    ');
  }, [filteredMarquees]);

  useEffect(() => {
    if (filteredMarquees.length === 0) return;

    const startAnimation = () => {
      animatedValue.setValue(width);
      Animated.loop(
        Animated.timing(animatedValue, {
          toValue: -width * 2,
          duration: 15000,
          easing: Easing.linear,
          useNativeDriver: true,
        }),
      ).start();
    };

    startAnimation();
  }, [animatedValue, filteredMarquees]);

  // Don't render anything if no matching active marquees
  if (filteredMarquees.length === 0) {
    return null;
  }

  return (
    <LinearGradient
      start={startDirectionTheme}
      end={endDirectionTheme}
      colors={themeColor}>
      <View style={styles.container}>
        <Animated.Text
          style={[
            styles.marqueeText,
            {transform: [{translateX: animatedValue}]},
          ]}>
          <Ionicons
            name="megaphone-outline"
            size={20}
            color={color}
            style={styles.icon}
          />{' '}
          {combinedText}
        </Animated.Text>
      </View>
    </LinearGradient>
  );
};

export default MarqueeText;

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    overflow: 'hidden',
    paddingHorizontal: 10,
    paddingVertical: 8,
    position: 'relative',
    height: 40,
  },
  icon: {
    marginRight: 10,
  },
  marqueeText: {
    position: 'absolute',
    left: 40, // adjust based on icon width + margin
    fontSize: 14,
    color: color,
    alignItems:'center',
    flexDirection:'row',
    fontWeight: '500',
    whiteSpace: 'nowrap',
  },
});