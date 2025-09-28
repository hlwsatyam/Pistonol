 

import React, {useState, useCallback} from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  Image,
  TouchableOpacity,
  Modal,
  RefreshControl,
  Animated,
  Dimensions,
} from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import ThemeWithBg from '../Skeleton/ThemeWithBg';
import {color} from '../locale/Locale';
import { useProducts } from '../hooks/auth';

const {width} = Dimensions.get('window');

const ProductListingScreen = ({navigation}) => {
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [modalVisible, setModalVisible] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const fadeAnim = useState(new Animated.Value(0))[0];
  const scaleValue = useState(new Animated.Value(0.8))[0];

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    refetch().then(() => setRefreshing(false));
  }, [refetch]);

  const openModal = product => {
    setSelectedProduct(product);
    setModalVisible(true);
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 300,
      useNativeDriver: true,
    }).start();
  };

  const closeModal = () => {
    Animated.timing(fadeAnim, {
      toValue: 0,
      duration: 200,
      useNativeDriver: true,
    }).start(() => setModalVisible(false));
  };

  const cardScale = new Animated.Value(1);
  const { data: products, isLoading, isError, error, refetch } = useProducts();
  
  const onPressIn = () => {
    Animated.spring(cardScale, {
      toValue: 0.95,
      useNativeDriver: true,
    }).start();
  };

  const onPressOut = () => {
    Animated.spring(cardScale, {
      toValue: 1,
      friction: 3,
      tension: 40,
      useNativeDriver: true,
    }).start();
  };

  if (isLoading) {
    return (
      <ThemeWithBg>
        <View style={styles.loadingContainer}>
          <Text style={styles.loadingText}>Loading products...</Text>
        </View>
      </ThemeWithBg>
    );
  }

  if (isError) {
    return (
      <ThemeWithBg>
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>Error loading products: {error.message}</Text>
        </View>
      </ThemeWithBg>
    );
  }

  return (
    <ThemeWithBg>
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          style={styles.backButton}>
          <Ionicons name="chevron-back" size={28} color="#fff" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Our Products</Text>
        <View style={{width: 28}} />
      </View>

      <ScrollView
        contentContainerStyle={styles.content}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor="#fff"
            colors={['#fff']}
          />
        }>
        {Array.isArray(products) && products?.map((product, index) => (
          <Animated.View
            key={product._id}  // Using _id from MongoDB
            style={[
              styles.cardContainer,
              {
                transform: [{scale: cardScale}],
                opacity: fadeAnim.interpolate({
                  inputRange: [0, 1],
                  outputRange: [1, 0.8],
                }),
              },
            ]}>
            <TouchableOpacity
              activeOpacity={0.9}
              onPressIn={onPressIn}
              onPressOut={onPressOut}
              onPress={() => openModal(product)}
              delayPressIn={50}
              delayPressOut={50}
              style={[
                styles.card,
                index % 2 === 0 ? styles.cardPrimary : styles.cardSecondary,
              ]}>
              <Image
                source={{uri: product.images[0]?.url}}  // Using first image from images array
                style={styles.image}
                resizeMode="cover"
              />
              <View style={styles.cardText}>
                <Text style={styles.productName}>{product.name}</Text>
                <Text style={styles.shortDesc} numberOfLines={2}>
                  {product.description.length > 100 
                    ? `${product.description.substring(0, 100)}...` 
                    : product.description}
                </Text>
                <View style={styles.categoryContainer}>
                  <Text style={styles.categoryText}>{product.category}</Text>
                </View>
              </View>
            </TouchableOpacity>
          </Animated.View>
        ))}
      </ScrollView>

      <Modal
        visible={modalVisible}
        transparent
        animationType="fade"
        onRequestClose={closeModal}>
        <Animated.View
          style={[styles.modalBackdrop, {opacity: fadeAnim}]}
          onTouchEnd={closeModal}>
          <Animated.View
            style={[
              styles.modalContentWrapper,
              {
                transform: [
                  {
                    translateY: fadeAnim.interpolate({
                      inputRange: [0, 1],
                      outputRange: [50, 0],
                    }),
                  },
                ],
              },
            ]}>
            <View style={styles.modalContent}>
              <Image
                source={{uri: selectedProduct?.images[0]?.url}}
                style={styles.modalImage}
                resizeMode="cover"
              />
              <View style={styles.modalTextContent}>
                <Text style={styles.modalTitle}>{selectedProduct?.name}</Text>
                <Text style={styles.modalSubtitle}>
                  Category: {selectedProduct?.category}
                </Text>
                <View style={styles.divider} />
                <Text style={styles.modalText}>{selectedProduct?.description}</Text>
                
                <View style={styles.imagesContainer}>
                  {selectedProduct?.images?.slice(1).map((image, index) => (
                    <Image
                      key={index}
                      source={{uri: image.url}}
                      style={styles.additionalImage}
                      resizeMode="cover"
                    />
                  ))}
                </View>
              </View>
              <TouchableOpacity
                onPress={closeModal}
                style={styles.closeButton}
                activeOpacity={0.8}>
                <Text style={styles.closeButtonText}>Close</Text>
              </TouchableOpacity>
            </View>
          </Animated.View>
        </Animated.View>
      </Modal>
    </ThemeWithBg>
  );
};

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    padding: 10,
    backgroundColor: 'transparent',
  },
  backButton: {
    padding: 8,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.2)',
  },
  headerTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: '#fff',
    textShadowColor: 'rgba(0,0,0,0.2)',
    textShadowOffset: {width: 1, height: 1},
    textShadowRadius: 3,
  },
  content: {
    padding: 10,
    paddingBottom: 40,
  },
  cardContainer: {
    marginBottom: 10,
    borderRadius: 16,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 6,
    },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 10,
  },
  card: {
    flexDirection: 'row',
    borderRadius: 16,
    overflow: 'hidden',
    height: 120,
  },
  cardPrimary: {
    backgroundColor: '#fff',
  },
  cardSecondary: {
    backgroundColor: '#f8f8f8',
  },
  image: {
    width: width * 0.35,
    height: '100%',
  },
  cardText: {
    flex: 1,
    padding: 15,
    justifyContent: 'space-between',
  },
  productName: {
    fontSize: 18,
    fontWeight: '700',
    color: '#2c3e50',
    marginBottom: 6,
  },
  shortDesc: {
    fontSize: 14,
    color: '#666',
    lineHeight: 20,
  },
  categoryContainer: {
    alignSelf: 'flex-start',
    backgroundColor: '#e0e0e0',
    borderRadius: 12,
    paddingHorizontal: 8,
    paddingVertical: 4,
    marginTop: 8,
  },
  categoryText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#555',
    textTransform: 'capitalize',
  },
  modalBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.7)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContentWrapper: {
    width: '90%',
    maxWidth: 400,
  },
  modalContent: {
    backgroundColor: 'white',
    borderRadius: 20,
    overflow: 'hidden',
    maxHeight: '80%',
  },
  modalImage: {
    width: '100%',
    height: 200,
  },
  modalTextContent: {
    padding: 20,
  },
  modalTitle: {
    fontSize: 22,
    fontWeight: '800',
    color: '#2c3e50',
    marginBottom: 5,
  },
  modalSubtitle: {
    fontSize: 16,
    color: '#666',
    marginBottom: 15,
    fontWeight: '500',
  },
  divider: {
    height: 1,
    backgroundColor: '#eee',
    marginVertical: 15,
  },
  modalText: {
    fontSize: 15,
    lineHeight: 24,
    color: '#555',
    marginBottom: 20,
  },
  imagesContainer: {
    marginTop: 15,
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  additionalImage: {
    width: '48%',
    height: 100,
    marginBottom: 10,
    borderRadius: 8,
  },
  closeButton: {
    padding: 16,
    backgroundColor: color,
    alignItems: 'center',
  },
  closeButtonText: {
    color: '#fff',
    fontWeight: '700',
    fontSize: 16,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    color: '#fff',
    fontSize: 16,
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  errorText: {
    color: '#ff4444',
    fontSize: 16,
    textAlign: 'center',
  },
});

export default ProductListingScreen;