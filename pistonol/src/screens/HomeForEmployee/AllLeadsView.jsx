import React, {useState, useCallback} from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
  RefreshControl,
 
} from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import {useInfiniteQuery} from '@tanstack/react-query';
import axios from 'axios';
import LinearGradient from 'react-native-linear-gradient';
import { SafeAreaView } from 'react-native-safe-area-context';

const PAGE_SIZE = 15; // बड़ा page size for infinite scroll

const AllLeadsView = ({route, navigation}) => {
  const {userId, userName} = route.params;
  const [refreshing, setRefreshing] = useState(false);

  const {
    data,
    isLoading,
    isFetchingNextPage,
    hasNextPage,
    fetchNextPage,
    refetch,
    isRefetching,
  } = useInfiniteQuery({
    queryKey: ['allLeads', userId],
    queryFn: async ({pageParam = 1}) => {
      const response = await axios.get(
        `/leads?userId=${userId}&page=${pageParam}&limit=${PAGE_SIZE}`,
      );
      return response.data;
    },
    getNextPageParam: (lastPage, allPages) => {
      if (lastPage.length < PAGE_SIZE) return undefined;
      return allPages.length + 1;
    },
    enabled: !!userId,
  });

  const allLeads = data?.pages.flat() || [];

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await refetch();
    setRefreshing(false);
  }, [refetch]);

  const loadMore = useCallback(() => {
    if (hasNextPage && !isFetchingNextPage) {
      fetchNextPage();
    }
  }, [hasNextPage, isFetchingNextPage, fetchNextPage]);

  const renderFooter = () => {
    if (!isFetchingNextPage) return null;
    return (
      <View style={styles.footer}>
        <ActivityIndicator size="small" color="#007AFF" />
        <Text style={styles.loadingText}>Loading more leads...</Text>
      </View>
    );
  };

  const renderLeadItem = ({item}) => (
    <TouchableOpacity
      style={styles.leadCard}
      onPress={() => navigation.navigate('LeadDetail', {leadId: item._id})}
      activeOpacity={0.7}>
      
      <LinearGradient
        colors={['#FF6B6B', 'white', 'white']}
        style={styles.gradientCard}
        start={{x: 0, y: 0}}
        end={{x: 1, y: 1}}>
        
        {/* Header with Garage Name and Status */}
        <View style={styles.leadHeader}>
          <View style={styles.nameContainer}>
            <Ionicons
              name="business-outline"
              size={22}
              color="#000"
              style={styles.icon}
            />
            <Text style={styles.garageName} numberOfLines={1}>
              {item.garageName}
            </Text>
          </View>
          
          <View style={[
            styles.statusBadge,
            getStatusStyle(item.status)
          ]}>
            <Text style={styles.statusText}>{item.status || 'New'}</Text>
          </View>
        </View>

        {/* Contact Information */}
        <View style={styles.infoRow}>
          <Ionicons name="person-outline" size={16} color="#000" />
          <Text style={styles.infoText}>{item.contactName}</Text>
        </View>

        {/* Mobile Number */}
        <View style={styles.infoRow}>
          <Ionicons name="call-outline" size={16} color="#000" />
          <Text style={styles.infoText}>{item.mobile}</Text>
        </View>

        {/* Location */}
        <View style={styles.infoRow}>
          <Ionicons name="location-outline" size={16} color="#000" />
          <Text style={styles.infoText} numberOfLines={1}>
            {item.city}, {item.state}
          </Text>
        </View>

        {/* Created Date */}
        <View style={styles.infoRow}>
          <Ionicons name="time-outline" size={16} color="#000" />
          <Text style={styles.infoText}>
            {new Date(item.createdAt).toLocaleString()}
          </Text>
        </View>

        {/* Feedback Count Badge */}
        {item.feedbacks?.length > 0 && (
          <View style={styles.feedbackBadge}>
            <Ionicons name="chatbubble-ellipses-outline" size={14} color="#fff" />
            <Text style={styles.feedbackCount}>{item.feedbacks.length}</Text>
          </View>
        )}
      </LinearGradient>
    </TouchableOpacity>
  );

  const getStatusStyle = (status) => {
    switch(status?.toLowerCase()) {
      case 'new':
        return styles.statusNew;
      case 'in progress':
      case 'in-progress':
        return styles.statusInProgress;
      case 'converted':
        return styles.statusConverted;
      case 'rejected':
        return styles.statusRejected;
      default:
        return styles.statusNew;
    }
  };

  const renderHeader = () => (
    <View style={styles.headerContainer}>
      <TouchableOpacity 
        style={styles.backButton}
        onPress={() => navigation.goBack()}
        activeOpacity={0.7}>
        <Ionicons name="arrow-back" size={24} color="#007AFF" />
      </TouchableOpacity>
      
      <View style={styles.headerContent}>
        <Text style={styles.title}>All Leads</Text>
        <Text style={styles.subtitle}>{userName}'s Leads ({allLeads.length})</Text>
      </View>
    </View>
  );

  const renderEmpty = () => (
    <View style={styles.emptyContainer}>
      <Ionicons
        name="document-text-outline"
        size={80}
        color="#CCCCCC"
        style={styles.emptyIcon}
      />
      <Text style={styles.emptyTitle}>No Leads Found</Text>
      <Text style={styles.emptyMessage}>
        You haven't created any leads yet. Start by adding your first lead!
      </Text>
    </View>
  );

  return (
    <SafeAreaView style={styles.safeArea}>
      {renderHeader()}
      
      {isLoading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#007AFF" />
          <Text style={styles.loadingText}>Loading leads...</Text>
        </View>
      ) : (
        <FlatList
          data={allLeads}
          renderItem={renderLeadItem}
          keyExtractor={item => item._id}
          contentContainerStyle={styles.listContainer}
          showsVerticalScrollIndicator={false}
          onEndReached={loadMore}
          onEndReachedThreshold={0.3}
          ListFooterComponent={renderFooter}
          ListEmptyComponent={renderEmpty}
          refreshControl={
            <RefreshControl
              refreshing={refreshing || isRefetching}
              onRefresh={onRefresh}
              colors={['#007AFF']}
              tintColor="#007AFF"
            />
          }
          ItemSeparatorComponent={() => <View style={styles.separator} />}
        />
      )}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  headerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'white',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 1},
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  backButton: {
    padding: 8,
    marginRight: 12,
  },
  headerContent: {
    flex: 1,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
  },
  subtitle: {
    fontSize: 14,
    color: '#666',
    marginTop: 2,
  },
  listContainer: {
    padding: 16,
  },
  leadCard: {
    borderRadius: 12,
    overflow: 'hidden',
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  gradientCard: {
    borderRadius: 12,
    padding: 16,
    position: 'relative',
  },
  leadHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  nameContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    marginRight: 12,
  },
  icon: {
    marginRight: 10,
  },
  garageName: {
    fontSize: 18,
    fontWeight: '600',
    color: '#000',
    flex: 1,
  },
  statusBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    minWidth: 80,
    alignItems: 'center',
  },
  statusText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#000',
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  infoText: {
    color: '#000',
    marginLeft: 10,
    fontSize: 15,
    flex: 1,
  },
  feedbackBadge: {
    position: 'absolute',
    top: 12,
    right: 12,
    backgroundColor: '#000',
    borderRadius: 12,
    width: 28,
    height: 28,
    justifyContent: 'center',
    alignItems: 'center',
    flexDirection: 'row',
  },
  feedbackCount: {
    color: '#fff',
    fontSize: 12,
    fontWeight: 'bold',
    marginLeft: 4,
  },
  separator: {
    height: 16,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
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
    paddingVertical: 60,
  },
  emptyIcon: {
    marginBottom: 20,
    opacity: 0.5,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#888',
    marginBottom: 8,
  },
  emptyMessage: {
    fontSize: 16,
    color: '#aaa',
    textAlign: 'center',
    paddingHorizontal: 40,
  },
  footer: {
    paddingVertical: 20,
    alignItems: 'center',
  },
  // Status Colors
  statusNew: {
    backgroundColor: '#E3F2FD',
  },
  statusInProgress: {
    backgroundColor: '#FFF3E0',
  },
  statusConverted: {
    backgroundColor: '#E8F5E9',
  },
  statusRejected: {
    backgroundColor: '#FFEBEE',
  },
});

export default AllLeadsView;