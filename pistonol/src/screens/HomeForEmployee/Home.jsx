 






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
import MarqueeText from '../HomeForCustomer/MarqueText';
import LinearGradient from 'react-native-linear-gradient';

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
    style={{
      borderRadius: 8,
      marginBottom: 12,
      elevation: 2,
      overflow: 'hidden',
    }}
    onPress={() => navigation.navigate('LeadDetail', {leadId: item._id})}
    activeOpacity={0.8}>
    
    <LinearGradient
      colors={['#FF6B6B', 'white', 'white']} // हल्का red gradient
      style={{
        borderRadius: 8,
        padding: 16,
      }}
      start={{x: 0, y: 0}}
      end={{x: 1, y: 1}}>
      
      <View style={{
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 12,
      }}>
        <View style={{
          flexDirection: 'row',
          alignItems: 'center',
          flex: 1,
        }}>
          <Ionicons
            name="business-outline"
            size={20}
            color="#000"
            style={{marginRight: 8}}
          />
          <Text style={{
            fontSize: 16,
            fontWeight: '600',
            color: '#000',
            flex: 1,
          }} numberOfLines={1}>
            {item.garageName}
          </Text>
        </View>
        <View
          style={[
            {
              paddingHorizontal: 8,
              paddingVertical: 4,
              borderRadius: 12,
              backgroundColor: 'rgba(255, 255, 255, 0.3)',
            },
            styles[`status${item.status?.replace(/\s+/g, '') || 'New'}`],
          ]}>
          <Text style={{
            fontSize: 12,
            fontWeight: '600',
            color: '#000',
          }}>{item.status || 'New'}</Text>
        </View>
      </View>

      <View style={{
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 8,
      }}>
        <Ionicons name="person-outline" size={16} color="#000" />
        <Text style={{
          color: '#000',
          marginLeft: 8,
          fontSize: 14,
        }}>{item.contactName}</Text>
      </View>

      <View style={{
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 8,
      }}>
        <Ionicons name="call-outline" size={16} color="#000" />
        <Text style={{
          color: '#000',
          marginLeft: 8,
          fontSize: 14,
        }}>{item.mobile}</Text>
      </View>

      <View style={{
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 8,
      }}>
        <Ionicons name="location-outline" size={16} color="#000" />
        <Text style={{
          color: '#000',
          marginLeft: 8,
          fontSize: 14,
          flex: 1,
        }} numberOfLines={1}>
          {item.city}, {item.state}
        </Text>
      </View>




<View style={{
  flexDirection: 'row',
  alignItems: 'center',
  marginBottom: 8,
}}>
  <Ionicons name="time-outline" size={16} color="#000" />
  <Text
    style={{
      color: '#000',
      marginLeft: 8,
      fontSize: 14,
      flex: 1,
    }}
  >
    {new Date(item.createdAt).toLocaleString()}
  </Text>
</View>


      {item.feedbacks?.length > 0 && (
        <View style={{
          position: 'absolute',
          top: -8,
          right: -8,
          backgroundColor: '#000',
          borderRadius: 12,
          width: 24,
          height: 24,
          justifyContent: 'center',
          alignItems: 'center',
          flexDirection: 'row',
        }}>
          <Ionicons name="chatbubble-ellipses-outline" size={14} color="#fff" />
          <Text style={{
            color: '#fff',
            fontSize: 12,
            fontWeight: 'bold',
            marginLeft: 2,
          }}>{item.feedbacks.length}</Text>
        </View>
      )}
    </LinearGradient>
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

  const handleNavigateToAttendance = () => {
    navigation.navigate('attandance', { user });
  };

  const handleNavigateToLeave = () => {
    navigation.navigate('LEAVE', { user });
  };

  return (
    <ThemeWithBg>
      <View style={styles.container}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.welcomeText} numberOfLines={1} ellipsizeMode="tail">
            Welcome, {user?.name||user?.username  || 'User'}!
          </Text>
          
        </View>

        {/* Marquee Text */}
        <MarqueeText role={"company-employee"} />

        {/* Action Buttons Section - Moved Below Header */}
        <View style={styles.actionButtonsContainer}>
          <TouchableOpacity
            style={styles.actionButton}
            onPress={handleNavigateToAnalytics}>
            <View style={[styles.actionIconContainer, {backgroundColor: 'blue'}]}>
              <Ionicons name="bar-chart-outline" size={24} color="#fff" />
            </View>
            <Text style={styles.actionButtonText}>Analytics</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.actionButton}
            onPress={handleNavigateToAttendance}>
            <View style={[styles.actionIconContainer, {backgroundColor: 'blue'}]}>
              <Ionicons name="receipt-sharp" size={24} color="#fff" />
            </View>
            <Text style={styles.actionButtonText}>Attendance</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.actionButton}
            onPress={handleNavigateToLeave}>
            <View style={[styles.actionIconContainer, {backgroundColor: 'blue'}]}>
              <Ionicons name="pencil-sharp" size={24} color="#fff" />
            </View>
            <Text style={styles.actionButtonText}>Leave Request</Text>
          </TouchableOpacity>
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
            <TouchableOpacity 
              onPress={() => navigation.navigate('ViewMyTarget', {user})}
              style={styles.updateSellsButton}
              activeOpacity={0.8}>
              <Text style={styles.updateSellsText}>Update Sells</Text>
            </TouchableOpacity>
            {/* <Ionicons name="stats-chart-outline" size={24} color="white" /> */}
            <Text style={styles.statValue}>{leads.length || 0}</Text>
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
    padding: 16,
    backgroundColor: "blue",
    alignItems: 'left',
  },
  welcomeText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: 'white',
    textAlign: 'left',
  },
  // New Action Buttons Styles
  actionButtonsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    padding: 16,
    backgroundColor: 'white',
    marginHorizontal: 16,
    marginTop: 16,
    borderRadius: 16,
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  actionButton: {
    alignItems: 'center',
    flex: 1,
  },
  actionIconContainer: {
    width: 50,
    height: 50,
    borderRadius: 25,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.2,
    shadowRadius: 3,
  },
  actionButtonText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#333',
    textAlign: 'center',
  },
  updateSellsButton: {
    
 
    borderRadius: 12,
    width: 100,
    
    transform: [{ scale: 1.02 }],
    marginBottom: 8,
  },
  updateSellsText: {
    color: 'white',
    fontWeight: '800',
    fontSize: 10,
    letterSpacing: 0.5,
    textAlign: 'center',
  },
  // Rest of the styles remain same
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
    bottom: 50,
    right: 16,
  },
  statCard: {
    backgroundColor: "blue",
    borderRadius: 12,
    padding: 3,
    alignItems: 'center',
    justifyContent: 'center',
    width: 80,
    height: 80,
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



