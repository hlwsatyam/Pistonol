import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
  Alert,
  RefreshControl,
  Modal,
  TextInput,
  FlatList,
  TextInput as RNTextInput,
  StyleSheet
} from 'react-native';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import axios from 'axios';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { Picker } from '@react-native-picker/picker';
import { SafeAreaView } from 'react-native-safe-area-context';

const CompleteOrderManagement = ({ 
  userType = 'distributor',
  userId,
  isAdmin = false,
  showCreateButton = true 
}) => {
  const navigation = useNavigation();
  const queryClient = useQueryClient();
  
  // State management
  const [refreshing, setRefreshing] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [detailModalVisible, setDetailModalVisible] = useState(false);
  const [createModalVisible, setCreateModalVisible] = useState(false);
  const [deleteModalVisible, setDeleteModalVisible] = useState(false);
  const [statusModalVisible, setStatusModalVisible] = useState(false);
  const [adminNotes, setAdminNotes] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('');
  
  // Create order state
  const [newOrder, setNewOrder] = useState({
    items: [],
    paymentMethod: 'cash-on-delivery',
    distributorNotes: ''
  });
  const [products, setProducts] = useState([]);
  const [selectedProduct, setSelectedProduct] = useState('');
  const [quantity, setQuantity] = useState('1');

  // User type configuration
  const userTypeConfig = {
    distributor: {
      title: 'My Orders',
      color: '#3B82F6',
      icon: '🏢',
      createTitle: 'Create New Order'
    },
    dealer: {
      title: 'My Orders',
      color: '#10B981', 
      icon: '🏪',
      createTitle: 'Create New Order'
    },
    mechanic: {
      title: 'My Orders',
      color: '#F59E0B',
      icon: '🔧',
      createTitle: 'Create New Order'
    },
    'company-employee': {
      title: 'My Orders',
      color: '#8B5CF6',
      icon: '👨‍💼',
      createTitle: 'Create New Order'
    }
  };

  const config = userTypeConfig[userType] || userTypeConfig.distributor;

  // Fetch user orders
  const { 
    data: orders, 
    isLoading, 
    error,
    refetch 
  } = useQuery({
    queryKey: ['userOrders', userType, userId],
    queryFn: async () => {
      const endpoint = isAdmin ? '/orders/admin' : `/orders/user?userId=${userId}&userType=${userType}`;
      const response = await axios.get(endpoint);
      return response.data.data || response.data.orders || [];
    },
    enabled: !!userId
  });

  // Fetch products for creating order
  const { data: productsData } = useQuery({
    queryKey: ['products'],
    queryFn: async () => {
      const response = await axios.get('/products');
      return response.data.data || response.data.products || [];
    }
  });

  // Create order mutation
  const createOrderMutation = useMutation({
    mutationFn: async (orderData) => {
      const response = await axios.post('/orders', {
     ...orderData,
  userId: userId,           // Changed from distributorId to userId
  userType: userType, 
      });
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['userOrders', userType, userId]);
      setCreateModalVisible(false);
      resetNewOrder();
      Alert.alert('Success', 'Order created successfully! 🎉');
    },
    onError: (error) => {
      Alert.alert('Error', error.response?.data?.message || 'Failed to create order');
    }
  });

  // Update status mutation
  const updateStatusMutation = useMutation({
    mutationFn: async ({ orderId, status, notes }) => {
      const response = await axios.put(`/orders/${orderId}/status`, {
        orderId,
        status,
        adminNotes: notes
      });
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['userOrders', userType, userId]);
      setStatusModalVisible(false);
      setSelectedOrder(null);
      setAdminNotes('');
      Alert.alert('Success', 'Order status updated successfully!');
    },
    onError: (error) => {
      Alert.alert('Error', error.response?.data?.message || 'Failed to update status');
    }
  });

  // Delete order mutation
  const deleteOrderMutation = useMutation({
    mutationFn: async (orderId) => {
      const response = await axios.delete(`/orders/${orderId}`);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['userOrders', userType, userId]);
      setDeleteModalVisible(false);
      setSelectedOrder(null);
      Alert.alert('Success', 'Order deleted successfully!');
    },
    onError: (error) => {
      Alert.alert('Error', error.response?.data?.message || 'Failed to delete order');
    }
  });

  // Load products when create modal opens
  useEffect(() => {
    if (createModalVisible && productsData) {
      setProducts(productsData);
    }
  }, [createModalVisible, productsData]);

  const onRefresh = async () => {
    setRefreshing(true);
    await refetch();
    setRefreshing(false);
  };

  const resetNewOrder = () => {
    setNewOrder({
      items: [],
      paymentMethod: 'cash-on-delivery',
      distributorNotes: ''
    });
    setSelectedProduct('');
    setQuantity('1');
  };

  const addProductToOrder = () => {
    if (!selectedProduct || !quantity || quantity < 1) {
      Alert.alert('Error', 'Please select a product and enter valid quantity');
      return;
    }

    const product = products.find(p => p._id === selectedProduct);
    if (!product) return;

    const existingItemIndex = newOrder.items.findIndex(item => item.product === selectedProduct);
    
    if (existingItemIndex > -1) {
      // Update quantity if product already exists
      const updatedItems = [...newOrder.items];
      updatedItems[existingItemIndex].quantity += parseInt(quantity);
      setNewOrder(prev => ({ ...prev, items: updatedItems }));
    } else {
      // Add new product
      setNewOrder(prev => ({
        ...prev,
        items: [
          ...prev.items,
          {
            product: selectedProduct,
            quantity: parseInt(quantity),
            price: product.price,
            productName: product.name
          }
        ]
      }));
    }

    setSelectedProduct('');
    setQuantity('1');
  };

  const removeProductFromOrder = (index) => {
    const updatedItems = newOrder.items.filter((_, i) => i !== index);
    setNewOrder(prev => ({ ...prev, items: updatedItems }));
  };

  const calculateTotal = () => {
    return newOrder.items.reduce((total, item) => total + (item.price * item.quantity), 0);
  };

  const handleCreateOrder = () => {
    if (newOrder.items.length === 0) {
      Alert.alert('Error', 'Please add at least one product to the order');
      return;
    }

    const orderData = {
      items: newOrder.items.map(item => ({
        product: item.product,
        quantity: item.quantity
      })),
      paymentMethod: newOrder.paymentMethod,
      distributorNotes: newOrder.distributorNotes
    };

    createOrderMutation.mutate(orderData);
  };

  const handleStatusUpdate = (order, status) => {
    setSelectedOrder(order);
    setSelectedStatus(status);
    setStatusModalVisible(true);
  };

  const confirmStatusUpdate = () => {
    if (!selectedOrder) return;

    Alert.alert(
      'Confirm Status Update',
      `Are you sure you want to change order #${selectedOrder.orderNumber} status to ${selectedStatus}?`,
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Update', 
          onPress: () => updateStatusMutation.mutate({
            orderId: selectedOrder._id,
            status: selectedStatus,
            notes: adminNotes
          })
        }
      ]
    );
  };

  const handleDeleteOrder = (order) => {
    setSelectedOrder(order);
    setDeleteModalVisible(true);
  };

  const confirmDeleteOrder = () => {
    if (!selectedOrder) return;

    Alert.alert(
      'Confirm Delete',
      `Are you sure you want to delete order #${selectedOrder.orderNumber}? This action cannot be undone.`,
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Delete', 
          style: 'destructive',
          onPress: () => deleteOrderMutation.mutate(selectedOrder._id)
        }
      ]
    );
  };

  const getStatusColor = (status) => {
    const colors = {
      pending: '#F59E0B',
      approved: '#10B981',
      rejected: '#EF4444',
      shipped: '#3B82F6',
      delivered: '#059669'
    };
    return colors[status] || '#6B7280';
  };

  const getStatusIcon = (status) => {
    const icons = {
      pending: 'schedule',
      approved: 'check-circle',
      rejected: 'cancel',
      shipped: 'local-shipping',
      delivered: 'assignment-turned-in'
    };
    return icons[status] || 'help';
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-IN', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const OrderCard = ({ order }) => (
    <View style={styles.orderCard}>
      <View style={styles.orderHeader}>
        <View>
          <Text style={styles.orderNumber}>#{order.orderNumber}</Text>
          <Text style={styles.orderDate}>{formatDate(order.createdAt)}</Text>
        </View>
        <View style={[styles.statusBadge, { backgroundColor: getStatusColor(order.status) }]}>
          <Icon name={getStatusIcon(order.status)} size={16} color="#FFFFFF" />
          <Text style={styles.statusText}>
            {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
          </Text>
        </View>
      </View>

      <View style={styles.orderDetails}>
        <Text style={styles.totalAmount}>₹{order.totalAmount?.toLocaleString()}</Text>
        <Text style={styles.paymentMethod}>
          {order.paymentMethod === 'reward-payment' ? 'Reward Points' : 'Cash on Delivery'}
        </Text>
      </View>

      <View style={styles.itemsSection}>
        <Text style={styles.itemsLabel}>Items ({order.items?.length || 0})</Text>
        {order.items?.slice(0, 2).map((item, index) => (
          <Text key={index} style={styles.itemText}>
            • {item.product?.name} (Qty: {item.quantity})
          </Text>
        ))}
        {order.items?.length > 2 && (
          <Text style={styles.moreItems}>+{order.items.length - 2} more items</Text>
        )}
      </View>

      <View style={styles.actionsRow}>
        <TouchableOpacity 
          style={styles.viewButton}
          onPress={() => {
            setSelectedOrder(order);
            setDetailModalVisible(true);
          }}
        >
          <Icon name="visibility" size={18} color={config.color} />
          <Text style={[styles.viewButtonText, { color: config.color }]}>View</Text>
        </TouchableOpacity>

        {isAdmin && order.status === 'pending' && (
          <>
            <TouchableOpacity 
              style={[styles.actionButton, { backgroundColor: '#10B981' }]}
              onPress={() => handleStatusUpdate(order, 'approved')}
            >
              <Icon name="check" size={18} color="#FFFFFF" />
              <Text style={styles.actionButtonText}>Approve</Text>
            </TouchableOpacity>

            <TouchableOpacity 
              style={[styles.actionButton, { backgroundColor: '#EF4444' }]}
              onPress={() => handleStatusUpdate(order, 'rejected')}
            >
              <Icon name="close" size={18} color="#FFFFFF" />
              <Text style={styles.actionButtonText}>Reject</Text>
            </TouchableOpacity>
          </>
        )}

        {!isAdmin && order.status === 'pending' && (
          <TouchableOpacity 
            style={[styles.actionButton, { backgroundColor: '#EF4444' }]}
            onPress={() => handleDeleteOrder(order)}
          >
            <Icon name="delete" size={18} color="#FFFFFF" />
            <Text style={styles.actionButtonText}>Delete</Text>
          </TouchableOpacity>
        )}
      </View>

      {order.distributorNotes && (
        <View style={styles.notesSection}>
          <Text style={styles.notesLabel}>Your Notes:</Text>
          <Text style={styles.notesText}>{order.distributorNotes}</Text>
        </View>
      )}

      {order.adminNotes && (
        <View style={styles.notesSection}>
          <Text style={styles.notesLabel}>Admin Notes:</Text>
          <Text style={styles.notesText}>{order.adminNotes}</Text>
        </View>
      )}
    </View>
  );

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={config.color} />
        <Text style={styles.loadingText}>Loading orders...</Text>
      </View>
    );
  }

  return (
    <SafeAreaView style={{flex:1}}>


  <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <View style={[styles.headerIcon, { backgroundColor: config.color }]}>
          <Text style={styles.headerIconText}>{config.icon}</Text>
        </View>
        <View style={styles.headerText}>
          <Text style={styles.headerTitle}>
            {isAdmin ? `All ${userType} Orders` : config.title}
          </Text>
          <Text style={styles.headerSubtitle}>
            {orders?.length || 0} orders found
          </Text>
        </View>
        
        {showCreateButton && !isAdmin && (
          <TouchableOpacity 
            style={[styles.createButton, { backgroundColor: config.color }]}
            onPress={() => setCreateModalVisible(true)}
          >
            <Icon name="add" size={20} color="#FFFFFF" />
            <Text style={styles.createButtonText}>New Order</Text>
          </TouchableOpacity>
        )}
      </View>

      {/* Orders List */}
      <FlatList
        data={orders || []}
        renderItem={({ item }) => <OrderCard order={item} />}
        keyExtractor={(item) => item._id}
        refreshControl={
          <RefreshControl 
            refreshing={refreshing} 
            onRefresh={onRefresh}
            colors={[config.color]}
          />
        }
        contentContainerStyle={styles.listContent}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Icon name="receipt" size={60} color="#9CA3AF" />
            <Text style={styles.emptyTitle}>No orders found</Text>
            <Text style={styles.emptyMessage}>
              {isAdmin ? 'No orders have been placed yet.' : "You haven't placed any orders yet."}
            </Text>
            {showCreateButton && !isAdmin && (
              <TouchableOpacity 
                style={[styles.emptyButton, { backgroundColor: config.color }]}
                onPress={() => setCreateModalVisible(true)}
              >
                <Text style={styles.emptyButtonText}>Create Your First Order</Text>
              </TouchableOpacity>
            )}
          </View>
        }
      />

      {/* Create Order Modal */}
      <Modal
        visible={createModalVisible}
        animationType="slide"
        onRequestClose={() => setCreateModalVisible(false)}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <TouchableOpacity 
              onPress={() => setCreateModalVisible(false)}
              style={styles.backButton}
            >
              <Icon name="arrow-back" size={24} color="#000" />
            </TouchableOpacity>
            <Text style={styles.modalTitle}>{config.createTitle}</Text>
            <View style={styles.placeholder} />
          </View>

          <ScrollView style={styles.modalContent}>
            {/* Product Selection */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Add Products</Text>
              
              <View style={styles.productSelection}>
                <View style={styles.pickerContainer}>
                  <Picker
                    selectedValue={selectedProduct}
                    onValueChange={setSelectedProduct}
                    style={styles.picker}
                  >
                    <Picker.Item label="Select Product" value="" />
                    {products.map(product => (
                      <Picker.Item 
                        key={product._id} 
                        label={`${product.name} - ₹${product.price} (Stock: ${product.stock})`} 
                        value={product._id} 
                      />
                    ))}
                  </Picker>
                </View>
                
                <View style={styles.quantityContainer}>
                  <TextInput
                    style={styles.quantityInput}
                    value={quantity}
                    onChangeText={setQuantity}
                    placeholder="Qty"
                    keyboardType="numeric"
                  />
                  <TouchableOpacity 
                    style={[styles.addButton, { backgroundColor: config.color }]}
                    onPress={addProductToOrder}
                  >
                    <Icon name="add" size={20} color="#FFFFFF" />
                    <Text style={styles.addButtonText}>Add</Text>
                  </TouchableOpacity>
                </View>
              </View>

              {/* Selected Products List */}
              {newOrder.items.length > 0 && (
                <View style={styles.selectedProducts}>
                  <Text style={styles.selectedProductsTitle}>Selected Products:</Text>
                  {newOrder.items.map((item, index) => (
                    <View key={index} style={styles.selectedProductItem}>
                      <View style={styles.productInfo}>
                        <Text style={styles.productName}>{item.productName}</Text>
                        <Text style={styles.productDetails}>
                          Qty: {item.quantity} × ₹{item.price} = ₹{item.quantity * item.price}
                        </Text>
                      </View>
                      <TouchableOpacity 
                        onPress={() => removeProductFromOrder(index)}
                        style={styles.removeButton}
                      >
                        <Icon name="delete" size={18} color="#EF4444" />
                      </TouchableOpacity>
                    </View>
                  ))}
                  <View style={styles.totalSection}>
                    <Text style={styles.totalText}>
                      Total: ₹{calculateTotal().toLocaleString()}
                    </Text>
                  </View>
                </View>
              )}
            </View>

            {/* Payment Method */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Payment Method</Text>
              <View style={styles.paymentOptions}>
                <TouchableOpacity
                  style={[
                    styles.paymentOption,
                    newOrder.paymentMethod === 'cash-on-delivery' && styles.paymentOptionSelected
                  ]}
                  onPress={() => setNewOrder(prev => ({ ...prev, paymentMethod: 'cash-on-delivery' }))}
                >
                  <Icon 
                    name={newOrder.paymentMethod === 'cash-on-delivery' ? 'radio-button-checked' : 'radio-button-unchecked'} 
                    size={20} 
                    color={config.color} 
                  />
                  <Text style={styles.paymentOptionText}>Cash on Delivery</Text>
                </TouchableOpacity>
                
                <TouchableOpacity
                  style={[
                    styles.paymentOption,
                    newOrder.paymentMethod === 'reward-payment' && styles.paymentOptionSelected
                  ]}
                  onPress={() => setNewOrder(prev => ({ ...prev, paymentMethod: 'reward-payment' }))}
                >
                  <Icon 
                    name={newOrder.paymentMethod === 'reward-payment' ? 'radio-button-checked' : 'radio-button-unchecked'} 
                    size={20} 
                    color={config.color} 
                  />
                  <Text style={styles.paymentOptionText}>Reward Points</Text>
                </TouchableOpacity>
              </View>
            </View>

            {/* Notes */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Order Notes (Optional)</Text>
              <TextInput
                style={styles.notesInput}
                value={newOrder.distributorNotes}
                onChangeText={(text) => setNewOrder(prev => ({ ...prev, distributorNotes: text }))}
                placeholder="Add any special instructions or notes..."
                multiline
                numberOfLines={3}
              />
            </View>

            {/* Create Button */}
            <TouchableOpacity
              style={[styles.submitButton, { backgroundColor: config.color }]}
              onPress={handleCreateOrder}
              disabled={createOrderMutation.isLoading || newOrder.items.length === 0}
            >
              {createOrderMutation.isLoading ? (
                <ActivityIndicator color="#FFFFFF" />
              ) : (
                <>
                  <Icon name="check-circle" size={20} color="#FFFFFF" />
                  <Text style={styles.submitButtonText}>
                    Create Order - ₹{calculateTotal().toLocaleString()}
                  </Text>
                </>
              )}
            </TouchableOpacity>
          </ScrollView>
        </View>
      </Modal>

      {/* Order Details Modal */}
      <Modal
        visible={detailModalVisible}
        animationType="slide"
        onRequestClose={() => setDetailModalVisible(false)}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <TouchableOpacity 
              onPress={() => setDetailModalVisible(false)}
              style={styles.backButton}
            >
              <Icon name="arrow-back" size={24} color="#000" />
            </TouchableOpacity>
            <Text style={styles.modalTitle}>
              Order #{selectedOrder?.orderNumber}
            </Text>
            <View style={styles.placeholder} />
          </View>

          {selectedOrder && (
            <ScrollView style={styles.modalContent}>
              <View style={styles.detailSection}>
                <Text style={styles.detailLabel}>Order Details</Text>
                <View style={styles.detailRow}>
                  <Text style={styles.detailKey}>Order Number:</Text>
                  <Text style={styles.detailValue}>#{selectedOrder.orderNumber}</Text>
                </View>
                <View style={styles.detailRow}>
                  <Text style={styles.detailKey}>Status:</Text>
                  <View style={[styles.statusBadge, { backgroundColor: getStatusColor(selectedOrder.status) }]}>
                    <Text style={styles.statusText}>
                      {selectedOrder.status.charAt(0).toUpperCase() + selectedOrder.status.slice(1)}
                    </Text>
                  </View>
                </View>
                <View style={styles.detailRow}>
                  <Text style={styles.detailKey}>Total Amount:</Text>
                  <Text style={styles.detailValue}>₹{selectedOrder.totalAmount?.toLocaleString()}</Text>
                </View>
                <View style={styles.detailRow}>
                  <Text style={styles.detailKey}>Payment Method:</Text>
                  <Text style={styles.detailValue}>
                    {selectedOrder.paymentMethod === 'reward-payment' ? 'Reward Points' : 'Cash on Delivery'}
                  </Text>
                </View>
                <View style={styles.detailRow}>
                  <Text style={styles.detailKey}>Order Date:</Text>
                  <Text style={styles.detailValue}>{formatDate(selectedOrder.createdAt)}</Text>
                </View>
              </View>

              <View style={styles.detailSection}>
                <Text style={styles.detailLabel}>Order Items</Text>
                {selectedOrder.items?.map((item, index) => (
                  <View key={index} style={styles.orderItem}>
                    <Text style={styles.itemName}>{item.product?.name}</Text>
                    <Text style={styles.itemDetails}>
                      Quantity: {item.quantity} × ₹{item.price} = ₹{item.quantity * item.price}
                    </Text>
                  </View>
                ))}
              </View>

              {selectedOrder.distributorNotes && (
                <View style={styles.detailSection}>
                  <Text style={styles.detailLabel}>Your Notes</Text>
                  <Text style={styles.notesText}>{selectedOrder.distributorNotes}</Text>
                </View>
              )}

              {selectedOrder.adminNotes && (
                <View style={styles.detailSection}>
                  <Text style={styles.detailLabel}>Admin Notes</Text>
                  <Text style={styles.notesText}>{selectedOrder.adminNotes}</Text>
                </View>
              )}
            </ScrollView>
          )}
        </View>
      </Modal>

      {/* Status Update Modal */}
      <Modal
        visible={statusModalVisible}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setStatusModalVisible(false)}
      >
        <View style={styles.centerModalContainer}>
          <View style={styles.centerModal}>
            <Text style={styles.modalTitle}>Update Order Status</Text>
            <Text style={styles.modalSubtitle}>
              Order #{selectedOrder?.orderNumber}
            </Text>
            
            <TextInput
              style={styles.notesInput}
              value={adminNotes}
              onChangeText={setAdminNotes}
              placeholder="Add admin notes (optional)..."
              multiline
              numberOfLines={3}
            />
            
            <View style={styles.modalButtons}>
              <TouchableOpacity 
                style={styles.cancelButton}
                onPress={() => setStatusModalVisible(false)}
              >
                <Text style={styles.cancelButtonText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity 
                style={[styles.confirmButton, { backgroundColor: config.color }]}
                onPress={confirmStatusUpdate}
                disabled={updateStatusMutation.isLoading}
              >
                {updateStatusMutation.isLoading ? (
                  <ActivityIndicator color="#FFFFFF" />
                ) : (
                  <Text style={styles.confirmButtonText}>
                    Update to {selectedStatus}
                  </Text>
                )}
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>

    </SafeAreaView>
  
  );
};

// Styles
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F9FAFB',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  headerIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  headerIconText: {
    fontSize: 18,
  },
  headerText: {
    flex: 1,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#374151',
  },
  headerSubtitle: {
    fontSize: 14,
    color: '#6B7280',
    marginTop: 2,
  },
  createButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 12,
  },
  createButtonText: {
    color: '#FFFFFF',
    fontWeight: '600',
    marginLeft: 8,
  },
  orderCard: {
    backgroundColor: '#FFFFFF',
    margin: 16,
    marginBottom: 8,
    padding: 16,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 3,
  },
  orderHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  orderNumber: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#374151',
  },
  orderDate: {
    fontSize: 12,
    color: '#6B7280',
    marginTop: 2,
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  statusText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '600',
    marginLeft: 4,
  },
  orderDetails: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  totalAmount: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#374151',
  },
  paymentMethod: {
    fontSize: 12,
    color: '#6B7280',
    fontStyle: 'italic',
  },
  itemsSection: {
    marginBottom: 12,
  },
  itemsLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 4,
  },
  itemText: {
    fontSize: 12,
    color: '#6B7280',
    marginBottom: 2,
  },
  moreItems: {
    fontSize: 11,
    color: '#9CA3AF',
    fontStyle: 'italic',
  },
  actionsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 8,
  },
  viewButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: '#3B82F6',
  },
  viewButtonText: {
    fontSize: 12,
    fontWeight: '600',
    marginLeft: 4,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
  },
  actionButtonText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '600',
    marginLeft: 4,
  },
  notesSection: {
    marginTop: 8,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
  },
  notesLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 4,
  },
  notesText: {
    fontSize: 12,
    color: '#6B7280',
    fontStyle: 'italic',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: '#6B7280',
  },
  listContent: {
    paddingBottom: 16,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 32,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#374151',
    marginTop: 16,
    marginBottom: 8,
  },
  emptyMessage: {
    fontSize: 14,
    color: '#6B7280',
    textAlign: 'center',
    lineHeight: 20,
  },
  emptyButton: {
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
    marginTop: 16,
  },
  emptyButtonText: {
    color: '#FFFFFF',
    fontWeight: '600',
  },
  modalContainer: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  backButton: {
    padding: 8,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#374151',
    flex: 1,
    textAlign: 'center',
  },
  placeholder: {
    width: 40,
  },
  modalContent: {
    flex: 1,
    padding: 16,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 12,
  },
  productSelection: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  pickerContainer: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#D1D5DB',
    borderRadius: 8,
    marginRight: 8,
  },
  picker: {
    height: 50,
  },
  quantityContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  quantityInput: {
    width: 60,
    height: 50,
    borderWidth: 1,
    borderColor: '#D1D5DB',
    borderRadius: 8,
    paddingHorizontal: 12,
    marginRight: 8,
    textAlign: 'center',
  },
  addButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
  },
  addButtonText: {
    color: '#FFFFFF',
    fontWeight: '600',
    marginLeft: 4,
  },
  selectedProducts: {
    marginTop: 16,
  },
  selectedProductsTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 8,
  },
  selectedProductItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 12,
    backgroundColor: '#F9FAFB',
    borderRadius: 8,
    marginBottom: 8,
  },
  productInfo: {
    flex: 1,
  },
  productName: {
    fontSize: 14,
    fontWeight: '600',
    color: '#374151',
  },
  productDetails: {
    fontSize: 12,
    color: '#6B7280',
    marginTop: 2,
  },
  removeButton: {
    padding: 4,
  },
  totalSection: {
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
  },
  totalText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#374151',
    textAlign: 'right',
  },
  paymentOptions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  paymentOption: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderWidth: 1,
    borderColor: '#D1D5DB',
    borderRadius: 8,
    marginHorizontal: 4,
  },
  paymentOptionSelected: {
    borderColor: '#3B82F6',
    backgroundColor: '#EFF6FF',
  },
  paymentOptionText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#374151',
    marginLeft: 8,
  },
  notesInput: {
    borderWidth: 1,
    borderColor: '#D1D5DB',
    borderRadius: 8,
    padding: 12,
    textAlignVertical: 'top',
  },
  submitButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
    borderRadius: 8,
    marginTop: 16,
  },
  submitButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
  },
  detailSection: {
    marginBottom: 24,
  },
  detailLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 12,
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  detailKey: {
    fontSize: 14,
    color: '#6B7280',
  },
  detailValue: {
    fontSize: 14,
    fontWeight: '500',
    color: '#374151',
  },
  orderItem: {
    padding: 12,
    backgroundColor: '#F9FAFB',
    borderRadius: 8,
    marginBottom: 8,
  },
  itemName: {
    fontSize: 14,
    fontWeight: '600',
    color: '#374151',
  },
  itemDetails: {
    fontSize: 12,
    color: '#6B7280',
    marginTop: 2,
  },
  centerModalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    padding: 16,
  },
  centerModal: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 20,
    width: '100%',
    maxWidth: 400,
  },
  modalSubtitle: {
    fontSize: 14,
    color: '#6B7280',
    marginBottom: 16,
    textAlign: 'center',
  },
  modalButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 16,
  },
  cancelButton: {
    flex: 1,
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#D1D5DB',
    marginRight: 8,
    alignItems: 'center',
  },
  cancelButtonText: {
    color: '#374151',
    fontWeight: '600',
  },
  confirmButton: {
    flex: 1,
    padding: 12,
    borderRadius: 8,
    marginLeft: 8,
    alignItems: 'center',
  },
  confirmButtonText: {
    color: '#FFFFFF',
    fontWeight: '600',
  },
});

export default CompleteOrderManagement;