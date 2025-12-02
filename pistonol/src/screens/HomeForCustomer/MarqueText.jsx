 

// import {View, StyleSheet, Animated, Easing, Dimensions} from 'react-native';
// import React, {useEffect, useRef, useMemo} from 'react';
// import Ionicons from 'react-native-vector-icons/Ionicons';
// import {
//   color,
//   endDirectionTheme,
//   startDirectionTheme,
//   themeColor,
// } from '../../locale/Locale';
// import LinearGradient from 'react-native-linear-gradient';
// import { useMarquees } from '../../hooks/auth';

// const {width} = Dimensions.get('window');

// const MarqueeText = ({role}) => {
//   const animatedValue = useRef(new Animated.Value(0)).current;
//   const { data: marquees,  } = useMarquees();
 
//   // Filter active marquees that match the role or are for "All"
//   const filteredMarquees = useMemo(() => {
//     if (!marquees) return [];
    
//     const now = new Date();
//     return marquees.filter(marquee => 
//       marquee.isActive && 
//       (marquee.targetAudience === 'All' || marquee.targetAudience === role) &&
//       new Date(marquee.startDate) <= now && 
//       new Date(marquee.endDate) >= now
//     );
//   }, [marquees, role]);

//   // Combine the texts of filtered marquees
//   const combinedText = useMemo(() => {
//     return filteredMarquees.map(marquee => marquee.text).join('    •    ');
//   }, [filteredMarquees]);

//   useEffect(() => {
//     if (filteredMarquees.length === 0) return;

//     const startAnimation = () => {
//       animatedValue.setValue(width);
//       Animated.loop(
//         Animated.timing(animatedValue, {
//           toValue: -width * 2,
//           duration: 15000,
//           easing: Easing.linear,
//           useNativeDriver: true,
//         }),
//       ).start();
//     };

//     startAnimation();
//   }, [animatedValue, filteredMarquees]);

//   // Don't render anything if no matching active marquees
//   if (filteredMarquees.length === 0) {
//     return null;
//   }

//   return (
//     <LinearGradient
//       start={startDirectionTheme}
//       end={endDirectionTheme}
//       style={{bl}}
//       colors={['#0000FF', '#0000FF', '#0000FF']}>
//       <View style={styles.container}>
//         <Animated.Text
//           style={[
//             styles.marqueeText,
//             {transform: [{translateX: animatedValue}]},
//           ]}>
//           <Ionicons
//             name="megaphone-outline"
//             size={20}
//             color={color}
//             style={styles.icon}
//           />{' '}
//           {combinedText}
//         </Animated.Text>
//       </View>
//     </LinearGradient>
//   );
// };

// export default MarqueeText;

// const styles = StyleSheet.create({
//   container: {
//     flexDirection: 'row',
//     alignItems: 'center',
//     overflow: 'hidden',
//     paddingHorizontal: 10,
//     paddingVertical: 8,
//     position: 'relative',
//     height: 40,
//   },
//   icon: {
//     marginRight: 10,
//   },
//   marqueeText: {
//     position: 'absolute',
//     left: 40, // adjust based on icon width + margin
//     fontSize: 14,
//     color: color,
//     alignItems:'center',
//     flexDirection:'row',
//     fontWeight: '500',
//     whiteSpace: 'nowrap',
//   },
// });





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

const MarqueeText = ({role , color  } ) => {
  const animatedValue = useRef(new Animated.Value(0)).current;
  const { data: marquees,  } = useMarquees();
 
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

  if (filteredMarquees.length === 0) {
    return null;
  }

  return (
    <View style={styles.borderContainer}>
      <LinearGradient
        colors={['#FF0000', '#FF6B6B', '#FF0000']}
       
        start={{x: 0, y: 0}}
        end={{x: 1, y: 0}}>
        <LinearGradient
          start={startDirectionTheme}
          end={endDirectionTheme}
          colors={[color ? color :'#0000FF',color ? color : '#0000FF',color ? color : '#0000FF']}
          style={styles.innerContainer}>
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
      </LinearGradient>
    </View>
  );
};

export default MarqueeText;

const styles = StyleSheet.create({
  borderContainer: {
     
     
  },
  gradientBorder: {
    padding: 2,
    borderRadius: 8,
  },
  innerContainer: {
    borderRadius: 6,
  },
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
    left: 40,
    fontSize: 14,
    color: color,
    alignItems:'center',
    flexDirection:'row',
    fontWeight: '500',
    whiteSpace: 'nowrap',
  },
});





