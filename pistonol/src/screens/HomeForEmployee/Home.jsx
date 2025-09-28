

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
import {themeColor} from '../../locale/Locale';
import {useInfiniteQuery} from '@tanstack/react-query';
import axios from 'axios';
 
import ThemeWithBg from '../../Skeleton/ThemeWithBg';
 

const PAGE_SIZE = 6;

const CustomerHome = ({user, navigation}) => {
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
    queryKey: ['leads', user?._id],
    queryFn: async ({pageParam = 1}) => {
      const response = await axios.get(
        `/leads?userId=${user._id}&page=${pageParam}&limit=${PAGE_SIZE}`,
      );
      return response.data;
    },
    getNextPageParam: (lastPage, allPages) => {
      if (lastPage.length < PAGE_SIZE) return undefined;
      return allPages.length + 1;
    },
    enabled: !!user?._id,
  });

  const leads = data?.pages.flat() || [];

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
        <ActivityIndicator size="small" color={themeColor[0]} />
      </View>
    );
  };

  const renderLeadItem = ({item}) => (
    <TouchableOpacity
      style={styles.leadCard}
      onPress={() => navigation.navigate('LeadDetail', {leadId: item._id})}
      activeOpacity={0.8}>
      <View style={styles.leadHeader}>
        <View style={styles.leadNameContainer}>
          <Ionicons
            name="business-outline"
            size={20}
            color="#555"
            style={styles.leadIcon}
          />
          <Text style={styles.leadName} numberOfLines={1}>
            {item.garageName}
          </Text>
        </View>
        <View
          style={[
            styles.leadStatus,
            styles[`status${item.status?.replace(/\s+/g, '') || 'New'}`],
          ]}>
          <Text style={styles.leadStatusText}>{item.status || 'New'}</Text>
        </View>
      </View>

      <View style={styles.leadInfoRow}>
        <Ionicons name="person-outline" size={16} color="#555" />
        <Text style={styles.leadContact}>{item.contactName}</Text>
      </View>

      <View style={styles.leadInfoRow}>
        <Ionicons name="call-outline" size={16} color="#555" />
        <Text style={styles.leadPhone}>{item.mobile}</Text>
      </View>

      <View style={styles.leadInfoRow}>
        <Ionicons name="location-outline" size={16} color="#555" />
        <Text style={styles.leadAddress} numberOfLines={1}>
          {item.city}, {item.state}
        </Text>
      </View>

      {item.feedbacks?.length > 0 && (
        <View style={styles.feedbackBadge}>
          <Ionicons name="chatbubble-ellipses-outline" size={14} color="white" />
          <Text style={styles.feedbackBadgeText}>{item.feedbacks.length}</Text>
        </View>
      )}
    </TouchableOpacity>
  );

  const renderLoading = () => (
    <View style={styles.loadingContainer}>
      {[...Array(5)].map((_, index) => (
        <View key={index} style={styles.loadingCard}>
          <View style={styles.loadingHeader} />
          <View style={styles.loadingLine} />
          <View style={styles.loadingLine} />
          <View style={styles.loadingLine} />
        </View>
      ))}
    </View>
  );




   

  const handleNavigateToAnalytics = () => {
    navigation.navigate('LeadAnalytics', { user });
  };
  const handleNavigateToAttanfdanmce = () => {
    navigation.navigate('attandance', { user });
  };
  
  const handleNavigateTolEABVER= () => {
    navigation.navigate('LEAVE', { user });
  };





  return (


    <ThemeWithBg>
            <View style={styles.container}>
  
     







 <View style={styles.header}>
      <Text style={styles.welcomeText}>
        Welcome, {user?.name || 'User'}!  
      </Text>
      

      {/* <TouchableOpacity
      className='!flex-row justify-center'
        style={styles.analyticsButton}
        onPress={handleNavigateToAnalytics}
      >
        <Text style={styles.analyticsButtonText}>View Analytics</Text>
        <Text style={styles.analyticsButtonText}>Attandance</Text>
      </TouchableOpacity> */}
      
      

<View style={{ 
  flexDirection: "row", 
  justifyContent: "center",   
  alignItems: "center",
}}>
  {/* Analytics Button */}
  <TouchableOpacity
    style={styles.analyticsButton}
    onPress={handleNavigateToAnalytics}
  >
    <Ionicons name="bar-chart-outline" size={24} color="#fff" />
  </TouchableOpacity>

  {/* Attendance Button */}
  <TouchableOpacity
    style={styles.analyticsButton}
    onPress={handleNavigateToAttanfdanmce}
  >
    <Ionicons name="people-outline" size={24} color="#fff" />
  </TouchableOpacity>
  <TouchableOpacity
    style={styles.analyticsButton}
    onPress={handleNavigateTolEABVER}
  >
    <Ionicons name="home-outline" size={24} color="#fff" />
  </TouchableOpacity>
</View>






    </View>








      {isLoading ? (
        renderLoading()
      ) : (
        <FlatList
          data={leads}
          renderItem={renderLeadItem}
          keyExtractor={item => item._id}
          contentContainerStyle={styles.leadList}
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <Ionicons
                name="document-text-outline"
                size={60}
                color="#888"
                style={styles.emptyIcon}
              />
              <Text style={styles.emptyText}>No leads found</Text>
              <Text style={styles.emptySubText}>
                Start by adding a new lead to see them here
              </Text>
            </View>
          }
          showsVerticalScrollIndicator={false}
          onEndReached={loadMore}
          onEndReachedThreshold={0.1}
          ListFooterComponent={renderFooter}
          refreshControl={
            <RefreshControl
              refreshing={refreshing || isRefetching}
              onRefresh={onRefresh}
              colors={themeColor}
              tintColor={themeColor[0]}
            />
          }
        />
      )}

      <View style={styles.statsContainer}>
        <View style={styles.statCard}>
          <Ionicons name="stats-chart-outline" size={24} color="white" />
          <Text style={styles.statValue}>{leads.length || 0}</Text>
          <Text style={styles.statLabel}>Total Leads</Text>
        </View>
      </View>
    </View>
      </ThemeWithBg>




  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  header: {
    display:'flex',
    flexDirection:'row',
    alignItems:'center',
    justifyContent:'space-between',
    padding: 6,
    backgroundColor: themeColor[0],
  },



  analyticsButton: {
    backgroundColor: '#4f46e5',
    padding: 12,
    borderRadius: 8,
    marginHorizontal: 6,   // 👈 space between buttons
    alignItems: 'center',
    justifyContent: 'center',
  },
  analyticsButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '500',
  },







  welcomeText: {
    fontSize: 22,
    fontWeight: 'bold',
    color: 'white',
  },
  subHeader: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.8)',
    marginTop: 4,
  },
  loadingContainer: {
    padding: 16,
  },
  loadingCard: {
    backgroundColor: 'white',
    borderRadius: 8,
    padding: 16,
    marginBottom: 12,
  },
  loadingHeader: {
    height: 20,
    backgroundColor: '#e0e0e0',
    borderRadius: 4,
    marginBottom: 12,
    width: '70%',
  },
  loadingLine: {
    height: 14,
    backgroundColor: '#e0e0e0',
    borderRadius: 4,
    marginBottom: 8,
    width: '90%',
  },
  leadList: {
    padding: 16,
  },
  leadCard: {
    backgroundColor: 'white',
    borderRadius: 8,
    padding: 16,
    marginBottom: 12,
    elevation: 2,
  },
  leadHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  leadNameContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  leadIcon: {
    marginRight: 8,
  },
  leadName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    flex: 1,
  },
  leadStatus: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  leadStatusText: {
    fontSize: 12,
    fontWeight: '600',
  },
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
  leadInfoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  leadContact: {
    color: '#555',
    marginLeft: 8,
    fontSize: 14,
  },
  leadPhone: {
    color: '#555',
    marginLeft: 8,
    fontSize: 14,
  },
  leadAddress: {
    color: '#555',
    marginLeft: 8,
    fontSize: 14,
    flex: 1,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 40,
  },
  emptyIcon: {
    opacity: 0.5,
    marginBottom: 16,
  },
  emptyText: {
    fontSize: 16,
    color: '#888',
    textAlign: 'center',
  },
  emptySubText: {
    fontSize: 14,
    color: '#aaa',
    textAlign: 'center',
    marginTop: 8,
  },
  statsContainer: {
    position: 'absolute',
    bottom: 16,
    right: 16,
  },
  statCard: {
    backgroundColor: themeColor[0],
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    justifyContent: 'center',
    width: 120,
    height: 100,
    elevation: 4,
  },
  statValue: {
    fontSize: 24,
    fontWeight: 'bold',
    color: 'white',
    marginVertical: 4,
  },
  statLabel: {
    fontSize: 14,
    color: 'white',
  },
  feedbackBadge: {
    position: 'absolute',
    top: -8,
    right: -8,
    backgroundColor: '#2F80ED',
    borderRadius: 12,
    width: 24,
    height: 24,
    justifyContent: 'center',
    alignItems: 'center',
    flexDirection: 'row',
  },
  feedbackBadgeText: {
    color: 'white',
    fontSize: 12,
    fontWeight: 'bold',
    marginLeft: 2,
  },
  footer: {
    padding: 16,
    alignItems: 'center',
  },
});

export default CustomerHome;