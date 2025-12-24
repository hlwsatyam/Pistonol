import React, { useState, useEffect } from 'react';
import { TouchableOpacity, View, Text, StyleSheet } from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import axios from 'axios';
import { useNavigation } from '@react-navigation/native';

const NotificationIcon = ({ userId }) => {
  const [unreadCount, setUnreadCount] = useState(0);
  const navigation = useNavigation();

  const fetchUnreadCount = async () => {
    try {
      const response = await axios.get(
        `/notifications/user/${userId}/unread-count`
      );
      if (response.data.success) {
        setUnreadCount(response.data.data.unreadCount);
      }
    } catch (error) {
      console.error('Error fetching unread count:', error);
    }
  };

  useEffect(() => {
    if (userId) {
      fetchUnreadCount();
      
      // Fetch every 30 seconds for real-time updates
      const interval = setInterval(fetchUnreadCount, 30000);
      
      // Also fetch when app comes to foreground
      const unsubscribe = navigation.addListener('focus', fetchUnreadCount);
      
      return () => {
        clearInterval(interval);
        unsubscribe();
      };
    }
  }, [userId, navigation]);

  const handlePress = () => {
    navigation.navigate('NotificationsFromAdmin', { userId });
    
    // Refresh count after navigation
    setTimeout(fetchUnreadCount, 1000);
  };

  return (
    <TouchableOpacity onPress={handlePress} style={styles.container}>
      <Icon 
        name={unreadCount > 0 ? "notifications" : "notifications-outline"} 
        size={28} 
        color={unreadCount > 0 ? "#FF9500" : "#333"} 
      />
      
      {unreadCount > 0 && (
        <View style={styles.badge}>
          <Text style={styles.badgeText}>
            {unreadCount > 99 ? '99+' : unreadCount}
          </Text>
        </View>
      )}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    
  
  },
  badge: {
    position: 'absolute',
    top: 5,
    right: 5,
    backgroundColor: '#FF3B30',
    borderRadius: 10,
    minWidth: 20,
    height: 20,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: 'white'
  },
  badgeText: {
    color: 'white',
    fontSize: 10,
    fontWeight: 'bold',
    paddingHorizontal: 4
  }
});

export default NotificationIcon;