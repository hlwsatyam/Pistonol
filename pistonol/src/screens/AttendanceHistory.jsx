import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
 
  TouchableOpacity,
  RefreshControl,
  ActivityIndicator,
  FlatList,
 
  Alert
} from 'react-native';
import axios from 'axios';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { useRoute, useNavigation } from '@react-navigation/native';
import { SafeAreaView } from 'react-native-safe-area-context';

 

const AttendanceHistory = () => {
  const route = useRoute();
  const navigation = useNavigation();
  const { userId } = route.params;

  const [attendance, setAttendance] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [loadingMore, setLoadingMore] = useState(false);
  const [stats, setStats] = useState({
    present: 0,
    absent: 0,
    halfDay: 0,
    leave: 0,
    totalHours: 0
  });

  useEffect(() => {
    fetchAttendance();
  }, [page]);

  const fetchAttendance = async (isRefresh = false) => {
    try {
      if (isRefresh) {
        setRefreshing(true);
      } else if (page === 1) {
        setLoading(true);
      } else {
        setLoadingMore(true);
      }

      const response = await axios.get(`/attendance/history`, {
        params: {
          page,userId:userId,
          limit: 20
        },
        
      });

      if (response.data) {
        if (isRefresh || page === 1) {
          setAttendance(response.data.attendance || []);
        } else {
          setAttendance(prev => [...prev, ...(response.data.attendance || [])]);
        }
        
        setTotalPages(response.data.totalPages || 1);
        calculateStats(response.data.attendance || []);
      }
    } catch (error) {
      console.error('Error fetching attendance:', error);
      Alert.alert('Error', 'Failed to load attendance history');
    } finally {
      setLoading(false);
      setRefreshing(false);
      setLoadingMore(false);
    }
  };

  const calculateStats = (attendanceData) => {
    const stats = {
      present: 0,
      absent: 0,
      halfDay: 0,
      leave: 0,
      totalHours: 0
    };

    attendanceData.forEach(record => {
      switch (record.status) {
        case 'present':
          stats.present++;
          break;
        case 'absent':
          stats.absent++;
          break;
        case 'half-day':
          stats.halfDay++;
          break;
        case 'leave':
          stats.leave++;
          break;
      }
      stats.totalHours += record.workingHours || 0;
    });

    setStats(stats);
  };

  const onRefresh = () => {
    setPage(1);
    fetchAttendance(true);
  };

  const loadMore = () => {
    if (page < totalPages && !loadingMore) {
      setPage(prev => prev + 1);
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-IN', {
      day: '2-digit',
      month: 'short',
      year: 'numeric'
    });
  };

  const formatTime = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString('en-IN', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: true
    });
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'present':
        return { icon: 'check-circle', color: '#4CAF50' };
      case 'absent':
        return { icon: 'close-circle', color: '#F44336' };
      case 'half-day':
        return { icon: 'clock-time-four', color: '#FF9800' };
      case 'leave':
        return { icon: 'calendar-remove', color: '#2196F3' };
      default:
        return { icon: 'help-circle', color: '#9E9E9E' };
    }
  };

  const getStatusText = (status) => {
    switch (status) {
      case 'present': return 'Present';
      case 'absent': return 'Absent';
      case 'half-day': return 'Half Day';
      case 'leave': return 'Leave';
      default: return status;
    }
  };

  
  const renderAttendanceItem = ({ item }) => {
    const statusIcon = getStatusIcon(item.status);
    const checkInTime = item.checkIn?.time ? formatTime(item.checkIn.time) : '--:--';
    const checkOutTime = item.checkOut?.time ? formatTime(item.checkOut.time) : '--:--';
    const storeName = item.store?.name || 'Unknown Store';
    const date = formatDate(item.checkIn?.time || item.createdAt);

    return (
      <TouchableOpacity
        style={styles.attendanceCard}
        onPress={() => {
          // Navigate to detail view if needed
          // navigation.navigate('AttendanceDetail', { attendanceId: item._id });
        }}
      >
        <View style={styles.attendanceHeader}>
          <View style={styles.dateContainer}>
            <Icon name="calendar" size={16} color="#666" />
            <Text style={styles.dateText}>{date}</Text>
          </View>
          
          <View style={styles.statusContainer}>
            <Icon name={statusIcon.icon} size={20} color={statusIcon.color} />
            <Text style={[styles.statusText, { color: statusIcon.color }]}>
              {getStatusText(item.status)}
            </Text>
          </View>
        </View>

        <View style={styles.storeContainer}>
          <Icon name="store" size={16} color="#666" />
          <Text style={styles.storeText} numberOfLines={1}>{storeName}</Text>
        </View>

        <View style={styles.timeContainer}>
          <View style={styles.timeBlock}>
            <View style={styles.timeIconContainer}>
              <Icon name="login" size={18} color="#4CAF50" />
            </View>
            <View>
              <Text style={styles.timeLabel}>Check In</Text>
              <Text style={styles.timeValue}>{checkInTime}</Text>
            
            </View>
          </View>

          <View style={styles.separator}>
            <View style={styles.line} />
            <Text style={styles.hoursText}>{item.workingHours?.toFixed(1) || '0.0'} hrs</Text>
            <View style={styles.line} />
          </View>

          <View style={styles.timeBlock}>
            <View style={styles.timeIconContainer}>
              <Icon name="logout" size={18} color="#F44336" />
            </View>
            <View>
              <Text style={styles.timeLabel}>Check Out</Text>
              <Text style={styles.timeValue}>{checkOutTime}</Text>
            
            </View>
          </View>
        </View>

        {item.checkIn?.image?.url && (
          <TouchableOpacity
            style={styles.imageContainer}
            onPress={() => {
              // Show image in full screen
              // navigation.navigate('ImageView', { imageUrl: item.checkIn.image.url });
            }}
          >
            <Icon name="image" size={16} color="#666" />
            <Text style={styles.imageText}>Check-in photo available</Text>
          </TouchableOpacity>
        )}
      </TouchableOpacity>
    );
  };

  const renderFooter = () => {
    if (loadingMore) {
      return (
        <View style={styles.footer}>
          <ActivityIndicator size="small" color="#007AFF" />
        </View>
      );
    }
    
    if (page >= totalPages && attendance.length > 0) {
      return (
        <View style={styles.footer}>
          <Text style={styles.footerText}>No more records</Text>
        </View>
      );
    }
    
    return null;
  };

  const renderEmpty = () => (
    <View style={styles.emptyContainer}>
      <Icon name="calendar-blank" size={80} color="#E0E0E0" />
      <Text style={styles.emptyTitle}>No Attendance Records</Text>
      <Text style={styles.emptySubtitle}>
        Your attendance history will appear here once you start checking in.
      </Text>
      <TouchableOpacity
        style={styles.refreshButton}
        onPress={onRefresh}
      >
        <Icon name="refresh" size={20} color="#007AFF" />
        <Text style={styles.refreshButtonText}>Refresh</Text>
      </TouchableOpacity>
    </View>
  );

  if (loading && page === 1) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#007AFF" />
        <Text style={styles.loadingText}>Loading attendance...</Text>
      </View>
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
          <Icon name="arrow-left" size={24} color="#333" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Attendance History</Text>
        <TouchableOpacity
          style={styles.refreshHeaderButton}
          onPress={onRefresh}
          disabled={refreshing}
        >
          <Icon
            name="refresh"
            size={22}
            color={refreshing ? '#999' : '#007AFF'}
            style={refreshing ? styles.refreshingIcon : null}
          />
        </TouchableOpacity>
      </View>

 

      {/* Attendance List */}
      <FlatList
        data={attendance}
        renderItem={renderAttendanceItem}
        keyExtractor={(item) => item._id}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={['#007AFF']}
            tintColor="#007AFF"
          />
        }
        onEndReached={loadMore}
        onEndReachedThreshold={0.5}
        ListFooterComponent={renderFooter}
        ListEmptyComponent={renderEmpty}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F5F5',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F5F5F5',
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    color: '#666',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: 'white',
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
  backButton: {
    padding: 8,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  refreshHeaderButton: {
    padding: 8,
  },
  refreshingIcon: {
    transform: [{ rotate: '360deg' }],
  },
  statsContainer: {
    padding: 16,
    backgroundColor: 'white',
    marginBottom: 8,
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  statCard: {
    flex: 1,
    alignItems: 'center',
    padding: 12,
    borderRadius: 12,
    marginHorizontal: 4,
  },
  statNumber: {
    fontSize: 20,
    fontWeight: 'bold',
    marginVertical: 4,
  },
  statLabel: {
    fontSize: 12,
    color: '#666',
    fontWeight: '500',
  },
  totalHoursCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F3E5F5',
    padding: 16,
    borderRadius: 12,
  },
  totalHoursContent: {
    marginLeft: 12,
    flex: 1,
  },
  totalHoursText: {
    fontSize: 14,
    color: '#666',
    fontWeight: '500',
  },
  totalHoursValue: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#673AB7',
    marginTop: 2,
  },
  listContent: {
    padding: 16,
    paddingTop: 8,
  },
  attendanceCard: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  attendanceHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  dateContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  dateText: {
    fontSize: 14,
    color: '#666',
    marginLeft: 6,
    fontWeight: '500',
  },
  statusContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 20,
    backgroundColor: '#F8F9FA',
  },
  statusText: {
    fontSize: 12,
    fontWeight: '600',
    marginLeft: 4,
  },
  storeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  storeText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginLeft: 8,
    flex: 1,
  },
  timeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  timeBlock: {
    flex: 1,
  },
  timeIconContainer: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#F8F9FA',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  timeLabel: {
    fontSize: 12,
    color: '#666',
    marginBottom: 2,
  },
  timeValue: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 4,
  },
  locationText: {
    fontSize: 11,
    color: '#999',
    fontStyle: 'italic',
  },
  separator: {
    alignItems: 'center',
    paddingHorizontal: 8,
  },
  line: {
    width: 40,
    height: 1,
    backgroundColor: '#E0E0E0',
    marginVertical: 4,
  },
  hoursText: {
    fontSize: 12,
    color: '#666',
    fontWeight: '500',
    paddingHorizontal: 8,
  },
  imageContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    backgroundColor: '#F8F9FA',
    borderRadius: 8,
    marginTop: 8,
  },
  imageText: {
    fontSize: 14,
    color: '#666',
    marginLeft: 8,
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#666',
    marginTop: 16,
    marginBottom: 8,
  },
  emptySubtitle: {
    fontSize: 14,
    color: '#999',
    textAlign: 'center',
    paddingHorizontal: 40,
    lineHeight: 20,
  },
  refreshButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#E3F2FD',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 25,
    marginTop: 20,
  },
  refreshButtonText: {
    fontSize: 14,
    color: '#007AFF',
    fontWeight: '500',
    marginLeft: 6,
  },
  footer: {
    paddingVertical: 20,
    alignItems: 'center',
  },
  footerText: {
    fontSize: 14,
    color: '#999',
  },
});

export default AttendanceHistory;