import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  Modal,
  TouchableOpacity,
  Alert,
  Dimensions,
  TextInput,
  FlatList
} from 'react-native';
import { useQuery, useMutation } from '@tanstack/react-query';
import axios from 'axios';
import LinearGradient from 'react-native-linear-gradient';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { Picker } from '@react-native-picker/picker';
import AsyncStorage from '@react-native-async-storage/async-storage';

const { width, height } = Dimensions.get('window');

const DistributorOrders = ({ navigation }) => {
  const [isOrderModalVisible, setIsOrderModalVisible] = useState(false);
  const [isViewModalVisible, setIsViewModalVisible] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [products, setProducts] = useState([]);
  const [selectedProducts, setSelectedProducts] = useState([]);
  const [paymentMethod, setPaymentMethod] = useState('cash-on-delivery');
  const [distributorNotes, setDistributorNotes] = useState('');

  // Fetch products
  const { data: productsData } = useQuery({
    queryKey: ['products'],
    queryFn: async () => {
      const response = await axios.get('/products');
      return response.data;
    }
  });

  // Fetch distributor orders
  const { data: ordersData, refetch, isLoading } = useQuery({
    queryKey: ['distributor-orders'],
    queryFn: async () => {
      let user = await AsyncStorage.getItem('user');
      if (user) {
        user = JSON.parse(user);
        if (user?.role === 'distributor') {
          const response = await axios.get(`/orders/distributor?distributorId=${user._id}`);
          return response.data;
        }
      }
    }
  });

  // Create order mutation
  const createOrderMutation = useMutation({
    mutationFn: async (orderData) => {
      const response = await axios.post('/orders', orderData);
      return response.data;
    },
    onSuccess: () => {
      Alert.alert('Success', 'Order created successfully!');
      setIsOrderModalVisible(false);
      resetForm();
      refetch();
    },
    onError: (error) => {
      Alert.alert('Error', error.response?.data?.message || 'Failed to create order');
    }
  });

  useEffect(() => {
    if (productsData?.data) {
      setProducts(productsData.data);
    }
  }, [productsData]);

  const statusColors = {
    pending: '#FFA500',
    approved: '#52C41A',
    rejected: '#FF4D4F',
    shipped: '#1890FF',
    delivered: '#722ED1'
  };

  const resetForm = () => {
    setSelectedProducts([]);
    setPaymentMethod('cash-on-delivery');
    setDistributorNotes('');
  };

  const handleCreateOrder = async () => {
    if (selectedProducts.length === 0) {
      Alert.alert('Error', 'Please add at least one product');
      return;
    }

    let user = await AsyncStorage.getItem('user'); 
    if (user) {
      user = JSON.parse(user);
    }
    
    const orderData = {
      items: selectedProducts,
      paymentMethod,
      distributorNotes,
      distributorId: user._id,
    };
    createOrderMutation.mutate(orderData);
  };

  const handleViewOrder = (order) => {
    setSelectedOrder(order);
    setIsViewModalVisible(true);
  };

  const handleAddProduct = () => {
    setSelectedProducts([
      ...selectedProducts,
      { product: '', quantity: 1, price: 0, productName: '' }
    ]);
  };

  const handleProductChange = (index, field, value) => {
    const updatedProducts = [...selectedProducts];
    updatedProducts[index][field] = value;
    
    if (field === 'product') {
      const selectedProduct = products.find(p => p._id === value);
      if (selectedProduct) {
        updatedProducts[index].price = selectedProduct.price;
        updatedProducts[index].productName = selectedProduct.name;
      }
    }
    
    setSelectedProducts(updatedProducts);
  };

  const handleRemoveProduct = (index) => {
    const updatedProducts = selectedProducts.filter((_, i) => i !== index);
    setSelectedProducts(updatedProducts);
  };

  const calculateTotal = () => {
    return selectedProducts.reduce((total, item) => {
      return total + (item.price * item.quantity);
    }, 0);
  };

  const getProductStock = (productId) => {
    const product = products.find(p => p._id === productId);
    return product ? product.stock : 0;
  };

  const OrderItem = ({ item }) => (
    <TouchableOpacity 
      style={styles.orderItem}
      onPress={() => handleViewOrder(item)}
      activeOpacity={0.7}
    >
      <LinearGradient
        colors={['#667eea', '#764ba2']}
        style={styles.orderItemGradient}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
      >
        <View style={styles.orderItemHeader}>
          <View style={styles.orderInfo}>
            <Icon name="receipt" size={20} color="#fff" />
            <Text style={styles.orderNumber}>{item.orderNumber}</Text>
          </View>
          <View style={[styles.statusBadge, { backgroundColor: statusColors[item.status] }]}>
            <Text style={styles.statusText}>{item.status.toUpperCase()}</Text>
          </View>
        </View>
        
        <View style={styles.orderItemBody}>
          <View style={styles.amountSection}>
            <Icon name="currency-inr" size={18} color="#fff" />
            <Text style={styles.orderAmount}>₹{item.totalAmount}</Text>
          </View>
          
          <View style={styles.paymentSection}>
            <Icon 
              name={item.paymentMethod === 'cash-on-delivery' ? 'cash' : 'gift'} 
              size={16} 
              color="#fff" 
            />
            <Text style={styles.paymentText}>
              {item.paymentMethod === 'cash-on-delivery' ? 'COD' : 'Reward'}
            </Text>
          </View>

          <View style={styles.dateSection}>
            <Icon name="calendar" size={14} color="#fff" />
            <Text style={styles.orderDate}>
              {new Date(item.createdAt).toLocaleDateString()}
            </Text>
          </View>
        </View>

        <View style={styles.orderItemFooter}>
          <Text style={styles.viewDetailsText}>
            Tap to view details <Icon name="chevron-right" size={16} color="#fff" />
          </Text>
        </View>
      </LinearGradient>
    </TouchableOpacity>
  );

  const ProductItem = ({ item, index }) => (
    <View style={styles.productItem}>
      <View style={styles.productHeader}>
        <Text style={styles.productTitle}>Product #{index + 1}</Text>
        <TouchableOpacity 
          style={styles.deleteButton}
          onPress={() => handleRemoveProduct(index)}
        >
          <Icon name="close-circle" size={24} color="#FF4D4F" />
        </TouchableOpacity>
      </View>
      
      <View style={styles.pickerContainer}>
        <Picker
          selectedValue={item.product}
          onValueChange={(value) => handleProductChange(index, 'product', value)}
          style={styles.picker}
        >
          <Picker.Item label="Select Product" value="" />
          {products.map(product => (
            <Picker.Item 
              key={product._id} 
              label={`${product.name} (Stock: ${product.stock})`} 
              value={product._id} 
            />
          ))}
        </Picker>
      </View>

      <View style={styles.quantityRow}>
        <Text style={styles.quantityLabel}>Quantity:</Text>
        <View style={styles.quantityControls}>
          <TouchableOpacity 
            style={styles.quantityButton}
            onPress={() => {
              if (item.quantity > 1) {
                handleProductChange(index, 'quantity', item.quantity - 1);
              }
            }}
          >
            <Icon name="minus" size={20} color="#fff" />
          </TouchableOpacity>
          <Text style={styles.quantityText}>{item.quantity}</Text>
          <TouchableOpacity 
            style={styles.quantityButton}
            onPress={() => {
              const maxStock = getProductStock(item.product);
              if (item.quantity < maxStock) {
                handleProductChange(index, 'quantity', item.quantity + 1);
              }
            }}
          >
            <Icon name="plus" size={20} color="#fff" />
          </TouchableOpacity>
        </View>
      </View>

      <View style={styles.priceRow}>
        <Text style={styles.priceText}>Price: ₹{item.price}</Text>
        <Text style={styles.subtotalText}>Subtotal: ₹{item.price * item.quantity}</Text>
      </View>
    </View>
  );

  return (
    <View style={styles.container}>
      {/* Header with Back Button */}
      <LinearGradient
        colors={['#667eea', '#764ba2']}
        style={styles.header}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
      >
        <View style={styles.headerContent}>
          <View style={styles.headerLeft}>
            <TouchableOpacity 
              style={styles.backButton}
              onPress={() => navigation.goBack()}
            >
              <LinearGradient
                colors={['#fff', '#f8f9fa']}
                style={styles.backButtonGradient}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
              >
                <Icon name="arrow-left" size={20} color="#667eea" />
              </LinearGradient>
            </TouchableOpacity>
            <View style={styles.headerTitleContainer}>
              <Icon name="cart" size={28} color="#fff" />
              <Text style={styles.headerTitle}>My Orders</Text>
            </View>
          </View>
          <TouchableOpacity 
            style={styles.newOrderButton}
            onPress={() => setIsOrderModalVisible(true)}
          >
            <LinearGradient
              colors={['#43e97b', '#38f9d7']}
              style={styles.newOrderGradient}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
            >
              <Icon name="plus" size={20} color="#fff" />
              <Text style={styles.newOrderText}>New Order</Text>
            </LinearGradient>
          </TouchableOpacity>
        </View>
      </LinearGradient>

      {/* Orders List - Single Row Layout */}
      <View style={styles.ordersContainer}>
        {isLoading ? (
          <View style={styles.loadingContainer}>
            <Icon name="loading" size={40} color="#1890FF" />
            <Text style={styles.loadingText}>Loading orders...</Text>
          </View>
        ) : (
          <FlatList
            data={ordersData?.data || []}
            renderItem={({ item }) => <OrderItem item={item} />}
            keyExtractor={item => item._id}
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.ordersList}
            ListEmptyComponent={
              <View style={styles.emptyContainer}>
                <Icon name="cart-off" size={60} color="#ccc" />
                <Text style={styles.emptyText}>No orders found</Text>
                <Text style={styles.emptySubtext}>Create your first order to get started</Text>
              </View>
            }
          />
        )}
      </View>

      {/* Create Order Modal */}
      <Modal
        visible={isOrderModalVisible}
        animationType="slide"
        transparent={true}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContainer}>
            <LinearGradient
              colors={['#667eea', '#764ba2']}
              style={styles.modalHeader}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
            >
              <Text style={styles.modalTitle}>Create New Order</Text>
              <TouchableOpacity 
                style={styles.closeButton}
                onPress={() => {
                  setIsOrderModalVisible(false);
                  resetForm();
                }}
              >
                <Icon name="close" size={24} color="#fff" />
              </TouchableOpacity>
            </LinearGradient>

            <ScrollView style={styles.modalContent} showsVerticalScrollIndicator={false}>
              {/* Order Items */}
              <View style={styles.section}>
                <View style={styles.sectionHeader}>
                  <Icon name="package-variant" size={20} color="#1890FF" />
                  <Text style={styles.sectionTitle}>Order Items</Text>
                </View>
                {selectedProducts.map((item, index) => (
                  <ProductItem key={index} item={item} index={index} />
                ))}
                <TouchableOpacity 
                  style={styles.addProductButton}
                  onPress={handleAddProduct}
                >
                  <LinearGradient
                    colors={['#4facfe', '#00f2fe']}
                    style={styles.addProductGradient}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 1 }}
                  >
                    <Icon name="plus" size={20} color="#fff" />
                    <Text style={styles.addProductText}>Add Product</Text>
                  </LinearGradient>
                </TouchableOpacity>
              </View>

              {/* Order Summary */}
              <View style={styles.section}>
                <View style={styles.sectionHeader}>
                  <Icon name="chart-bar" size={20} color="#52C41A" />
                  <Text style={styles.sectionTitle}>Order Summary</Text>
                </View>
                <View style={styles.summaryCard}>
                  <View style={styles.summaryRow}>
                    <Text style={styles.summaryLabel}>Total Amount:</Text>
                    <Text style={styles.summaryValue}>₹{calculateTotal()}</Text>
                  </View>
                </View>
              </View>

              {/* Payment Method */}
              <View style={styles.section}>
                <View style={styles.sectionHeader}>
                  <Icon name="credit-card" size={20} color="#FAAD14" />
                  <Text style={styles.sectionTitle}>Payment Method</Text>
                </View>
                <View style={styles.paymentOptions}>
                  <TouchableOpacity 
                    style={[
                      styles.paymentOption,
                      paymentMethod === 'cash-on-delivery' && styles.paymentOptionSelected
                    ]}
                    onPress={() => setPaymentMethod('cash-on-delivery')}
                  >
                    <Icon 
                      name="cash" 
                      size={24} 
                      color={paymentMethod === 'cash-on-delivery' ? '#fff' : '#666'} 
                    />
                    <Text style={[
                      styles.paymentText,
                      paymentMethod === 'cash-on-delivery' && styles.paymentTextSelected
                    ]}>
                      Cash on Delivery
                    </Text>
                  </TouchableOpacity>
                  <TouchableOpacity 
                    style={[
                      styles.paymentOption,
                      paymentMethod === 'reward-payment' && styles.paymentOptionSelected
                    ]}
                    onPress={() => setPaymentMethod('reward-payment')}
                  >
                    <Icon 
                      name="gift" 
                      size={24} 
                      color={paymentMethod === 'reward-payment' ? '#fff' : '#666'} 
                    />
                    <Text style={[
                      styles.paymentText,
                      paymentMethod === 'reward-payment' && styles.paymentTextSelected
                    ]}>
                      Reward Payment
                    </Text>
                  </TouchableOpacity>
                </View>
              </View>

              {/* Notes */}
              <View style={styles.section}>
                <View style={styles.sectionHeader}>
                  <Icon name="note-text" size={20} color="#722ED1" />
                  <Text style={styles.sectionTitle}>Additional Notes</Text>
                </View>
                <TextInput
                  style={styles.notesInput}
                  value={distributorNotes}
                  onChangeText={setDistributorNotes}
                  placeholder="Any additional notes..."
                  multiline
                  numberOfLines={3}
                  textAlignVertical="top"
                />
              </View>
            </ScrollView>

            <View style={styles.modalActions}>
              <TouchableOpacity 
                style={styles.cancelButton}
                onPress={() => {
                  setIsOrderModalVisible(false);
                  resetForm();
                }}
              >
                <Text style={styles.cancelButtonText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity 
                style={[
                  styles.createButton,
                  selectedProducts.length === 0 && styles.createButtonDisabled
                ]}
                onPress={handleCreateOrder}
                disabled={selectedProducts.length === 0 || createOrderMutation.isPending}
              >
                <LinearGradient
                  colors={selectedProducts.length === 0 ? ['#ccc', '#999'] : ['#43e97b', '#38f9d7']}
                  style={styles.createButtonGradient}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}
                >
                  {createOrderMutation.isPending ? (
                    <Icon name="loading" size={20} color="#fff" />
                  ) : (
                    <Icon name="check" size={20} color="#fff" />
                  )}
                  <Text style={styles.createButtonText}>
                    {createOrderMutation.isPending ? 'Creating...' : 'Create Order'}
                  </Text>
                </LinearGradient>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* View Order Modal */}
      <Modal
        visible={isViewModalVisible}
        animationType="slide"
        transparent={true}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContainer}>
            <LinearGradient
              colors={['#667eea', '#764ba2']}
              style={styles.modalHeader}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
            >
              <Text style={styles.modalTitle}>
                Order Details - {selectedOrder?.orderNumber}
              </Text>
              <TouchableOpacity 
                style={styles.closeButton}
                onPress={() => setIsViewModalVisible(false)}
              >
                <Icon name="close" size={24} color="#fff" />
              </TouchableOpacity>
            </LinearGradient>

            <ScrollView style={styles.modalContent} showsVerticalScrollIndicator={false}>
              {selectedOrder && (
                <>
                  {/* Order Basic Info */}
                  <View style={styles.infoGrid}>
                    <View style={styles.infoItem}>
                      <Icon name="receipt" size={20} color="#1890FF" />
                      <Text style={styles.infoLabel}>Order Number</Text>
                      <Text style={styles.infoValue}>{selectedOrder.orderNumber}</Text>
                    </View>
                    <View style={styles.infoItem}>
                      <Icon name="information" size={20} color="#52C41A" />
                      <Text style={styles.infoLabel}>Status</Text>
                      <View style={[styles.statusBadge, { backgroundColor: statusColors[selectedOrder.status] }]}>
                        <Text style={styles.statusText}>{selectedOrder.status.toUpperCase()}</Text>
                      </View>
                    </View>
                    <View style={styles.infoItem}>
                      <Icon name="currency-inr" size={20} color="#FAAD14" />
                      <Text style={styles.infoLabel}>Total Amount</Text>
                      <Text style={styles.infoValue}>₹{selectedOrder.totalAmount}</Text>
                    </View>
                    <View style={styles.infoItem}>
                      <Icon name="credit-card" size={20} color="#722ED1" />
                      <Text style={styles.infoLabel}>Payment Method</Text>
                      <Text style={styles.infoValue}>
                        {selectedOrder.paymentMethod === 'cash-on-delivery' ? 'Cash on Delivery' : 'Reward Payment'}
                      </Text>
                    </View>
                  </View>

                  {/* Order Items */}
                  <View style={styles.section}>
                    <View style={styles.sectionHeader}>
                      <Icon name="package-variant" size={20} color="#1890FF" />
                      <Text style={styles.sectionTitle}>Order Items</Text>
                    </View>
                    {selectedOrder.items?.map((item, index) => (
                      <View key={index} style={styles.orderItemCard}>
                        <Text style={styles.itemName}>
                          {item.product?.name || 'Product'}
                        </Text>
                        <View style={styles.itemDetails}>
                          <Text style={styles.itemDetail}>Quantity: {item.quantity}</Text>
                          <Text style={styles.itemDetail}>Price: ₹{item.price}</Text>
                          <Text style={styles.itemDetail}>Subtotal: ₹{item.price * item.quantity}</Text>
                        </View>
                      </View>
                    ))}
                  </View>

                  {/* Notes */}
                  {selectedOrder.distributorNotes && (
                    <View style={styles.section}>
                      <View style={styles.sectionHeader}>
                        <Icon name="note-text" size={20} color="#FF6B6B" />
                        <Text style={styles.sectionTitle}>Distributor Notes</Text>
                      </View>
                      <Text style={styles.notesText}>{selectedOrder.distributorNotes}</Text>
                    </View>
                  )}

                  {selectedOrder.adminNotes && (
                    <View style={styles.section}>
                      <View style={styles.sectionHeader}>
                        <Icon name="note-text" size={20} color="#FF6B6B" />
                        <Text style={styles.sectionTitle}>Admin Notes</Text>
                      </View>
                      <Text style={styles.notesText}>{selectedOrder.adminNotes}</Text>
                    </View>
                  )}
                </>
              )}
            </ScrollView>

            <View style={styles.modalActions}>
              <TouchableOpacity 
                style={styles.closeDetailButton}
                onPress={() => setIsViewModalVisible(false)}
              >
                <LinearGradient
                  colors={['#4facfe', '#00f2fe']}
                  style={styles.closeDetailGradient}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}
                >
                  <Icon name="close" size={20} color="#fff" />
                  <Text style={styles.closeDetailText}>Close</Text>
                </LinearGradient>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  header: {
    padding: 24,
    paddingTop: 50,
    borderBottomLeftRadius: 30,
    borderBottomRightRadius: 30,
  },
  headerContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  backButton: {
    marginRight: 15,
    borderRadius: 20,
    overflow: 'hidden',
  },
  backButtonGradient: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  headerTitleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff',
    marginLeft: 12,
  },
  newOrderButton: {
    borderRadius: 25,
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
  },
  newOrderGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 25,
  },
  newOrderText: {
    color: '#fff',
    fontWeight: 'bold',
    marginLeft: 8,
  },
  ordersContainer: {
    flex: 1,
  },
  ordersList: {
    padding: 16,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 40,
  },
  loadingText: {
    marginTop: 12,
    fontSize: 16,
    color: '#666',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 40,
  },
  emptyText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#666',
    marginTop: 16,
  },
  emptySubtext: {
    fontSize: 14,
    color: '#999',
    marginTop: 8,
    textAlign: 'center',
  },
  orderItem: {
    marginBottom: 16,
    borderRadius: 20,
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
  },
  orderItemGradient: {
    padding: 20,
    borderRadius: 20,
  },
  orderItemHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 15,
  },
  orderInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  orderNumber: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#fff',
    marginLeft: 8,
  },
  statusBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 15,
  },
  statusText: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#fff',
  },
  orderItemBody: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 15,
  },
  amountSection: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  orderAmount: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#fff',
    marginLeft: 4,
  },
  paymentSection: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  paymentText: {
    fontSize: 14,
    color: '#fff',
    marginLeft: 4,
  },
  dateSection: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  orderDate: {
    fontSize: 12,
    color: '#fff',
    marginLeft: 4,
  },
  orderItemFooter: {
    alignItems: 'flex-end',
  },
  viewDetailsText: {
    fontSize: 12,
    color: '#fff',
    fontStyle: 'italic',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContainer: {
    width: width * 0.9,
    maxHeight: height * 0.8,
    backgroundColor: '#fff',
    borderRadius: 20,
    overflow: 'hidden',
    elevation: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.3,
    shadowRadius: 20,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#fff',
  },
  closeButton: {
    padding: 4,
  },
  modalContent: {
    maxHeight: height * 0.6,
    padding: 20,
  },
  section: {
    marginBottom: 24,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginLeft: 12,
  },
  productItem: {
    backgroundColor: '#f8f9fa',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderLeftWidth: 4,
    borderLeftColor: '#1890FF',
  },
  productHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  productTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#333',
  },
  deleteButton: {
    padding: 4,
  },
  pickerContainer: {
    borderWidth: 1,
    borderColor: '#e8e8e8',
    borderRadius: 8,
    marginBottom: 12,
    overflow: 'hidden',
  },
  picker: {
    backgroundColor: '#f8f9fa',
  },
  quantityRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  quantityLabel: {
    fontSize: 14,
    color: '#666',
  },
  quantityControls: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  quantityButton: {
    backgroundColor: '#1890FF',
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  quantityText: {
    marginHorizontal: 16,
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
  },
  priceRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  priceText: {
    fontSize: 14,
    color: '#666',
  },
  subtotalText: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#1890FF',
  },
  addProductButton: {
    borderRadius: 12,
    overflow: 'hidden',
  },
  addProductGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
  },
  addProductText: {
    color: '#fff',
    fontWeight: 'bold',
    marginLeft: 8,
  },
  summaryCard: {
    backgroundColor: '#f8f9fa',
    borderRadius: 12,
    padding: 16,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  summaryLabel: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
  },
  summaryValue: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1890FF',
  },
  paymentOptions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  paymentOption: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
    marginHorizontal: 4,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#e8e8e8',
    backgroundColor: '#f8f9fa',
  },
  paymentOptionSelected: {
    backgroundColor: '#1890FF',
    borderColor: '#1890FF',
  },
  paymentText: {
    marginLeft: 8,
    fontSize: 14,
    color: '#666',
    fontWeight: '600',
  },
  paymentTextSelected: {
    color: '#fff',
  },
  notesInput: {
    borderWidth: 1,
    borderColor: '#e8e8e8',
    borderRadius: 12,
    padding: 16,
    fontSize: 14,
    minHeight: 80,
    backgroundColor: '#f8f9fa',
  },
  modalActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: 20,
    borderTopWidth: 1,
    borderTopColor: '#e8e8e8',
  },
  cancelButton: {
    flex: 1,
    padding: 16,
    marginRight: 8,
    borderRadius: 12,
    backgroundColor: '#f8f9fa',
    alignItems: 'center',
  },
  cancelButtonText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#666',
  },
  createButton: {
    flex: 2,
    borderRadius: 12,
    overflow: 'hidden',
  },
  createButtonDisabled: {
    opacity: 0.6,
  },
  createButtonGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
  },
  createButtonText: {
    color: '#fff',
    fontWeight: 'bold',
    marginLeft: 8,
  },
  infoGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginBottom: 24,
  },
  infoItem: {
    width: (width - 100) / 2,
    backgroundColor: '#f8f9fa',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    alignItems: 'center',
  },
  infoLabel: {
    fontSize: 12,
    color: '#666',
    marginTop: 8,
    marginBottom: 4,
  },
  infoValue: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#333',
    textAlign: 'center',
  },
  orderItemCard: {
    backgroundColor: '#f8f9fa',
    borderRadius: 12,
    padding: 16,
    marginBottom: 8,
  },
  itemName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 8,
  },
  itemDetails: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    flexWrap: 'wrap',
  },
  itemDetail: {
    fontSize: 12,
    color: '#666',
  },
  notesText: {
    backgroundColor: '#f8f9fa',
    borderRadius: 12,
    padding: 16,
    fontStyle: 'italic',
    color: '#666',
  },
  closeDetailButton: {
    flex: 1,
    borderRadius: 12,
    overflow: 'hidden',
  },
  closeDetailGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
  },
  closeDetailText: {
    color: '#fff',
    fontWeight: 'bold',
    marginLeft: 8,
  },
});

export default DistributorOrders;