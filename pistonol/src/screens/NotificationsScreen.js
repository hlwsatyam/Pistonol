import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  RefreshControl,
  Alert,
  ActivityIndicator,
 
} from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import axios from 'axios';
import { useRoute, useNavigation, useFocusEffect } from '@react-navigation/native';
import { SafeAreaView } from 'react-native-safe-area-context';

const NotificationsScreenFromEmp = () => {
  const route = useRoute();
  const navigation = useNavigation();
  const { userId } = route.params;
  
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);

  const fetchNotifications = async (pageNum = 1, isRefresh = false) => {
    try {
      const response = await axios.get(
        `/notifications/user/${userId}?page=${pageNum}&limit=20`
      );
      
      if (response.data.success) {
        if (isRefresh) {
          setNotifications(response.data.data);
        } else {
          setNotifications(prev => [...prev, ...response.data.data]);
        }
        
        const totalPages = response.data.pagination.totalPages;
        setHasMore(pageNum < totalPages);
      }
    } catch (error) {
      console.error('Error fetching notifications:', error);
      Alert.alert('Error', 'Failed to load notifications');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useFocusEffect(
    React.useCallback(() => {
      fetchNotifications(1, true);
      setPage(1);
    }, [userId])
  );

  const onRefresh = () => {
    setRefreshing(true);
    setPage(1);
    fetchNotifications(1, true);
  };

  const loadMore = () => {
    if (!loading && hasMore) {
      const nextPage = page + 1;
      setPage(nextPage);
      fetchNotifications(nextPage);
    }
  };

  const markAsRead = async (notificationId) => {
    try {
      await axios.patch(
        `/notifications/${notificationId}/read`
      );
      
      // Update local state
      setNotifications(prev =>
        prev.map(notif =>
          notif._id === notificationId
            ? { ...notif, isRead: true, readAt: new Date() }
            : notif
        )
      );
    } catch (error) {
      console.error('Error marking as read:', error);
    }
  };

  const markAllAsRead = async () => {
    try {
      await axios.patch(
        `/notifications/user/${userId}/read-all`
      );
      
      // Update all notifications to read
      setNotifications(prev =>
        prev.map(notif => ({ ...notif, isRead: true }))
      );
      
      Alert.alert('Success', 'All notifications marked as read');
    } catch (error) {
      console.error('Error marking all as read:', error);
    }
  };

  const deleteNotification = async (notificationId) => {
    Alert.alert(
      'Delete Notification',
      'Are you sure you want to delete this notification?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              await axios.delete(
                `/notifications/${notificationId}`
              );
              
              // Remove from local state
              setNotifications(prev =>
                prev.filter(notif => notif._id !== notificationId)
              );
            } catch (error) {
              console.error('Error deleting notification:', error);
            }
          }
        }
      ]
    );
  };

  const renderNotificationItem = ({ item }) => (
    <View style={[
      styles.notificationItem,
      !item.isRead && styles.unreadNotification
    ]}>
      <View style={styles.notificationHeader}>
        <Text style={styles.notificationTitle}>{item.title}</Text>
        <TouchableOpacity onPress={() => deleteNotification(item._id)}>
          <Icon name="close" size={20} color="#999" />
        </TouchableOpacity>
      </View>
      
      <Text style={styles.notificationMessage}>{item.message}</Text>
      
      <View style={styles.notificationFooter}>
        <View style={[
          styles.typeBadge,
          { backgroundColor: getTypeColor(item.type) }
        ]}>
          <Text style={styles.typeText}>{item.type.toUpperCase()}</Text>
        </View>
        
        <Text style={styles.notificationTime}>
          {formatDate(item.createdAt)}
        </Text>
      </View>
      
      {!item.isRead && (
        <TouchableOpacity
          style={styles.markAsReadButton}
          onPress={() => markAsRead(item._id)}
        >
          <Icon name="checkmark-circle" size={16} color="#4CAF50" />
          <Text style={styles.markAsReadText}>Mark as Read</Text>
        </TouchableOpacity>
      )}
    </View>
  );

  const getTypeColor = (type) => {
    const colors = {
      info: '#007AFF',
      warning: '#FF9500',
      success: '#34C759',
      error: '#FF3B30'
    };
    return colors[type] || '#007AFF';
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now - date;
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 60) {
      return `${diffMins} min ago`;
    } else if (diffHours < 24) {
      return `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`;
    } else if (diffDays < 7) {
      return `${diffDays} day${diffDays > 1 ? 's' : ''} ago`;
    } else {
      return date.toLocaleDateString();
    }
  };

  const renderFooter = () => {
    if (!hasMore) {
      return (
        <View style={styles.footer}>
          <Text style={styles.footerText}>No more notifications</Text>
        </View>
      );
    }
    
    return (
      <View style={styles.footer}>
        <ActivityIndicator size="small" color="#007AFF" />
      </View>
    );
  };

  if (loading && notifications.length === 0) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.centerContainer}>
          <ActivityIndicator size="large" color="#007AFF" />
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Icon name="arrow-back" size={24} color="#333" />
        </TouchableOpacity>
        
        <Text style={styles.headerTitle}>Message Box</Text>
        
        <TouchableOpacity
          style={styles.markAllButton}
          onPress={markAllAsRead}
        >
          <Icon name="checkmark-done" size={24} color="#007AFF" />
        </TouchableOpacity>
      </View>

      {/* Notifications List */}
      <FlatList
        data={notifications}
        renderItem={renderNotificationItem}
        keyExtractor={(item) => item._id}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={['#007AFF']}
          />
        }
        onEndReached={loadMore}
        onEndReachedThreshold={0.5}
        ListFooterComponent={renderFooter}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Icon name="notifications-off" size={60} color="#ccc" />
            <Text style={styles.emptyText}>No notifications yet</Text>
            <Text style={styles.emptySubtext}>
              You'll see notifications from admin here
            </Text>
          </View>
        }
        contentContainerStyle={styles.listContent}
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5'
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center'
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: 'white',
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0'
  },
  backButton: {
    padding: 8
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333'
  },
  markAllButton: {
    padding: 8
  },
  listContent: {
    padding: 16
  },
  notificationItem: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2
  },
  unreadNotification: {
    borderLeftWidth: 4,
    borderLeftColor: '#007AFF'
  },
  notificationHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 8
  },
  notificationTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    flex: 1,
    marginRight: 8
  },
  notificationMessage: {
    fontSize: 14,
    color: '#666',
    lineHeight: 20,
    marginBottom: 12
  },
  notificationFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center'
  },
  typeBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12
  },
  typeText: {
    color: 'white',
    fontSize: 10,
    fontWeight: 'bold'
  },
  notificationTime: {
    fontSize: 12,
    color: '#999'
  },
  markAsReadButton: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 12,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: '#f0f0f0'
  },
  markAsReadText: {
    fontSize: 14,
    color: '#4CAF50',
    marginLeft: 6
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60
  },
  emptyText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#999',
    marginTop: 16,
    marginBottom: 8
  },
  emptySubtext: {
    fontSize: 14,
    color: '#ccc',
    textAlign: 'center'
  },
  footer: {
    paddingVertical: 20,
    alignItems: 'center'
  },
  footerText: {
    color: '#999',
    fontSize: 14
  }
});

export default NotificationsScreenFromEmp;