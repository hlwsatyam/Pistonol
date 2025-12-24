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
  StatusBar,
  ActivityIndicator,
} from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { SafeAreaView } from 'react-native-safe-area-context';
import LinearGradient from 'react-native-linear-gradient';
import { useProducts } from '../hooks/auth';

const {width} = Dimensions.get('window');

const ProductListingScreen = ({navigation}) => {
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [modalVisible, setModalVisible] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [loadingMore, setLoadingMore] = useState(false);
  const fadeAnim = useState(new Animated.Value(0))[0];
  
  // Colors for different categories
  const categoryColors = {
    'engine-parts': '#FF6B6B',
    'electrical': '#4ECDC4',
    'body-parts': '#45B7D1',
    'accessories': '#96CEB4',
    'lubricants': '#FFEAA7',
    'tools': '#DDA0DD',
  };

  const categoryIcons = {
    'engine-parts': 'settings-outline',
    'electrical': 'flash-outline',
    'body-parts': 'car-outline',
    'accessories': 'sparkles-outline',
    'lubricants': 'water-outline',
    'tools': 'construct-outline',
  };

  // Use the hook with pagination
  const { 
    data: productsData, 
    isLoading, 
    isError, 
    error, 
    refetch 
  } = useProducts(currentPage, 6);

  // Extract actual products array and pagination info
  const products = productsData?.data || [];
  const pagination = productsData?.pagination || {};
  const statistics = productsData?.statistics || {};

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    setCurrentPage(1);
    refetch().then(() => setRefreshing(false));
  }, [refetch]);

  const loadMoreProducts = () => {
    if (pagination.hasNext && !loadingMore) {
      setLoadingMore(true);
      setCurrentPage(prev => prev + 1);
      // The query will automatically refetch when currentPage changes
      setLoadingMore(false);
    }
  };

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

  const getCategoryDisplayName = (category) => {
    const names = {
      'engine-parts': 'Engine Parts',
      'electrical': 'Electrical',
      'body-parts': 'Body Parts',
      'accessories': 'Accessories',
      'lubricants': 'Lubricants',
      'tools': 'Tools',
    };
    return names[category] || category;
  };

  const cardScale = new Animated.Value(1);
  
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

  if (isLoading && currentPage === 1) {
    return (
      <View style={styles.loadingContainer}>
        <StatusBar backgroundColor="#667eea" barStyle="light-content" />
        <LinearGradient
          colors={['#667eea', '#764ba2']}
          style={StyleSheet.absoluteFill}
        />
        <View style={styles.loadingContent}>
          <ActivityIndicator size="large" color="#fff" />
          <Text style={styles.loadingText}>Loading Products...</Text>
        </View>
      </View>
    );
  }

  if (isError) {
    return (
      <View style={styles.errorContainer}>
        <StatusBar backgroundColor="#FF6B6B" barStyle="light-content" />
        <LinearGradient
          colors={['#FF6B6B', '#FF8E8E']}
          style={StyleSheet.absoluteFill}
        />
        <View style={styles.errorContent}>
          <Ionicons name="alert-circle-outline" size={60} color="#fff" />
          <Text style={styles.errorTitle}>Oops!</Text>
          <Text style={styles.errorText}>Failed to load products</Text>
          <TouchableOpacity 
            style={styles.retryButton}
            onPress={() => refetch()}
          >
            <Text style={styles.retryButtonText}>Retry</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar backgroundColor="#667eea" barStyle="light-content" />
      
      {/* Header with Gradient */}
      <LinearGradient
        colors={['#667eea', '#764ba2']}
        start={{x: 0, y: 0}}
        end={{x: 1, y: 0}}
        style={styles.header}
      >
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          style={styles.backButton}>
          <Ionicons name="chevron-back" size={28} color="#fff" />
        </TouchableOpacity>
        <View style={styles.headerTitleContainer}>
          <Ionicons name="cube-outline" size={24} color="#fff" style={styles.headerIcon} />
          <Text style={styles.headerTitle}>Product Catalog</Text>
        </View>
        <View style={styles.headerRight}>
          {statistics.totalProducts && (
            <Text style={styles.productCount}>
              {statistics.totalProducts} items
            </Text>
          )}
        </View>
      </LinearGradient>

      {/* Main Content with subtle gradient */}
      <LinearGradient
        colors={['#f8f9fa', '#e9ecef']}
        style={styles.container}
      >
        <ScrollView
          contentContainerStyle={styles.content}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              tintColor="#667eea"
              colors={['#667eea']}
            />
          }
          showsVerticalScrollIndicator={false}
          onScroll={({nativeEvent}) => {
            const {layoutMeasurement, contentOffset, contentSize} = nativeEvent;
            const isCloseToBottom = 
              layoutMeasurement.height + contentOffset.y >= contentSize.height - 50;
            
            if (isCloseToBottom) {
              loadMoreProducts();
            }
          }}
          scrollEventThrottle={400}
        >
       

          {/* Products Grid */}
          {products.length > 0 ? (
            <>
              <View style={styles.productsGrid}>
                {products.map((product, index) => {
                  const categoryColor = categoryColors[product.category] || '#667eea';
                  const categoryIcon = categoryIcons[product.category] || 'cube-outline';
                  
                  return (
                    <TouchableOpacity
                      key={`${product._id}_${index}`}
                      activeOpacity={0.7}
                      onPress={() => openModal(product)}
                      style={styles.productCardWrapper}
                    >
                      <Animated.View
                        style={[
                          styles.productCard,
                          {
                            transform: [{scale: cardScale}],
                          },
                        ]}
                      >
                        {/* Product Image */}
                        <View style={styles.imageContainer}>
                          {product.images?.[0]?.url ? (
                            <Image
                              source={{uri: product.images[0].url}}
                              style={styles.productImage}
                              resizeMode="cover"
                            />
                          ) : (
                            <View style={[styles.placeholderImage, {backgroundColor: categoryColor + '20'}]}>
                              <Ionicons name={categoryIcon} size={40} color={categoryColor} />
                            </View>
                          )}
                          {/* Category Badge */}
                          <View style={[styles.categoryBadge, {backgroundColor: categoryColor}]}>
                            <Ionicons name={categoryIcon} size={14} color="#fff" style={styles.badgeIcon} />
                            <Text style={styles.categoryBadgeText}>
                              {getCategoryDisplayName(product.category)}
                            </Text>
                          </View>
                        </View>

                        {/* Product Info */}
                        <View style={styles.productInfo}>
                          <Text style={styles.productName} numberOfLines={2}>
                            {product.name}
                          </Text>
                          
                          {/* Stock Indicator */}
                          <View style={styles.stockContainer}>
                            <View style={styles.stockIndicator}>
                              <View 
                                style={[
                                  styles.stockBar, 
                                  { 
                                    width: `${Math.min((product.stock / 100) * 100, 100)}%`,
                                    backgroundColor: product.stock > 20 ? '#4CAF50' : product.stock > 0 ? '#FF9800' : '#F44336'
                                  }
                                ]} 
                              />
                            </View>
                            <Text style={[
                              styles.stockText,
                              { color: product.stock > 20 ? '#4CAF50' : product.stock > 0 ? '#FF9800' : '#F44336' }
                            ]}>
                              {product.stock > 0 ? `${product.stock} in stock` : 'Out of stock'}
                            </Text>
                          </View>

                          {/* Description Preview */}
                          <Text style={styles.productDescription} numberOfLines={3}>
                            {product.description}
                          </Text>

                          {/* Educational Purpose Label */}
                          <View style={styles.educationalLabel}>
                            <Ionicons name="school-outline" size={14} color="#667eea" />
                            <Text style={styles.educationalText}>Educational Reference</Text>
                          </View>
                        </View>
                      </Animated.View>
                    </TouchableOpacity>
                  );
                })}
              </View>

              {/* Pagination Footer */}
              <View style={styles.paginationContainer}>
                <TouchableOpacity
                  style={[
                    styles.paginationButton,
                    !pagination.hasPrev && styles.disabledButton
                  ]}
                  onPress={() => {
                    if (pagination.hasPrev) {
                      setCurrentPage(prev => prev - 1);
                    }
                  }}
                  disabled={!pagination.hasPrev || loadingMore}
                >
                  <Ionicons name="chevron-back" size={20} color={pagination.hasPrev ? "#fff" : "#ccc"} />
                  <Text style={[
                    styles.paginationButtonText,
                    {color: pagination.hasPrev ? "#fff" : "#ccc"}
                  ]}>
                    Previous
                  </Text>
                </TouchableOpacity>

                <View style={styles.pageInfo}>
                  <Text style={styles.pageText}>
                    Page {pagination.current || 1} of {pagination.pages || 1}
                  </Text>
                  <Text style={styles.totalText}>
                    {pagination.total || 0} total products
                  </Text>
                </View>

                <TouchableOpacity
                  style={[
                    styles.paginationButton,
                    !pagination.hasNext && styles.disabledButton
                  ]}
                  onPress={() => {
                    if (pagination.hasNext) {
                      setCurrentPage(prev => prev + 1);
                    }
                  }}
                  disabled={!pagination.hasNext || loadingMore}
                >
                  <Text style={[
                    styles.paginationButtonText,
                    {color: pagination.hasNext ? "#fff" : "#ccc"}
                  ]}>
                    Next
                  </Text>
                  <Ionicons name="chevron-forward" size={20} color={pagination.hasNext ? "#fff" : "#ccc"} />
                </TouchableOpacity>
              </View>

              {/* Loading More Indicator */}
              {loadingMore && (
                <View style={styles.loadingMoreContainer}>
                  <ActivityIndicator size="small" color="#667eea" />
                  <Text style={styles.loadingMoreText}>Loading more products...</Text>
                </View>
              )}
            </>
          ) : (
            <View style={styles.emptyContainer}>
              <Ionicons name="cube-outline" size={80} color="#ccc" />
              <Text style={styles.emptyTitle}>No Products Found</Text>
              <Text style={styles.emptyText}>
                There are no products in the catalog yet.
              </Text>
            </View>
          )}
        </ScrollView>
      </LinearGradient>

      {/* Product Detail Modal */}
      <Modal
        visible={modalVisible}
        transparent
        animationType="fade"
        onRequestClose={closeModal}
        statusBarTranslucent
      >
        <Animated.View
          style={[styles.modalBackdrop, {opacity: fadeAnim}]}
          onTouchEnd={closeModal}
        >
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
            ]}
          >
            <View style={styles.modalContent}>
              {/* Modal Header */}
              <LinearGradient
                colors={['#667eea', '#764ba2']}
                start={{x: 0, y: 0}}
                end={{x: 1, y: 0}}
                style={styles.modalHeader}
              >
                <Text style={styles.modalHeaderTitle}>Product Details</Text>
                <TouchableOpacity onPress={closeModal} style={styles.modalCloseButton}>
                  <Ionicons name="close" size={24} color="#fff" />
                </TouchableOpacity>
              </LinearGradient>

              {/* Modal Body */}
              <ScrollView style={styles.modalBody}>
                {/* Product Image Gallery */}
                <ScrollView 
                  horizontal 
                  showsHorizontalScrollIndicator={false}
                  style={styles.imageGallery}
                >
                  {selectedProduct?.images?.map((image, index) => (
                    <View key={index} style={styles.galleryImageContainer}>
                      <Image
                        source={{uri: image.url}}
                        style={styles.galleryImage}
                        resizeMode="cover"
                      />
                    </View>
                  ))}
                </ScrollView>

                {/* Product Info */}
                <View style={styles.modalInfoContainer}>
                  <Text style={styles.modalProductName}>{selectedProduct?.name}</Text>
                  
                  <View style={styles.modalCategoryContainer}>
                    <View style={[
                      styles.modalCategoryBadge, 
                      {backgroundColor: selectedProduct ? categoryColors[selectedProduct.category] : '#667eea'}
                    ]}>
                      <Ionicons 
                        name={selectedProduct ? categoryIcons[selectedProduct.category] : 'cube-outline'} 
                        size={16} 
                        color="#fff" 
                      />
                      <Text style={styles.modalCategoryText}>
                        {selectedProduct ? getCategoryDisplayName(selectedProduct.category) : 'N/A'}
                      </Text>
                    </View>
                  </View>

                  {/* Stock Status */}
                  <View style={styles.modalStockContainer}>
                    <View style={styles.modalStockInfo}>
                      <Ionicons 
                        name="cube" 
                        size={20} 
                        color={selectedProduct?.stock > 0 ? '#4CAF50' : '#F44336'} 
                      />
                      <Text style={[
                        styles.modalStockText,
                        {color: selectedProduct?.stock > 0 ? '#4CAF50' : '#F44336'}
                      ]}>
                        {selectedProduct?.stock || 0} units available
                      </Text>
                    </View>
                  </View>

                  {/* Description */}
                  <View style={styles.descriptionSection}>
                    <Text style={styles.sectionTitle}>Description</Text>
                    <Text style={styles.modalDescription}>
                      {selectedProduct?.description}
                    </Text>
                  </View>

                  {/* Specifications */}
                  <View style={styles.specsSection}>
                    <Text style={styles.sectionTitle}>Specifications</Text>
                    <View style={styles.specsList}>
                      <View style={styles.specItem}>
                        <Ionicons name="barcode-outline" size={18} color="#667eea" />
                        <Text style={styles.specLabel}>Product ID:</Text>
                        <Text style={styles.specValue}>{selectedProduct?._id?.substring(0, 8)}</Text>
                      </View>
                      <View style={styles.specItem}>
                        <Ionicons name="calendar-outline" size={18} color="#667eea" />
                        <Text style={styles.specLabel}>Added on:</Text>
                        <Text style={styles.specValue}>
                          {selectedProduct?.createdAt ? new Date(selectedProduct.createdAt).toLocaleDateString() : 'N/A'}
                        </Text>
                      </View>
                    </View>
                  </View>

              
            
                </View>
              </ScrollView>
            </View>
          </Animated.View>
        </Animated.View>
      </Modal>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#667eea',
  },
  
  // Loading States
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingContent: {
    alignItems: 'center',
    padding: 20,
  },
  loadingIcon: {
    marginBottom: 20,
  },
  loadingText: {
    fontSize: 18,
    color: '#fff',
    fontWeight: '600',
    marginTop: 20,
  },
  
  // Error States
  errorContainer: {
    flex: 1,
  },
  errorContent: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  errorTitle: {
    fontSize: 24,
    color: '#fff',
    fontWeight: 'bold',
    marginTop: 20,
    marginBottom: 10,
  },
  errorText: {
    fontSize: 16,
    color: '#fff',
    textAlign: 'center',
    marginBottom: 30,
  },
  retryButton: {
    backgroundColor: '#fff',
    paddingHorizontal: 30,
    paddingVertical: 12,
    borderRadius: 25,
    marginTop: 20,
  },
  retryButtonText: {
    color: '#FF6B6B',
    fontSize: 16,
    fontWeight: '600',
  },
  
  // Header
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 5,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  headerIcon: {
    marginRight: 10,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#fff',
  },
  headerRight: {
    width: 80,
    alignItems: 'flex-end',
  },
  productCount: {
    fontSize: 12,
    color: '#fff',
    fontWeight: '500',
    backgroundColor: 'rgba(255,255,255,0.2)',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  
  // Main Content
  content: {
    padding: 16,
    paddingBottom: 30,
  },
  
  // Statistics Card
  statsCard: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 20,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 3,
  },
  statsTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 15,
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginTop: 10,
  },
  statItem: {
    width: '48%',
    backgroundColor: '#f8f9fa',
    padding: 12,
    borderRadius: 12,
    marginBottom: 10,
    alignItems: 'center',
  },
  statNumber: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#667eea',
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    color: '#666',
    fontWeight: '500',
  },
  
  // Products Grid
  productsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  productCardWrapper: {
    width: '48%',
    marginBottom: 16,
  },
  productCard: {
    backgroundColor: '#fff',
    borderRadius: 16,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 3,
  },
  
  // Product Image
  imageContainer: {
    position: 'relative',
    height: 150,
  },
  productImage: {
    width: '100%',
    height: '100%',
  },
  placeholderImage: {
    width: '100%',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
  },
  
  // Category Badge
  categoryBadge: {
    position: 'absolute',
    top: 10,
    left: 10,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 2,
  },
  badgeIcon: {
    marginRight: 4,
  },
  categoryBadgeText: {
    color: '#fff',
    fontSize: 10,
    fontWeight: '600',
    textTransform: 'uppercase',
  },
  
  // Product Info
  productInfo: {
    padding: 12,
  },
  productName: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
    marginBottom: 8,
    lineHeight: 18,
  },
  
  // Stock Indicator
  stockContainer: {
    marginBottom: 8,
  },
  stockIndicator: {
    height: 6,
    backgroundColor: '#f0f0f0',
    borderRadius: 3,
    overflow: 'hidden',
    marginBottom: 4,
  },
  stockBar: {
    height: '100%',
    borderRadius: 3,
  },
  stockText: {
    fontSize: 10,
    fontWeight: '500',
  },
  
  // Description
  productDescription: {
    fontSize: 11,
    color: '#666',
    lineHeight: 16,
    marginBottom: 8,
  },
  
  // Educational Label
  educationalLabel: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 4,
  },
  educationalText: {
    fontSize: 9,
    color: '#667eea',
    fontWeight: '500',
    marginLeft: 4,
  },
  
  // Pagination
  paginationContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 20,
    marginBottom: 30,
    paddingHorizontal: 10,
  },
  paginationButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#667eea',
    paddingHorizontal: 15,
    paddingVertical: 10,
    borderRadius: 25,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 3,
    minWidth: 100,
  },
  disabledButton: {
    backgroundColor: '#e0e0e0',
  },
  paginationButtonText: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 14,
    marginHorizontal: 8,
  },
  pageInfo: {
    alignItems: 'center',
  },
  pageText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
  },
  totalText: {
    fontSize: 12,
    color: '#666',
    marginTop: 2,
  },
  
  // Loading More
  loadingMoreContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  loadingMoreText: {
    marginLeft: 10,
    color: '#667eea',
    fontSize: 14,
  },
  
  // Empty State
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#666',
    marginTop: 20,
    marginBottom: 10,
  },
  emptyText: {
    fontSize: 14,
    color: '#999',
    textAlign: 'center',
    paddingHorizontal: 40,
  },
  
  // Modal Styles
  modalBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.7)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modalContentWrapper: {
    width: '100%',
    maxWidth: 500,
    height: '80%',
  },
  modalContent: {
    flex: 1,
    backgroundColor: '#fff',
    borderRadius: 20,
    overflow: 'hidden',
  },
  
  // Modal Header
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
  },
  modalHeaderTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#fff',
  },
  modalCloseButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(255,255,255,0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  
  // Modal Body
  modalBody: {
    flex: 1,
  },
  
  // Image Gallery
  imageGallery: {
    padding: 16,
  },
  galleryImageContainer: {
    width: 200,
    height: 150,
    borderRadius: 12,
    overflow: 'hidden',
    marginRight: 12,
  },
  galleryImage: {
    width: '100%',
    height: '100%',
  },
  
  // Modal Info
  modalInfoContainer: {
    padding: 20,
  },
  modalProductName: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 12,
  },
  
  // Modal Category
  modalCategoryContainer: {
    marginBottom: 16,
  },
  modalCategoryBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  modalCategoryText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '600',
    marginLeft: 6,
    textTransform: 'uppercase',
  },
  
  // Modal Stock
  modalStockContainer: {
    backgroundColor: '#f8f9fa',
    padding: 12,
    borderRadius: 12,
    marginBottom: 20,
  },
  modalStockInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  modalStockText: {
    fontSize: 14,
    fontWeight: '600',
    marginLeft: 8,
  },
  
  // Description Section
  descriptionSection: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 8,
  },
  modalDescription: {
    fontSize: 14,
    color: '#666',
    lineHeight: 22,
  },
  
  // Specifications
  specsSection: {
    marginBottom: 24,
  },
  specsList: {
    backgroundColor: '#f8f9fa',
    borderRadius: 12,
    padding: 16,
  },
  specItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  specLabel: {
    fontSize: 14,
    color: '#666',
    marginLeft: 12,
    marginRight: 8,
  },
  specValue: {
    fontSize: 14,
    color: '#333',
    fontWeight: '500',
  },
  
  // Educational Notice
  educationalNotice: {
    backgroundColor: '#e3f2fd',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
  },
  educationalNoticeTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1976d2',
    marginTop: 8,
    marginBottom: 4,
  },
  educationalNoticeText: {
    fontSize: 12,
    color: '#1976d2',
    textAlign: 'center',
    lineHeight: 18,
  },
});

export default ProductListingScreen;