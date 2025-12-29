import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,TextInput,
  TouchableOpacity,
  Alert,
  RefreshControl,
  Modal,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Card, Button, Badge, Chip } from 'react-native-paper';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import axios from 'axios';
import { SafeAreaView } from 'react-native-safe-area-context';

const OrdersManagementScreen = ({ navigation }) => {
  const [user, setUser] = useState(null);
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [showStatusModal, setShowStatusModal] = useState(false);
  const [newStatus, setNewStatus] = useState('');
  const [adminNotes, setAdminNotes] = useState('');
  const [tab, setTab] = useState('received'); // 'received' or 'placed'

  useEffect(() => {
    loadUser();
  }, []);

  useEffect(() => {
    if (user) {
      loadOrders();
    }
  }, [user, tab]);

  const loadUser = async () => {
    try {
      const userData = await AsyncStorage.getItem('user');
      if (userData) {
        setUser(JSON.parse(userData));
      }
    } catch (error) {
      console.error('Error loading user:', error);
    }
  };

  const loadOrders = async () => {
    try {
      setLoading(true);
      const endpoint = tab === 'received' ? '/ordersforDM/received' : '/ordersforDM/placed';
      const response = await axios.get(endpoint, {
        params: { userId: user._id }
      });
      
      if (response.data.success) {
        setOrders(response.data.data);
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to load orders');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const onRefresh = () => {
    setRefreshing(true);
    loadOrders();
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'pending': return '#FF9800';
      case 'approved': return '#4CAF50';
      case 'rejected': return '#F44336';
      case 'shipped': return '#2196F3';
      case 'delivered': return '#9C27B0';
      default: return '#666';
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'pending': return 'clock-outline';
      case 'approved': return 'check-circle-outline';
      case 'rejected': return 'close-circle-outline';
      case 'shipped': return 'truck-delivery-outline';
      case 'delivered': return 'package-variant-closed';
      default: return 'help-circle-outline';
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-IN');
  };

  const formatCurrency = (amount) => {
    if (!amount) return '₹0';
    return `₹${amount.toLocaleString('en-IN')}`;
  };

  const updateOrderStatus = async () => {
    if (!selectedOrder || !newStatus) {
      Alert.alert('Error', 'Please select a status');
      return;
    }

    try {
      const response = await axios.put(`/ordersforDM/${selectedOrder._id}/status`, {
        status: newStatus,
        adminNotes: adminNotes || undefined,
        userId: user._id
      });

      if (response.data.success) {
        Alert.alert('Success', 'Order status updated successfully');
        setShowStatusModal(false);
        setSelectedOrder(null);
        setNewStatus('');
        setAdminNotes('');
        loadOrders();
      }
    } catch (error) {
      Alert.alert('Error', error.response?.data?.message || 'Failed to update status');
    }
  };

  const renderOrderCard = (order) => (
    <TouchableOpacity onPress={() => {
      setSelectedOrder(order);
      setShowDetailsModal(true);
    }}>
      <Card style={styles.orderCard}>
        <Card.Content>
          <View style={styles.orderHeader}>
            <View style={styles.orderInfo}>
              <Text style={styles.orderNumber}>{order.orderNumber}</Text>
              <Text style={styles.orderDate}>{formatDate(order.createdAt)}</Text>
            </View>
            <View style={[styles.statusBadge, { backgroundColor: getStatusColor(order.status) }]}>
              <Icon name={getStatusIcon(order.status)} size={16} color="white" />
              <Text style={styles.statusText}>{order.status.toUpperCase()}</Text>
            </View>
          </View>

          <View style={styles.orderDetails}>
            <View style={styles.detailRow}>
              <Icon name="account" size={16} color="#666" />
              <Text style={styles.detailText}>
                {tab === 'received' ? 'From: ' : 'To: '}
                {order[tab === 'received' ? 'user' : 'reciever']?.name || 
                 order[tab === 'received' ? 'user' : 'reciever']?.username}
              </Text>
            </View>
            
            <View style={styles.detailRow}>
              <Icon name="currency-inr" size={16} color="#666" />
              <Text style={styles.detailText}>{formatCurrency(order.totalAmount)}</Text>
            </View>
            
            <View style={styles.detailRow}>
              <Icon name="credit-card-outline" size={16} color="#666" />
              <Text style={styles.detailText}>
                Payment: {order.paymentMethod === 'cash-on-delivery' ? 'COD' : 'Wallet'}
              </Text>
            </View>
          </View>

          <View style={styles.orderFooter}>
            <View style={styles.itemsCount}>
              <Icon name="package-variant" size={16} color="#666" />
              <Text style={styles.itemsCountText}>{order.items.length} items</Text>
            </View>
            {tab === 'received' && order.status === 'pending' && (
              <TouchableOpacity
                style={styles.updateButton}
                onPress={(e) => {
                  e.stopPropagation();
                  setSelectedOrder(order);
                  setShowStatusModal(true);
                }}
              >
                <Text style={styles.updateButtonText}>Update</Text>
              </TouchableOpacity>
            )}
          </View>
        </Card.Content>
      </Card>
    </TouchableOpacity>
  );

  return (

    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Icon name="arrow-left" size={24} color="#333" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Orders</Text>
        <View style={{ width: 24 }} />
      </View>

      {/* Tabs */}
      <View style={styles.tabs}>
        <TouchableOpacity
          style={[styles.tab, tab === 'received' && styles.activeTab]}
          onPress={() => setTab('received')}
        >
          <Icon 
            name="inbox-arrow-down" 
            size={20} 
            color={tab === 'received' ? '#4CAF50' : '#666'} 
          />
          <Text style={[styles.tabText, tab === 'received' && styles.activeTabText]}>
            Received ({orders.filter(o => tab === 'received').length})
          </Text>
        </TouchableOpacity>
        
        <TouchableOpacity
          style={[styles.tab, tab === 'placed' && styles.activeTab]}
          onPress={() => setTab('placed')}
        >
          <Icon 
            name="inbox-arrow-up" 
            size={20} 
            color={tab === 'placed' ? '#2196F3' : '#666'} 
          />
          <Text style={[styles.tabText, tab === 'placed' && styles.activeTabText]}>
            Placed ({orders.filter(o => tab === 'placed').length})
          </Text>
        </TouchableOpacity>
      </View>

      {/* Orders List */}
      <ScrollView
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        contentContainerStyle={styles.scrollContent}
      >
        {loading ? (
          <View style={styles.loadingContainer}>
            <Text>Loading orders...</Text>
          </View>
        ) : orders.length > 0 ? (
          orders.map((order) => (
            <View key={order._id}>
              {renderOrderCard(order)}
            </View>
          ))
        ) : (
          <View style={styles.emptyContainer}>
            <Icon name="package-variant-closed" size={80} color="#E0E0E0" />
            <Text style={styles.emptyTitle}>
              {tab === 'received' ? 'No Orders Received' : 'No Orders Placed'}
            </Text>
            <Text style={styles.emptySubtitle}>
              {tab === 'received' 
                ? 'You haven\'t received any orders yet'
                : 'You haven\'t placed any orders yet'}
            </Text>
            {tab === 'placed' && (
              <Button
                mode="contained"
                onPress={() => navigation.navigate('CreateOrder')}
                style={styles.createButton}
              >
                Create Your First Order
              </Button>
            )}
          </View>
        )}
      </ScrollView>

      {/* Order Details Modal */}
      <Modal
        visible={showDetailsModal}
        animationType="slide"
        transparent={true}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            {selectedOrder && (
              <ScrollView>
                {/* Header */}
                <View style={styles.modalHeader}>
                  <Text style={styles.modalTitle}>Order Details</Text>
                  <TouchableOpacity onPress={() => setShowDetailsModal(false)}>
                    <Icon name="close" size={24} color="#666" />
                  </TouchableOpacity>
                </View>

                {/* Order Info */}
                <Card style={styles.modalCard}>
                  <Card.Content>
                 
                      <Text style={styles.modalOrderNumber}>{selectedOrder.orderNumber}</Text>
                      <View style={[styles.modalStatusBadge, { backgroundColor: getStatusColor(selectedOrder.status) }]}>
                        <Text style={styles.modalStatusText}>{selectedOrder.status.toUpperCase()}</Text>
                      </View>
                   
                    
                    <View style={styles.modalInfoGrid}>
                      <View style={styles.infoItem}>
                        <Text style={styles.infoLabel}>Order Date</Text>
                        <Text style={styles.infoValue}>{formatDate(selectedOrder.createdAt)}</Text>
                      </View>
                      <View style={styles.infoItem}>
                        <Text style={styles.infoLabel}>Total Amount</Text>
                        <Text style={[styles.infoValue, { color: '#4CAF50' }]}>
                          {formatCurrency(selectedOrder.totalAmount)}
                        </Text>
                      </View>
                      <View style={styles.infoItem}>
                        <Text style={styles.infoLabel}>Payment Method</Text>
                        <Text style={styles.infoValue}>
                          {selectedOrder.paymentMethod === 'cash-on-delivery' ? 'Cash on Delivery' : 'Wallet Payment'}
                        </Text>
                      </View>
                      <View style={styles.infoItem}>
                        <Text style={styles.infoLabel}>User Type</Text>
                        <Text style={styles.infoValue}>{selectedOrder.userType}</Text>
                      </View>
                    </View>
                  </Card.Content>
                </Card>

                {/* Order Items */}
                <Card style={styles.modalCard}>
                  <Card.Content>
                    <Text style={styles.modalSectionTitle}>Order Items ({selectedOrder.items.length})</Text>
                    {selectedOrder.items.map((item, index) => (
                      <View key={index} style={styles.itemCard}>
                        <View style={styles.itemHeader}>
                          <Text style={styles.itemName}>{item.product?.name || 'Product'}</Text>
                          <Text style={styles.itemPrice}>{formatCurrency(item.price)} × {item.quantity}</Text>
                        </View>
                        <Text style={styles.itemTotal}>
                          Total: {formatCurrency(item.price * item.quantity)}
                        </Text>
                      </View>
                    ))}
                  </Card.Content>
                </Card>

                {/* Notes */}
                <Card style={styles.modalCard}>
                  <Card.Content>
                    <Text style={styles.modalSectionTitle}>Notes</Text>
                    <Text style={styles.notesText}>
                      {selectedOrder.userNotes || 'No notes provided'}
                    </Text>
                    {selectedOrder.adminNotes && (
                      <>
                        <Text style={styles.modalSectionTitle}>Admin Notes</Text>
                        <Text style={[styles.notesText, { color: '#FF9800' }]}>
                          {selectedOrder.adminNotes}
                        </Text>
                      </>
                    )}
                  </Card.Content>
                </Card>

                {/* Actions */}
                {tab === 'received' && selectedOrder.status === 'pending' && (
                  <View style={styles.modalActions}>
                    <Button
                      mode="contained"
                      onPress={() => {
                        setShowDetailsModal(false);
                        setShowStatusModal(true);
                      }}
                      style={styles.actionButton}
                    >
                      Update Status
                    </Button>
                  </View>
                )}
              </ScrollView>
            )}
          </View>
        </View>
      </Modal>

      {/* Status Update Modal */}
      <Modal
        visible={showStatusModal}
        animationType="slide"
        transparent={true}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Update Order Status</Text>
              <TouchableOpacity onPress={() => setShowStatusModal(false)}>
                <Icon name="close" size={24} color="#666" />
              </TouchableOpacity>
            </View>

            <Card style={styles.modalCard}>
              <Card.Content>
                <Text style={styles.modalSectionTitle}>Select Status</Text>
                <View style={styles.statusOptions}>
                  {['approved', 'rejected', 'shipped', 'delivered'].map((status) => (
                    <TouchableOpacity
                      key={status}
                      style={[
                        styles.statusOption,
                        newStatus === status && { borderColor: getStatusColor(status) }
                      ]}
                      onPress={() => setNewStatus(status)}
                    >
                      <Icon 
                        name={getStatusIcon(status)} 
                        size={24} 
                        color={newStatus === status ? getStatusColor(status) : '#666'} 
                      />
                      <Text style={[
                        styles.statusOptionText,
                        newStatus === status && { color: getStatusColor(status), fontWeight: 'bold' }
                      ]}>
                        {status.toUpperCase()}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>

                <Text style={styles.modalSectionTitle}>Admin Notes (Optional)</Text>
                <TextInput
                  style={styles.adminNotesInput}
                  value={adminNotes}
                  onChangeText={setAdminNotes}
                  placeholder="Add any notes for the user..."
                  multiline
                  numberOfLines={3}
                  textAlignVertical="top"
                />
              </Card.Content>
            </Card>

            <View style={styles.modalActions}>
              <Button
                mode="outlined"
                onPress={() => setShowStatusModal(false)}
                style={[styles.actionButton, { marginRight: 10 }]}
              >
                Cancel
              </Button>
              <Button
                mode="contained"
                onPress={updateOrderStatus}
                disabled={!newStatus}
                style={styles.actionButton}
              >
                Update Status
              </Button>
            </View>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F5F5',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 15,
    backgroundColor: '#FFFFFF',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
  },
  tabs: {
    flexDirection: 'row',
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
  tab: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 10,
    borderRadius: 8,
    marginHorizontal: 5,
  },
  activeTab: {
    backgroundColor: '#F5F5F5',
  },
  tabText: {
    fontSize: 14,
    color: '#666',
    marginLeft: 5,
  },
  activeTabText: {
    color: '#333',
    fontWeight: 'bold',
  },
  scrollContent: {
    padding: 15,
    paddingBottom: 30,
  },
  orderCard: {
    marginBottom: 10,
    backgroundColor: '#FFFFFF',
  },
  orderHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 10,
  },
  orderInfo: {
    flex: 1,
  },
  orderNumber: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
  },
  orderDate: {
    fontSize: 12,
    color: '#666',
    marginTop: 2,
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusText: {
    color: 'white',
    fontSize: 10,
    fontWeight: 'bold',
    marginLeft: 4,
  },
  orderDetails: {
    marginBottom: 10,
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 5,
  },
  detailText: {
    fontSize: 14,
    color: '#666',
    marginLeft: 8,
  },
  orderFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderTopWidth: 1,
    borderTopColor: '#F0F0F0',
    paddingTop: 10,
  },
  itemsCount: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  itemsCountText: {
    fontSize: 14,
    color: '#666',
    marginLeft: 5,
  },
  updateButton: {
    backgroundColor: '#2196F3',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 5,
  },
  updateButtonText: {
    color: 'white',
    fontSize: 12,
    fontWeight: 'bold',
  },
  loadingContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 40,
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
    paddingHorizontal: 40,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#666',
    marginTop: 20,
    marginBottom: 10,
    textAlign: 'center',
  },
  emptySubtitle: {
    fontSize: 14,
    color: '#999',
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: 20,
  },
  createButton: {
    backgroundColor: '#4CAF50',
  },
  // Modal Styles
  modalContainer: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
  },
  modalContent: {
    backgroundColor: '#FFFFFF',
    marginHorizontal: 20,
    marginVertical: 40,
    borderRadius: 15,
    maxHeight: '80%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
  },
  modalCard: {
    margin: 15,
    marginTop: 0,
  },
  modalOrderHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 15,
  },
  modalOrderNumber: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  modalStatusBadge: {
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 10,
  },
  modalStatusText: {
    color: 'white',
    fontSize: 12,
    fontWeight: 'bold',
  },
  modalInfoGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  infoItem: {
    width: '48%',
    marginBottom: 10,
  },
  infoLabel: {
    fontSize: 12,
    color: '#666',
    marginBottom: 2,
  },
  infoValue: {
    fontSize: 14,
    fontWeight: '500',
    color: '#333',
  },
  modalSectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 10,
  },
  itemCard: {
    backgroundColor: '#F8F9FA',
    padding: 10,
    borderRadius: 8,
    marginBottom: 8,
  },
  itemHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 5,
  },
  itemName: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#333',
    flex: 1,
  },
  itemPrice: {
    fontSize: 14,
    color: '#666',
  },
  itemTotal: {
    fontSize: 14,
    color: '#4CAF50',
    fontWeight: 'bold',
  },
  notesText: {
    fontSize: 14,
    color: '#666',
    lineHeight: 20,
  },
  modalActions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    padding: 15,
    borderTopWidth: 1,
    borderTopColor: '#E0E0E0',
  },
  actionButton: {
    minWidth: 100,
  },
  // Status Update Modal Styles
  statusOptions: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  statusOption: {
    width: '48%',
    alignItems: 'center',
    padding: 15,
    borderWidth: 2,
    borderColor: '#F0F0F0',
    borderRadius: 8,
    marginBottom: 10,
  },
  statusOptionText: {
    marginTop: 5,
    fontSize: 12,
    color: '#666',
  },
  adminNotesInput: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 12,
    fontSize: 14,
    minHeight: 80,
    backgroundColor: '#FAFAFA',
  },
});

export default OrdersManagementScreen;