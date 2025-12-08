import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  RefreshControl,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';

const TransactionHistory = ({ navigation }) => {
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [user, setUser] = useState(null);

 

  useEffect(() => {
    loadUserData();
    fetchTransactions();
  }, []);

  const loadUserData = async () => {
    try {
      const userData = await AsyncStorage.getItem('user');
      if (userData) {
        setUser(JSON.parse(userData));
      }
    } catch (error) {
      console.error('Error loading user data:', error);
    }
  };

  const fetchTransactions = async () => {
    try {
      const userData = await AsyncStorage.getItem('user');
      if (userData) {
        const parsedUser = JSON.parse(userData);
        const response = await axios.get(
          `/transactions/user-transactions/${parsedUser._id}`
        );
        
        if (response.data.success) {
          setTransactions(response.data.transactions);
        }
      }
    } catch (error) {
      console.error('Error fetching transactions:', error);
      Alert.alert('Error', 'Failed to fetch transaction history');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const onRefresh = () => {
    setRefreshing(true);
    fetchTransactions();
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-IN', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getTransactionColor = (transaction) => {
    if (transaction.sender._id === user?._id) {
      return 'text-red-500'; // Sent money
    } else {
      return 'text-green-500'; // Received money
    }
  };

  const getTransactionType = (transaction) => {
    if (transaction.sender._id === user?._id) {
      return 'Sent';
    } else {
      return 'Received';
    }
  };

  const getTransactionParty = (transaction) => {
    if (transaction.sender._id === user?._id) {
      return `To: ${transaction.receiver.name} (${transaction.receiver.role})`;
    } else {
      return `From: ${transaction.sender.name} (${transaction.sender.role})`;
    }
  };

  if (loading) {
    return (
      <View className="flex-1 bg-gray-50">
        <View className="bg-gradient-to-r from-blue-500 to-red-500 px-4 py-6">
          <View className="flex-row items-center">
            <TouchableOpacity
              onPress={() => navigation.goBack()}
              className="mr-4"
            >
              <Text className="text-white text-lg">←</Text>
            </TouchableOpacity>
            <Text className="text-white text-xl font-bold">
              Transaction History
            </Text>
          </View>
        </View>
        <View className="flex-1 justify-center items-center">
          <ActivityIndicator size="large" color="#3B82F6" />
        </View>
      </View>
    );
  }

  return (
    <View className="flex-1 bg-gray-50">
      {/* Header */}
      <View className="bg-blue-500  px-4 py-6">
        <View className="flex-row items-center">
          <TouchableOpacity
            onPress={() => navigation.goBack()}
            className="mr-4"
          >
            <Text className="text-white text-lg">←</Text>
          </TouchableOpacity>
          <Text className="text-white text-xl font-bold">
            Transaction History
          </Text>
        </View>
      </View>

      <ScrollView
        className="flex-1 p-4"
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        {transactions.length === 0 ? (
          <View className="bg-white rounded-2xl p-8 items-center justify-center mt-8">
            <Text className="text-gray-500 text-lg font-medium">
              No transactions found
            </Text>
            <Text className="text-gray-400 text-center mt-2">
              Your transaction history will appear here
            </Text>
          </View>
        ) : (
          transactions.map((transaction, index) => (
            <View
              key={transaction._id}
              className="bg-white rounded-2xl p-4 mb-3 shadow-sm border-l-4 border-blue-400"
            >
              <View className="flex-row justify-between items-start mb-2">
                <View className="flex-1">
                  <Text className="text-gray-800 font-semibold text-lg">
                    ₹{transaction.amount.toFixed(2)}
                  </Text>
                  <Text className="text-gray-600 text-sm mt-1">
                    {getTransactionParty(transaction)}
                  </Text>
                  <Text className="text-gray-400 text-xs mt-1">
                    {formatDate(transaction.createdAt)}
                  </Text>
                </View>
                <View className="items-end">
                  <Text className={`font-medium ${getTransactionColor(transaction)}`}>
                    {getTransactionType(transaction)}
                  </Text>
                  <Text className="text-gray-400 text-xs mt-1 capitalize">
                    {transaction.type}
                  </Text>
                </View>
              </View>
            </View>
          ))
        )}
      </ScrollView>
    </View>
  );
};

export default TransactionHistory;