import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  TextInput,
  FlatList,
  Modal,
  ActivityIndicator,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Card, Button, Badge } from 'react-native-paper';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import axios from 'axios';
import { SafeAreaView } from 'react-native-safe-area-context';

const CreateOrderScreen = ({ navigation }) => {
  const [user, setUser] = useState(null);
  const [products, setProducts] = useState([]);
  const [cart, setCart] = useState([]);
  const [receiverUsername, setReceiverUsername] = useState('');
  const [receiverUser, setReceiverUser] = useState(null);
  const [paymentMethod, setPaymentMethod] = useState('cash-on-delivery');
  const [userNotes, setUserNotes] = useState('');
  const [loading, setLoading] = useState(false);
  const [searchLoading, setSearchLoading] = useState(false);
  const [showSearchModal, setShowSearchModal] = useState(false);
  const [walletBalance, setWalletBalance] = useState(0);

  useEffect(() => {
    fetchFreshUserData()
    loadUserAndProducts();
  }, []);



  const fetchFreshUserData = async (userId) => {
    try {


   const userData = await AsyncStorage.getItem('user');
      if (userData) {
              const parsedUser = JSON.parse(userData);
          const response = await axios.get(`/auth/${parsedUser._id}`);
      if (response.data) {
        // Update AsyncStorage with fresh data
        await AsyncStorage.setItem('user', JSON.stringify(response.data));
        return response.data;
      }
      }

   
    } catch (error) {
      console.error('Backend fetch error:', error);
      throw error;
    }
  };






  const loadUserAndProducts = async () => {
    try {
      const userData = await AsyncStorage.getItem('user');
      if (userData) {
        const parsedUser = JSON.parse(userData);
        setUser(parsedUser);
        setWalletBalance(parsedUser.wallet || 0);
      }
      
      // Load products
      const response = await axios.get('/products');
      if (response.data.success) {
        setProducts(response.data.data);
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to load data');
    }
  };

  const searchReceiver = async () => {
    if (!receiverUsername.trim()) {
      Alert.alert('Error', 'Please enter receiver username');
      return;
    }

    setSearchLoading(true);
    try {
      const response = await axios.get(`/auth/users/search?username=${receiverUsername}`);
      if (response.data.success && response.data.user) {
        const foundUser = response.data.user;
        
        // Check if user can receive orders based on role
        const allowedRoles = ['distributor', 'dealer', 'mechanic', 'company-employee'];
        if (!allowedRoles.includes(foundUser.role)) {
          Alert.alert('Error', 'This user cannot receive orders');
          return;
        }
        
        setReceiverUser(foundUser);
        setShowSearchModal(false);
        Alert.alert('Success', `Found user: ${foundUser.name || foundUser.username}`);
      } else {
        Alert.alert('Error', 'User not found');
      }
    } catch (error) {
      console.log(error)
      Alert.alert('Error', 'Failed to search user');
    } finally {
      setSearchLoading(false);
    }
  };

  const addToCart = (product) => {
    const existingItem = cart.find(item => item.product._id === product._id);
    
    if (existingItem) {
      setCart(cart.map(item =>
        item.product._id === product._id
          ? { ...item, quantity: item.quantity + 1 }
          : item
      ));
    } else {
      setCart([...cart, {
        product,
        quantity: 1,
        price: product.price
      }]);
    }
  };

  const removeFromCart = (productId) => {
    setCart(cart.filter(item => item.product._id !== productId));
  };

  const updateQuantity = (productId, newQuantity) => {
    if (newQuantity < 1) {
      removeFromCart(productId);
      return;
    }
    
    setCart(cart.map(item =>
      item.product._id === productId
        ? { ...item, quantity: newQuantity }
        : item
    ));
  };

  const calculateTotal = () => {
    return cart.reduce((total, item) => total + (item.price * item.quantity), 0);
  };

  const createOrder = async () => {
    if (!receiverUser) {
      Alert.alert('Error', 'Please select a receiver first');
      return;
    }

    if (cart.length === 0) {
      Alert.alert('Error', 'Please add products to cart');
      return;
    }

    // Check wallet balance for reward payment
    const totalAmount = calculateTotal();
    if (paymentMethod === 'reward-payment' && walletBalance < totalAmount) {
      Alert.alert('Error', 'Insufficient wallet balance');
      return;
    }

    setLoading(true);
    try {
      const orderData = {
        user: user._id,
        userType: user.role,
        reciever: receiverUser._id,
        items: cart.map(item => ({
          product: item.product._id,
          quantity: item.quantity,
          price: item.price
        })),
        totalAmount,
        paymentMethod,
        userNotes
      };

      const response = await axios.post('/ordersforDM/create', orderData);
      
      if (response.data.success) {
        Alert.alert(
          'Success',
          'Order created successfully! It will be processed after admin approval.',
          [
            {
              text: 'OK',
              onPress: () => {
                // Reset form
                setCart([]);
                setReceiverUsername('');
                setReceiverUser(null);
                setUserNotes('');
                
                // Navigate to orders screen
                navigation.navigate('MyOrders');
              }
            }
          ]
        );
      }
    } catch (error) {
      Alert.alert('Error', error.response?.data?.message || 'Failed to create order');
    } finally {
      setLoading(false);
    }
  };

  const renderProductCard = ({ item }) => (
    <Card style={styles.productCard}>
      <Card.Content>
        <View style={styles.productHeader}>
          <Text style={styles.productName}>{item.name}</Text>
          <Text style={styles.productPrice}>₹{item.price}</Text>
        </View>
        <Text style={styles.productDescription} numberOfLines={2}>
          {item.description}
        </Text>
        <View style={styles.productFooter}>
          <Text style={styles.productStock}>Stock: {item.stock}</Text>
          <TouchableOpacity
            style={styles.addButton}
            onPress={() => addToCart(item)}
            disabled={item.stock <= 0}
          >
            <Icon name="cart-plus" size={20} color="white" />
            <Text style={styles.addButtonText}>Add</Text>
          </TouchableOpacity>
        </View>
      </Card.Content>
    </Card>
  );

  const renderCartItem = ({ item }) => (
    <Card style={styles.cartItem}>
      <Card.Content>
        <View style={styles.cartItemHeader}>
          <View style={styles.cartItemInfo}>
            <Text style={styles.cartItemName}>{item.product.name}</Text>
            <Text style={styles.cartItemPrice}>₹{item.price} × {item.quantity}</Text>
          </View>
          <Text style={styles.cartItemTotal}>₹{item.price * item.quantity}</Text>
        </View>
        <View style={styles.cartItemActions}>
          <View style={styles.quantityControls}>
            <TouchableOpacity
              style={styles.quantityButton}
              onPress={() => updateQuantity(item.product._id, item.quantity - 1)}
            >
              <Icon name="minus" size={18} color="#FF4757" />
            </TouchableOpacity>
            <Text style={styles.quantityText}>{item.quantity}</Text>
            <TouchableOpacity
              style={styles.quantityButton}
              onPress={() => updateQuantity(item.product._id, item.quantity + 1)}
              disabled={item.quantity >= item.product.stock}
            >
              <Icon name="plus" size={18} color="#4CAF50" />
            </TouchableOpacity>
          </View>
          <TouchableOpacity
            style={styles.removeButton}
            onPress={() => removeFromCart(item.product._id)}
          >
            <Icon name="delete" size={20} color="#FF4757" />
          </TouchableOpacity>
        </View>
      </Card.Content>
    </Card>
  );

  return (

    <SafeAreaView style={{flex:1}}>

          <ScrollView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Icon name="arrow-left" size={24} color="#333" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Create Order</Text>
        <View style={{ width: 24 }} />
      </View>

      {/* Wallet Balance */}
      <Card style={styles.walletCard}>
        <Card.Content>
          <View style={styles.walletHeader}>
            <Icon name="wallet" size={24} color="#4CAF50" />
            <Text style={styles.walletTitle}>Wallet Balance</Text>
          </View>
          <Text style={styles.walletBalance}>₹{walletBalance}</Text>
        </Card.Content>
      </Card>

      {/* Receiver Selection */}
      <Card style={styles.sectionCard}>
        <Card.Content>
          <Text style={styles.sectionTitle}>Receiver Information</Text>
          
          {receiverUser ? (
            <View style={styles.receiverInfo}>
              <View style={styles.receiverAvatar}>
                <Icon name="account" size={30} color="#2196F3" />
              </View>
              <View style={styles.receiverDetails}>
                <Text style={styles.receiverName}>
                  {receiverUser.name || receiverUser.username}
                </Text>
                <Text style={styles.receiverText}>
                  {receiverUser.businessName || 'Individual'}
                </Text>
                <Text style={styles.receiverText}>
                  {receiverUser.mobile} • {receiverUser.role}
                </Text>
              </View>
              <TouchableOpacity onPress={() => setReceiverUser(null)}>
                <Icon name="close-circle" size={24} color="#FF4757" />
              </TouchableOpacity>
            </View>
          ) : (
            <TouchableOpacity
              style={styles.searchButton}
              onPress={() => setShowSearchModal(true)}
            >
              <Icon name="account-search" size={24} color="#2196F3" />
              <Text style={styles.searchButtonText}>Select Receiver</Text>
            </TouchableOpacity>
          )}
        </Card.Content>
      </Card>

      {/* Payment Method */}
      <Card style={styles.sectionCard}>
        <Card.Content>
          <Text style={styles.sectionTitle}>Payment Method</Text>
          <View style={styles.paymentMethods}>
            <TouchableOpacity
              style={[
                styles.paymentMethod,
                paymentMethod === 'cash-on-delivery' && styles.paymentMethodSelected
              ]}
              onPress={() => setPaymentMethod('cash-on-delivery')}
            >
              <Icon 
                name="cash" 
                size={24} 
                color={paymentMethod === 'cash-on-delivery' ? '#4CAF50' : '#666'} 
              />
              <Text style={[
                styles.paymentMethodText,
                paymentMethod === 'cash-on-delivery' && styles.paymentMethodTextSelected
              ]}>
                Cash on Delivery
              </Text>
            </TouchableOpacity>
            
            <TouchableOpacity
              style={[
                styles.paymentMethod,
                paymentMethod === 'reward-payment' && styles.paymentMethodSelected
              ]}
              onPress={() => setPaymentMethod('reward-payment')}
            >
              <Icon 
                name="gift" 
                size={24} 
                color={paymentMethod === 'reward-payment' ? '#FF9800' : '#666'} 
              />
              <Text style={[
                styles.paymentMethodText,
                paymentMethod === 'reward-payment' && styles.paymentMethodTextSelected
              ]}>
                Wallet Payment
              </Text>
            </TouchableOpacity>
          </View>
          
          {paymentMethod === 'reward-payment' && (
            <View style={styles.walletWarning}>
              <Icon name="information" size={16} color="#FF9800" />
              <Text style={styles.walletWarningText}>
                Amount will be deducted from your wallet upon admin approval
              </Text>
            </View>
          )}
        </Card.Content>
      </Card>

      {/* Products List */}
      <Card style={styles.sectionCard}>
        <Card.Content>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Products</Text>
            <Badge size={24} style={styles.badge}>
              {cart.length}
            </Badge>
          </View>
          <FlatList
            data={products}
            renderItem={renderProductCard}
            keyExtractor={item => item._id}
            scrollEnabled={false}
            contentContainerStyle={styles.productsList}
          />
        </Card.Content>
      </Card>

      {/* Cart Items */}
      {cart.length > 0 && (
        <Card style={styles.sectionCard}>
          <Card.Content>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Cart Items</Text>
              <Text style={styles.cartTotal}>Total: ₹{calculateTotal()}</Text>
            </View>
            <FlatList
              data={cart}
              renderItem={renderCartItem}
              keyExtractor={item => item.product._id}
              scrollEnabled={false}
              contentContainerStyle={styles.cartList}
            />
          </Card.Content>
        </Card>
      )}

      {/* Notes */}
      <Card style={styles.sectionCard}>
        <Card.Content>
          <Text style={styles.sectionTitle}>Notes (Optional)</Text>
          <TextInput
            style={styles.notesInput}
            value={userNotes}
            onChangeText={setUserNotes}
            placeholder="Add any special instructions..."
            multiline
            numberOfLines={3}
            textAlignVertical="top"
          />
        </Card.Content>
      </Card>

      {/* Create Order Button */}
      <View style={styles.footer}>
        <Button
          mode="contained"
          onPress={createOrder}
          loading={loading}
          disabled={!receiverUser || cart.length === 0 || loading}
          style={styles.createButton}
          labelStyle={styles.createButtonLabel}
        >
          {loading ? 'Creating Order...' : `Create Order (₹${calculateTotal()})`}
        </Button>
      </View>

      {/* Receiver Search Modal */}
      <Modal
        visible={showSearchModal}
        animationType="slide"
        transparent={true}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Search Receiver</Text>
              <TouchableOpacity onPress={() => setShowSearchModal(false)}>
                <Icon name="close" size={24} color="#666" />
              </TouchableOpacity>
            </View>
            
            <View style={styles.searchContainer}>
              <TextInput
                style={styles.searchInput}
                value={receiverUsername}
                onChangeText={setReceiverUsername}
                placeholder="Enter username"
                autoCapitalize="none"
                onSubmitEditing={searchReceiver}
              />
              <TouchableOpacity
                style={styles.searchSubmitButton}
                onPress={searchReceiver}
                disabled={searchLoading}
              >
                {searchLoading ? (
                  <ActivityIndicator color="white" />
                ) : (
                  <Icon name="magnify" size={20} color="white" />
                )}
              </TouchableOpacity>
            </View>
            
            <Text style={styles.modalHint}>
              Enter the username of distributor, dealer, or mechanic
            </Text>
          </View>
        </View>
      </Modal>
    </ScrollView>
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
  walletCard: {
    margin: 15,
    backgroundColor: '#E8F5E9',
  },
  walletHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 5,
  },
  walletTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginLeft: 10,
  },
  walletBalance: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#4CAF50',
  },
  sectionCard: {
    marginHorizontal: 15,
    marginBottom: 15,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 15,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  searchButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 15,
    backgroundColor: '#E3F2FD',
    borderRadius: 8,
  },
  searchButtonText: {
    fontSize: 16,
    color: '#2196F3',
    marginLeft: 10,
    fontWeight: '500',
  },
  receiverInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F8F9FA',
    padding: 15,
    borderRadius: 8,
  },
  receiverAvatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: '#E3F2FD',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 15,
  },
  receiverDetails: {
    flex: 1,
  },
  receiverName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 2,
  },
  receiverText: {
    fontSize: 14,
    color: '#666',
    marginBottom: 2,
  },
  paymentMethods: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  paymentMethod: {
    flex: 1,
    alignItems: 'center',
    padding: 15,
    backgroundColor: '#F5F5F5',
    borderRadius: 8,
    marginHorizontal: 5,
  },
  paymentMethodSelected: {
    backgroundColor: '#E8F5E9',
    borderWidth: 2,
    borderColor: '#4CAF50',
  },
  paymentMethodText: {
    marginTop: 5,
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
  },
  paymentMethodTextSelected: {
    color: '#4CAF50',
    fontWeight: 'bold',
  },
  walletWarning: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFF3E0',
    padding: 10,
    borderRadius: 5,
    marginTop: 10,
  },
  walletWarningText: {
    fontSize: 12,
    color: '#FF9800',
    marginLeft: 8,
    flex: 1,
  },
  productCard: {
    marginBottom: 10,
  },
  productHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 5,
  },
  productName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    flex: 1,
  },
  productPrice: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#4CAF50',
  },
  productDescription: {
    fontSize: 14,
    color: '#666',
    marginBottom: 10,
  },
  productFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  productStock: {
    fontSize: 14,
    color: '#666',
  },
  addButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#2196F3',
    paddingHorizontal: 15,
    paddingVertical: 8,
    borderRadius: 5,
  },
  addButtonText: {
    color: 'white',
    marginLeft: 5,
    fontWeight: '500',
  },
  cartItem: {
    marginBottom: 10,
  },
  cartItemHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  cartItemInfo: {
    flex: 1,
  },
  cartItemName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
  },
  cartItemPrice: {
    fontSize: 14,
    color: '#666',
  },
  cartItemTotal: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#4CAF50',
  },
  cartItemActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  quantityControls: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  quantityButton: {
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: '#F5F5F5',
    justifyContent: 'center',
    alignItems: 'center',
  },
  quantityText: {
    fontSize: 16,
    fontWeight: 'bold',
    marginHorizontal: 15,
    minWidth: 30,
    textAlign: 'center',
  },
  removeButton: {
    padding: 8,
  },
  cartTotal: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#4CAF50',
  },
  notesInput: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 12,
    fontSize: 14,
    minHeight: 100,
    backgroundColor: '#FAFAFA',
  },
  footer: {
    padding: 20,
    backgroundColor: '#FFFFFF',
  },
  createButton: {
    backgroundColor: '#4CAF50',
    paddingVertical: 8,
  },
  createButtonLabel: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  badge: {
    backgroundColor: '#2196F3',
  },
  productsList: {
    paddingBottom: 5,
  },
  cartList: {
    paddingBottom: 5,
  },
  // Modal Styles
  modalContainer: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: 'white',
    borderRadius: 15,
    padding: 20,
    width: '90%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  searchInput: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    marginRight: 10,
  },
  searchSubmitButton: {
    backgroundColor: '#2196F3',
    width: 50,
    height: 50,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalHint: {
    fontSize: 12,
    color: '#666',
    textAlign: 'center',
    marginTop: 10,
  },
});

export default CreateOrderScreen;