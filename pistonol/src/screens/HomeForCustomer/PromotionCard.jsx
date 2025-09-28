 
import React, { useEffect, useRef, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Dimensions,
  ImageBackground,
  Animated,
} from 'react-native';
import { useBanners } from '../../hooks/auth';

const { width } = Dimensions.get('window');

const PromotionCardSlider = ({role}) => {
  const scrollRef = useRef(null);
  const scrollX = useRef(new Animated.Value(0)).current;
  let scrollIndex = 0;
  const { data: banners } = useBanners();

  // Filter active banners that match the role or are for "All"
  const filteredBanners = useMemo(() => {
    if (!banners) return [];
    
    const now = new Date();
    return banners.filter(banner => 
      banner.isActive && 
      (banner.targetAudience === 'All' || banner.targetAudience === role) &&
      new Date(banner.startDate) <= now && 
      new Date(banner.endDate) >= now
    );
  }, [banners, role]);

  useEffect(() => {
    if (filteredBanners.length === 0) return;

    const interval = setInterval(() => {
      scrollIndex = (scrollIndex + 1) % filteredBanners.length;
      scrollRef.current?.scrollTo({ x: scrollIndex * width, animated: true });
    }, 4000);

    return () => clearInterval(interval);
  }, [filteredBanners]);

  if (filteredBanners.length === 0) {
    return null;
  }

  return (
    <View style={styles.container}>
      <ScrollView
        ref={scrollRef}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        scrollEventThrottle={16}
        onScroll={Animated.event(
          [{ nativeEvent: { contentOffset: { x: scrollX } } }],
          { useNativeDriver: false }
        )}
      >
        {filteredBanners.map((banner, index) => (
          <View key={banner._id} style={styles.card}>
            <ImageBackground
              source={{ uri: banner.imageUrl }}
              style={styles.image}
              imageStyle={{ borderRadius: 20 }}
            >
              <View style={styles.overlay} />
              <View style={styles.textContainer}>
                <Text style={styles.header}>{banner.title}</Text>
                {banner.description && (
                  <Text style={styles.description}>{banner.description}</Text>
                )}
              </View>
            </ImageBackground>
          </View>
        ))}
      </ScrollView>
    </View>
  );
};

export default PromotionCardSlider;

const styles = StyleSheet.create({
  container: {
    marginTop: 16,
  },
  card: {
    width,
    height: 170,
    paddingHorizontal: 16,
  },
  image: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  overlay: {
    
    backgroundColor: 'rgba(0,0,0,0.35)',
    borderRadius: 20,
  },
  textContainer: {
    padding: 16,
  },
  header: {
    fontSize: 18,
    color: '#fff',
    fontWeight: 'bold',
    marginBottom: 4,
  },
  description: {
    fontSize: 14,
    color: '#eee',
  },
});