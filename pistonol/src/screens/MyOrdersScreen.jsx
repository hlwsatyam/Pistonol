import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  RefreshControl,
  Modal,
  TextInput,
  Dimensions,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Card, Button, Badge, Chip, Divider } from 'react-native-paper';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import axios from 'axios';
import { LineChart } from 'react-native-chart-kit';
import { SafeAreaView } from 'react-native-safe-area-context';

const MyOrdersScreen = ({ navigation }) => {
  const [user, setUser] = useState(null);
  const [orders, setOrders] = useState([]);
  const [filteredOrders, setFilteredOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [showFilterModal, setShowFilterModal] = useState(false);
  const [tab, setTab] = useState('placed'); // 'placed' or 'received'
  const [statusFilter, setStatusFilter] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [stats, setStats] = useState({
    totalOrders: 0,
    totalAmount: 0,
    pending: 0,
    approved: 0,
    delivered: 0,
  });

  const statusOptions = [
    { value: 'all', label: 'All', color: '#666' },
    { value: 'pending', label: 'Pending', color: '#FF9800' },
    { value: 'approved', label: 'Approved', color: '#4CAF50' },
    { value: 'shipped', label: 'Shipped', color: '#2196F3' },
    { value: 'delivered', label: 'Delivered', color: '#9C27B0' },
    { value: 'rejected', label: 'Rejected', color: '#F44336' },
  ];

  const paymentMethodColors = {
    'cash-on-delivery': '#4CAF50',
    'reward-payment': '#FF9800',
  };

  useEffect(() => {
    loadUser();
  }, []);

  useEffect(() => {
    if (user) {
      loadOrders();
    }
  }, [user, tab]);

  useEffect(() => {
    filterOrders();
  }, [orders, statusFilter, searchQuery]);

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
        const ordersData = response.data.data;
        setOrders(ordersData);
        calculateStats(ordersData);
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to load orders');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const calculateStats = (ordersData) => {
    const stats = {
      totalOrders: ordersData.length,
      totalAmount: ordersData.reduce((sum, order) => sum + (order.totalAmount || 0), 0),
      pending: ordersData.filter(order => order.status === 'pending').length,
      approved: ordersData.filter(order => order.status === 'approved').length,
      shipped: ordersData.filter(order => order.status === 'shipped').length,
      delivered: ordersData.filter(order => order.status === 'delivered').length,
      rejected: ordersData.filter(order => order.status === 'rejected').length,
    };
    setStats(stats);
  };

  const filterOrders = () => {
    let filtered = [...orders];

    // Apply status filter
    if (statusFilter !== 'all') {
      filtered = filtered.filter(order => order.status === statusFilter);
    }

    // Apply search filter
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(order => 
        order.orderNumber.toLowerCase().includes(query) ||
        (tab === 'placed' 
          ? (order.reciever?.name?.toLowerCase().includes(query) || 
             order.reciever?.username?.toLowerCase().includes(query))
          : (order.user?.name?.toLowerCase().includes(query) || 
             order.user?.username?.toLowerCase().includes(query))
        )
      );
    }

    setFilteredOrders(filtered);
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

  const getPaymentMethodLabel = (method) => {
    return method === 'cash-on-delivery' ? 'COD' : 'Wallet';
  };

  const renderStatsCards = () => {
    return (
      <View style={styles.statsContainer}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          <View style={styles.statCard}>
            <Icon name="package-variant" size={24} color="#2196F3" />
            <Text style={styles.statValue}>{stats.totalOrders}</Text>
            <Text style={styles.statLabel}>Total Orders</Text>
          </View>

          <View style={styles.statCard}>
            <Icon name="currency-inr" size={24} color="#4CAF50" />
            <Text style={styles.statValue}>{formatCurrency(stats.totalAmount)}</Text>
            <Text style={styles.statLabel}>Total Amount</Text>
          </View>

          <View style={styles.statCard}>
            <Icon name="clock-outline" size={24} color="#FF9800" />
            <Text style={styles.statValue}>{stats.pending}</Text>
            <Text style={styles.statLabel}>Pending</Text>
          </View>

          <View style={styles.statCard}>
            <Icon name="check-circle-outline" size={24} color="#4CAF50" />
            <Text style={styles.statValue}>{stats.approved}</Text>
            <Text style={styles.statLabel}>Approved</Text>
          </View>

          <View style={styles.statCard}>
            <Icon name="package-variant-closed" size={24} color="#9C27B0" />
            <Text style={styles.statValue}>{stats.delivered}</Text>
            <Text style={styles.statLabel}>Delivered</Text>
          </View>
        </ScrollView>
      </View>
    );
  };

  const renderOrderChart = () => {
    if (orders.length < 2) return null;

    // Group orders by month
    const monthlyData = {};
    orders.forEach(order => {
      const date = new Date(order.createdAt);
      const monthYear = `${date.getMonth() + 1}/${date.getFullYear()}`;
      
      if (!monthlyData[monthYear]) {
        monthlyData[monthYear] = { count: 0, amount: 0 };
      }
      monthlyData[monthYear].count++;
      monthlyData[monthYear].amount += order.totalAmount;
    });

    const sortedMonths = Object.keys(monthlyData).sort((a, b) => {
      const [aMonth, aYear] = a.split('/').map(Number);
      const [bMonth, bYear] = b.split('/').map(Number);
      if (aYear !== bYear) return aYear - bYear;
      return aMonth - bMonth;
    });

    const labels = sortedMonths.map(month => month);
    const data = sortedMonths.map(month => monthlyData[month].count);

    return (
      <Card style={styles.chartCard}>
        <Card.Content>
          <View style={styles.chartHeader}>
            <Text style={styles.chartTitle}>Orders Trend</Text>
            <Text style={styles.chartSubtitle}>Monthly orders count</Text>
          </View>
          <LineChart
            data={{
              labels,
              datasets: [{ data }]
            }}
            width={Dimensions.get('window').width - 40}
            height={180}
            chartConfig={{
              backgroundColor: '#ffffff',
              backgroundGradientFrom: '#ffffff',
              backgroundGradientTo: '#ffffff',
              decimalPlaces: 0,
              color: (opacity = 1) => `rgba(33, 150, 243, ${opacity})`,
              labelColor: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`,
              style: { borderRadius: 16 },
              propsForDots: {
                r: '4',
                strokeWidth: '2',
                stroke: '#2196F3'
              }
            }}
            bezier
            style={styles.chart}
          />
        </Card.Content>
      </Card>
    );
  };

  const renderOrderCard = (order) => (
    <TouchableOpacity 
      onPress={() => {
        setSelectedOrder(order);
        setShowDetailsModal(true);
      }}
      activeOpacity={0.9}
    >
      <Card style={styles.orderCard}>
        <Card.Content>
          {/* Order Header */}
          <View style={styles.orderHeader}>
            <View style={styles.orderInfo}>
              <View style={styles.orderNumberContainer}>
                <Icon name="tag-outline" size={16} color="#666" />
                <Text style={styles.orderNumber}>{order.orderNumber}</Text>
              </View>
              <Text style={styles.orderDate}>{formatDate(order.createdAt)}</Text>
            </View>
            <View style={[styles.statusBadge, { backgroundColor: getStatusColor(order.status) }]}>
              <Icon name={getStatusIcon(order.status)} size={14} color="white" />
              <Text style={styles.statusText}>{order.status.toUpperCase()}</Text>
            </View>
          </View>

          <Divider style={styles.divider} />

          {/* Order Details */}
          <View style={styles.orderDetails}>
            <View style={styles.detailRow}>
              <Icon name="account" size={16} color="#666" />
              <Text style={styles.detailText} numberOfLines={1}>
                {tab === 'placed' ? 'To: ' : 'From: '}
                {order[tab === 'placed' ? 'reciever' : 'user']?.name || 
                 order[tab === 'placed' ? 'reciever' : 'user']?.username}
              </Text>
            </View>
            
            <View style={styles.detailRow}>
              <Icon name="currency-inr" size={16} color="#666" />
              <Text style={styles.detailAmount}>{formatCurrency(order.totalAmount)}</Text>
            </View>
            
            <View style={styles.detailRow}>
              <Icon name="credit-card-outline" size={16} color="#666" />
              <View style={styles.paymentBadge}>
                <Text style={[
                  styles.paymentText,
                  { color: paymentMethodColors[order.paymentMethod] }
                ]}>
                  {getPaymentMethodLabel(order.paymentMethod)}
                </Text>
              </View>
            </View>
          </View>

          {/* Order Footer */}
          <View style={styles.orderFooter}>
            <View style={styles.itemsCount}>
              <Icon name="package-variant" size={16} color="#666" />
              <Text style={styles.itemsCountText}>{order.items.length} items</Text>
            </View>
            
            <View style={styles.actionButtons}>
              {order.status === 'pending' && tab === 'received' && (
                <TouchableOpacity
                  style={styles.updateStatusButton}
                  onPress={(e) => {
                    e.stopPropagation();
                    navigation.navigate('OrdersManagement', { orderId: order._id });
                  }}
                >
                  <Text style={styles.updateStatusText}>Update</Text>
                </TouchableOpacity>
              )}
              <TouchableOpacity
                style={styles.viewDetailsButton}
                onPress={(e) => {
                  e.stopPropagation();
                  setSelectedOrder(order);
                  setShowDetailsModal(true);
                }}
              >
                <Text style={styles.viewDetailsText}>Details</Text>
              </TouchableOpacity>
            </View>
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
        <Text style={styles.headerTitle}>My Orders</Text>
        <TouchableOpacity onPress={() => setShowFilterModal(true)}>
          <Icon name="filter-variant" size={24} color="#333" />
        </TouchableOpacity>
      </View>

      {/* Stats Cards */}
      {renderStatsCards()}

      {/* Order Trend Chart */}
      {renderOrderChart()}

      {/* Tabs */}
      <View style={styles.tabs}>
        <TouchableOpacity
          style={[styles.tab, tab === 'placed' && styles.activeTab]}
          onPress={() => setTab('placed')}
        >
          <Icon 
            name="cart-arrow-down" 
            size={20} 
            color={tab === 'placed' ? '#4CAF50' : '#666'} 
          />
          <Text style={[styles.tabText, tab === 'placed' && styles.activeTabText]}>
            Placed ({stats.totalOrders})
          </Text>
        </TouchableOpacity>
        
        <TouchableOpacity
          style={[styles.tab, tab === 'received' && styles.activeTab]}
          onPress={() => setTab('received')}
        >
          <Icon 
            name="cart-arrow-up" 
            size={20} 
            color={tab === 'received' ? '#2196F3' : '#666'} 
          />
          <Text style={[styles.tabText, tab === 'received' && styles.activeTabText]}>
            Received ({stats.totalOrders})
          </Text>
        </TouchableOpacity>
      </View>

      {/* Search Bar */}
      <View style={styles.searchContainer}>
        <View style={styles.searchInputContainer}>
          <Icon name="magnify" size={20} color="#666" style={styles.searchIcon} />
          <TextInput
            style={styles.searchInput}
            value={searchQuery}
            onChangeText={setSearchQuery}
            placeholder={`Search by order number or ${tab === 'placed' ? 'receiver' : 'sender'} name`}
            placeholderTextColor="#999"
          />
          {searchQuery ? (
            <TouchableOpacity onPress={() => setSearchQuery('')}>
              <Icon name="close-circle" size={20} color="#999" />
            </TouchableOpacity>
          ) : null}
        </View>
      </View>

      {/* Orders List */}
      <ScrollView
        style={styles.scrollView}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        contentContainerStyle={styles.scrollContent}
      >
        {loading ? (
          <View style={styles.loadingContainer}>
            <Icon name="loading" size={40} color="#4CAF50" style={styles.loadingIcon} />
            <Text style={styles.loadingText}>Loading orders...</Text>
          </View>
        ) : filteredOrders.length > 0 ? (
          <>
            <View style={styles.resultsInfo}>
              <Text style={styles.resultsText}>
                Showing {filteredOrders.length} of {orders.length} orders
              </Text>
              {statusFilter !== 'all' && (
                <Chip
                  icon="filter-variant"
                  onClose={() => setStatusFilter('all')}
                  style={styles.filterChip}
                >
                  {statusFilter.toUpperCase()}
                </Chip>
              )}
            </View>
            
            {filteredOrders.map((order) => (
              <View key={order._id} style={styles.orderItem}>
                {renderOrderCard(order)}
              </View>
            ))}
          </>
        ) : (
          <View style={styles.emptyContainer}>
            <Icon name="package-variant-closed" size={80} color="#E0E0E0" />
            <Text style={styles.emptyTitle}>No Orders Found</Text>
            <Text style={styles.emptySubtitle}>
              {searchQuery || statusFilter !== 'all' 
                ? 'Try changing your search or filter criteria'
                : `You haven't ${tab === 'placed' ? 'placed' : 'received'} any orders yet`}
            </Text>
            {tab === 'placed' && !searchQuery && statusFilter === 'all' && (
              <Button
                mode="contained"
                onPress={() => navigation.navigate('CreateOrder')}
                style={styles.createButton}
                labelStyle={styles.createButtonLabel}
              >
                <Icon name="plus" size={20} color="white" />
                <Text style={{ marginLeft: 5 }}>Create New Order</Text>
              </Button>
            )}
          </View>
        )}
      </ScrollView>

      {/* Create Order Button (Floating) */}
      {tab === 'placed' && (
        <TouchableOpacity
          style={styles.floatingButton}
          onPress={() => navigation.navigate('CreateOrder')}
        >
          <Icon name="plus" size={24} color="white" />
        </TouchableOpacity>
      )}

      {/* Order Details Modal */}
      <Modal
        visible={showDetailsModal}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setShowDetailsModal(false)}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            {selectedOrder && (
              <>
                <View style={styles.modalHeader}>
                  <Text style={styles.modalTitle}>Order Details</Text>
                  <TouchableOpacity onPress={() => setShowDetailsModal(false)}>
                    <Icon name="close" size={24} color="#666" />
                  </TouchableOpacity>
                </View>

                <ScrollView style={styles.modalBody}>
                  {/* Order Summary */}
                  <Card style={styles.modalCard}>
                    <Card.Content>
                      <View style={styles.modalOrderHeader}>
                        <View>
                          <Text style={styles.modalOrderNumber}>{selectedOrder.orderNumber}</Text>
                          <Text style={styles.modalOrderDate}>
                            {formatDate(selectedOrder.createdAt)}
                          </Text>
                        </View>
                        <View style={[
                          styles.modalStatusBadge, 
                          { backgroundColor: getStatusColor(selectedOrder.status) }
                        ]}>
                          <Icon 
                            name={getStatusIcon(selectedOrder.status)} 
                            size={16} 
                            color="white" 
                          />
                          <Text style={styles.modalStatusText}>
                            {selectedOrder.status.toUpperCase()}
                          </Text>
                        </View>
                      </View>

                      <Divider style={styles.modalDivider} />

                      {/* User Info */}
                      <View style={styles.userInfo}>
                        <View style={styles.userAvatar}>
                          <Icon name="account" size={24} color="#2196F3" />
                        </View>
                        <View style={styles.userDetails}>
                          <Text style={styles.userName}>
                            {tab === 'placed' 
                              ? selectedOrder.reciever?.name || selectedOrder.reciever?.username
                              : selectedOrder.user?.name || selectedOrder.user?.username}
                          </Text>
                          <Text style={styles.userRole}>
                            {tab === 'placed' 
                              ? 'Receiver' 
                              : 'Sender'} • {selectedOrder.userType}
                          </Text>
                          <Text style={styles.userContact}>
                            {tab === 'placed'
                              ? selectedOrder.reciever?.mobile
                              : selectedOrder.user?.mobile}
                          </Text>
                        </View>
                      </View>

                      {/* Order Info Grid */}
                      <View style={styles.infoGrid}>
                        <View style={styles.infoItem}>
                          <Text style={styles.infoLabel}>Total Amount</Text>
                          <Text style={[styles.infoValue, { color: '#4CAF50' }]}>
                            {formatCurrency(selectedOrder.totalAmount)}
                          </Text>
                        </View>
                        <View style={styles.infoItem}>
                          <Text style={styles.infoLabel}>Payment Method</Text>
                          <Text style={[
                            styles.infoValue,
                            { color: paymentMethodColors[selectedOrder.paymentMethod] }
                          ]}>
                            {getPaymentMethodLabel(selectedOrder.paymentMethod)}
                          </Text>
                        </View>
                        <View style={styles.infoItem}>
                          <Text style={styles.infoLabel}>Items Count</Text>
                          <Text style={styles.infoValue}>{selectedOrder.items.length}</Text>
                        </View>
                        <View style={styles.infoItem}>
                          <Text style={styles.infoLabel}>Order Type</Text>
                          <Text style={styles.infoValue}>{selectedOrder.userType}</Text>
                        </View>
                      </View>
                    </Card.Content>
                  </Card>

                  {/* Order Items */}
                  <Card style={styles.modalCard}>
                    <Card.Content>
                      <Text style={styles.sectionTitle}>Order Items</Text>
                      {selectedOrder.items.map((item, index) => (
                        <View key={index} style={styles.itemCard}>
                          <View style={styles.itemHeader}>
                            <Text style={styles.itemName} numberOfLines={1}>
                              {item.product?.name || 'Product'}
                            </Text>
                            <Text style={styles.itemPrice}>
                              {formatCurrency(item.price)} × {item.quantity}
                            </Text>
                          </View>
                          <View style={styles.itemFooter}>
                            <Text style={styles.itemTotal}>
                              Total: {formatCurrency(item.price * item.quantity)}
                            </Text>
                            <Text style={styles.itemIndex}>#{index + 1}</Text>
                          </View>
                        </View>
                      ))}
                    </Card.Content>
                  </Card>

                  {/* Notes */}
                  <Card style={styles.modalCard}>
                    <Card.Content>
                      <Text style={styles.sectionTitle}>User Notes</Text>
                      <Text style={styles.notesText}>
                        {selectedOrder.userNotes || 'No notes provided'}
                      </Text>
                      
                      {selectedOrder.adminNotes && (
                        <>
                          <Divider style={styles.notesDivider} />
                          <Text style={styles.sectionTitle}>Admin Notes</Text>
                          <Text style={[styles.notesText, { color: '#FF9800' }]}>
                            {selectedOrder.adminNotes}
                          </Text>
                        </>
                      )}
                    </Card.Content>
                  </Card>

                  {/* Status Timeline */}
                  <Card style={styles.modalCard}>
                    <Card.Content>
                      <Text style={styles.sectionTitle}>Order Timeline</Text>
                      <View style={styles.timeline}>
                        <View style={styles.timelineItem}>
                          <View style={styles.timelineDot} />
                          <Text style={styles.timelineDate}>
                            {formatDate(selectedOrder.createdAt)}
                          </Text>
                          <Text style={styles.timelineEvent}>Order Created</Text>
                        </View>
                        
                        {selectedOrder.approvedAt && (
                          <View style={styles.timelineItem}>
                            <View style={[styles.timelineDot, { backgroundColor: '#4CAF50' }]} />
                            <Text style={styles.timelineDate}>
                              {formatDate(selectedOrder.approvedAt)}
                            </Text>
                            <Text style={styles.timelineEvent}>Order Approved</Text>
                          </View>
                        )}
                        
                        {selectedOrder.shippedAt && (
                          <View style={styles.timelineItem}>
                            <View style={[styles.timelineDot, { backgroundColor: '#2196F3' }]} />
                            <Text style={styles.timelineDate}>
                              {formatDate(selectedOrder.shippedAt)}
                            </Text>
                            <Text style={styles.timelineEvent}>Order Shipped</Text>
                          </View>
                        )}
                        
                        {selectedOrder.deliveredAt && (
                          <View style={styles.timelineItem}>
                            <View style={[styles.timelineDot, { backgroundColor: '#9C27B0' }]} />
                            <Text style={styles.timelineDate}>
                              {formatDate(selectedOrder.deliveredAt)}
                            </Text>
                            <Text style={styles.timelineEvent}>Order Delivered</Text>
                          </View>
                        )}
                        
                        {selectedOrder.rejectedAt && (
                          <View style={styles.timelineItem}>
                            <View style={[styles.timelineDot, { backgroundColor: '#F44336' }]} />
                            <Text style={styles.timelineDate}>
                              {formatDate(selectedOrder.rejectedAt)}
                            </Text>
                            <Text style={styles.timelineEvent}>Order Rejected</Text>
                          </View>
                        )}
                      </View>
                    </Card.Content>
                  </Card>
                </ScrollView>

                {/* Modal Footer */}
                <View style={styles.modalFooter}>
                  <Button
                    mode="outlined"
                    onPress={() => setShowDetailsModal(false)}
                    style={styles.modalButton}
                  >
                    Close
                  </Button>
                  {tab === 'received' && selectedOrder.status === 'pending' && (
                    <Button
                      mode="contained"
                      onPress={() => {
                        setShowDetailsModal(false);
                        navigation.navigate('OrdersManagement', { orderId: selectedOrder._id });
                      }}
                      style={[styles.modalButton, { marginLeft: 10 }]}
                    >
                      Update Status
                    </Button>
                  )}
                </View>
              </>
            )}
          </View>
        </View>
      </Modal>

      {/* Filter Modal */}
      <Modal
        visible={showFilterModal}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setShowFilterModal(false)}
      >
        <View style={styles.modalContainer}>
          <View style={styles.filterModalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Filter Orders</Text>
              <TouchableOpacity onPress={() => setShowFilterModal(false)}>
                <Icon name="close" size={24} color="#666" />
              </TouchableOpacity>
            </View>

            <ScrollView style={styles.filterBody}>
              <Text style={styles.filterSectionTitle}>Filter by Status</Text>
              <View style={styles.filterOptions}>
                {statusOptions.map((option) => (
                  <TouchableOpacity
                    key={option.value}
                    style={[
                      styles.filterOption,
                      statusFilter === option.value && { 
                        borderColor: option.color,
                        backgroundColor: `${option.color}10`
                      }
                    ]}
                    onPress={() => {
                      setStatusFilter(option.value);
                      setShowFilterModal(false);
                    }}
                  >
                    <View style={[styles.filterDot, { backgroundColor: option.color }]} />
                    <Text style={[
                      styles.filterOptionText,
                      statusFilter === option.value && { color: option.color, fontWeight: 'bold' }
                    ]}>
                      {option.label}
                    </Text>
                    <Badge 
                      size={20} 
                      style={[
                        styles.filterBadge,
                        { backgroundColor: option.color }
                      ]}
                    >
                      {option.value === 'all' 
                        ? stats.totalOrders
                        : stats[option.value] || 0}
                    </Badge>
                  </TouchableOpacity>
                ))}
              </View>
            </ScrollView>

            <View style={styles.filterFooter}>
              <Button
                mode="outlined"
                onPress={() => {
                  setStatusFilter('all');
                  setShowFilterModal(false);
                }}
                style={styles.filterButton}
              >
                Clear Filters
              </Button>
              <Button
                mode="contained"
                onPress={() => setShowFilterModal(false)}
                style={[styles.filterButton, { marginLeft: 10 }]}
              >
                Apply
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
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#333',
  },
  statsContainer: {
    paddingVertical: 15,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
  statCard: {
    alignItems: 'center',
    paddingVertical: 15,
    paddingHorizontal: 20,
    marginHorizontal: 8,
    minWidth: 120,
    backgroundColor: '#F8F9FA',
    borderRadius: 12,
    elevation: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 1,
  },
  statValue: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    marginVertical: 5,
  },
  statLabel: {
    fontSize: 12,
    color: '#666',
    textAlign: 'center',
  },
  chartCard: {
    margin: 15,
    marginTop: 0,
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
  },
  chartHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  chartTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
  },
  chartSubtitle: {
    fontSize: 12,
    color: '#666',
  },
  chart: {
    marginVertical: 8,
    borderRadius: 16,
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
    paddingVertical: 12,
    borderRadius: 8,
    marginHorizontal: 5,
    backgroundColor: '#F5F5F5',
  },
  activeTab: {
    backgroundColor: '#E3F2FD',
  },
  tabText: {
    fontSize: 14,
    color: '#666',
    marginLeft: 8,
    fontWeight: '500',
  },
  activeTabText: {
    color: '#2196F3',
    fontWeight: 'bold',
  },
  searchContainer: {
    padding: 15,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
  searchInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F5F5F5',
    borderRadius: 8,
    paddingHorizontal: 12,
  },
  searchIcon: {
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    paddingVertical: 10,
    fontSize: 14,
    color: '#333',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 15,
    paddingBottom: 30,
  },
  resultsInfo: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 15,
  },
  resultsText: {
    fontSize: 14,
    color: '#666',
  },
  filterChip: {
    height: 28,
    backgroundColor: '#E3F2FD',
  },
  orderItem: {
    marginBottom: 10,
  },
  orderCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
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
  orderNumberContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 2,
  },
  orderNumber: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginLeft: 5,
  },
  orderDate: {
    fontSize: 12,
    color: '#666',
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusText: {
    color: 'white',
    fontSize: 10,
    fontWeight: 'bold',
    marginLeft: 4,
  },
  divider: {
    marginVertical: 10,
    backgroundColor: '#F0F0F0',
  },
  orderDetails: {
    marginBottom: 10,
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  detailText: {
    fontSize: 14,
    color: '#666',
    marginLeft: 8,
    flex: 1,
  },
  detailAmount: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#4CAF50',
    marginLeft: 8,
  },
  paymentBadge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 4,
    backgroundColor: '#F5F5F5',
    marginLeft: 8,
  },
  paymentText: {
    fontSize: 12,
    fontWeight: '600',
  },
  orderFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: '#F0F0F0',
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
  actionButtons: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  updateStatusButton: {
    backgroundColor: '#2196F3',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 5,
    marginRight: 8,
  },
  updateStatusText: {
    color: 'white',
    fontSize: 12,
    fontWeight: 'bold',
  },
  viewDetailsButton: {
    backgroundColor: '#4CAF50',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 5,
  },
  viewDetailsText: {
    color: 'white',
    fontSize: 12,
    fontWeight: 'bold',
  },
  loadingContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 40,
  },
  loadingIcon: {
    marginBottom: 15,
  },
  loadingText: {
    fontSize: 16,
    color: '#666',
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
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  createButtonLabel: {
    fontSize: 14,
  },
  floatingButton: {
    position: 'absolute',
    bottom: 30,
    right: 30,
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#4CAF50',
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
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
    maxHeight: '90%',
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
  modalBody: {
    flex: 1,
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
  modalOrderDate: {
    fontSize: 12,
    color: '#666',
    marginTop: 2,
  },
  modalStatusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
  },
  modalStatusText: {
    color: 'white',
    fontSize: 12,
    fontWeight: 'bold',
    marginLeft: 5,
  },
  modalDivider: {
    marginVertical: 15,
  },
  userInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 15,
  },
  userAvatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: '#E3F2FD',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 15,
  },
  userDetails: {
    flex: 1,
  },
  userName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 2,
  },
  userRole: {
    fontSize: 12,
    color: '#666',
    marginBottom: 2,
  },
  userContact: {
    fontSize: 12,
    color: '#2196F3',
  },
  infoGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  infoItem: {
    width: '48%',
    marginBottom: 15,
  },
  infoLabel: {
    fontSize: 12,
    color: '#666',
    marginBottom: 4,
  },
  infoValue: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 15,
  },
  itemCard: {
    backgroundColor: '#F8F9FA',
    padding: 12,
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
  itemFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  itemTotal: {
    fontSize: 14,
    color: '#4CAF50',
    fontWeight: 'bold',
  },
  itemIndex: {
    fontSize: 12,
    color: '#999',
  },
  notesText: {
    fontSize: 14,
    color: '#666',
    lineHeight: 20,
  },
  notesDivider: {
    marginVertical: 15,
  },
  timeline: {
    marginLeft: 10,
  },
  timelineItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 15,
  },
  timelineDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: '#FF9800',
    marginRight: 15,
  },
  timelineDate: {
    fontSize: 12,
    color: '#666',
    width: 80,
  },
  timelineEvent: {
    fontSize: 14,
    color: '#333',
    flex: 1,
  },
  modalFooter: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    padding: 20,
    borderTopWidth: 1,
    borderTopColor: '#E0E0E0',
  },
  modalButton: {
    minWidth: 100,
  },
  // Filter Modal Styles
  filterModalContent: {
    backgroundColor: '#FFFFFF',
    marginHorizontal: 20,
    marginVertical: 60,
    borderRadius: 15,
    maxHeight: '80%',
  },
  filterBody: {
    flex: 1,
    padding: 20,
  },
  filterSectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 15,
  },
  filterOptions: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  filterOption: {
    width: '48%',
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderWidth: 2,
    borderColor: '#F0F0F0',
    borderRadius: 8,
    marginBottom: 10,
  },
  filterDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    marginRight: 8,
  },
  filterOptionText: {
    fontSize: 14,
    color: '#333',
    flex: 1,
  },
  filterBadge: {
    backgroundColor: '#2196F3',
  },
  filterFooter: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    padding: 20,
    borderTopWidth: 1,
    borderTopColor: '#E0E0E0',
  },
  filterButton: {
    minWidth: 100,
  },
});

export default MyOrdersScreen;