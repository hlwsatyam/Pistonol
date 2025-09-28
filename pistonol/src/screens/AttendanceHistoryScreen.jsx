// AttendanceHistoryScreen.js
import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, FlatList, ActivityIndicator } from 'react-native';
import axios from 'axios';
import { useAuth } from './AuthContext';

const AttendanceHistoryScreen = () => {
  const [attendance, setAttendance] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const { user } = useAuth();

  useEffect(() => {
    fetchAttendance();
  }, []);

  const fetchAttendance = async (pageNum = 1) => {
    try {
      const response = await axios.get(`/api/attendance/history?page=${pageNum}&limit=20`);
      if (pageNum === 1) {
        setAttendance(response.data.attendance);
      } else {
        setAttendance(prev => [...prev, ...response.data.attendance]);
      }
      setHasMore(pageNum < response.data.totalPages);
    } catch (error) {
      console.error('Error fetching attendance history:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadMore = () => {
    if (hasMore && !loading) {
      const nextPage = page + 1;
      setPage(nextPage);
      fetchAttendance(nextPage);
    }
  };

  const renderItem = ({ item }) => (
    <View style={styles.item}>
      <Text style={styles.date}>
        {new Date(item.createdAt).toLocaleDateString()}
      </Text>
      <Text>Store: {item.store?.name}</Text>
      <Text>Check-in: {new Date(item.checkIn.time).toLocaleTimeString()}</Text>
      {item.checkOut && (
        <Text>Check-out: {new Date(item.checkOut.time).toLocaleTimeString()}</Text>
      )}
      <Text>Status: {item.status}</Text>
    </View>
  );

  if (loading && page === 1) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Attendance History</Text>
      <FlatList
        data={attendance}
        renderItem={renderItem}
        keyExtractor={item => item._id}
        onEndReached={loadMore}
        onEndReachedThreshold={0.5}
        ListFooterComponent={
          loading ? <ActivityIndicator size="small" /> : null
        }
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
    textAlign: 'center',
  },
  item: {
    padding: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  date: {
    fontWeight: 'bold',
    marginBottom: 5,
  },
  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
});

export default AttendanceHistoryScreen;