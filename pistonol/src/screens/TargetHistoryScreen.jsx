// components/TargetHistoryScreen.jsx
import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  ActivityIndicator,
  TouchableOpacity,
  StyleSheet,
  StatusBar,
  RefreshControl
} from 'react-native';
import { useQuery } from '@tanstack/react-query';
import axios from 'axios';
import { useRoute, useNavigation } from '@react-navigation/native';
import LinearGradient from 'react-native-linear-gradient';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { SafeAreaView } from 'react-native-safe-area-context';

const TargetHistoryScreen = () => {
  const route = useRoute();
  const navigation = useNavigation();
  const { userId } = route.params || {};
  
  const [refreshing, setRefreshing] = useState(false);
  
  // Get current month
  const getCurrentMonth = () => {
    const now = new Date();
    return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
  };
  
  const currentMonth = getCurrentMonth();
  
  // Fetch target history
  const { 
    data: targetHistory, 
    isLoading, 
    error,
    refetch
  } = useQuery({
    queryKey: ['targetHistory', userId, currentMonth],
    queryFn: async () => {
      try {
        // First get current target
        const targetResponse = await axios.get(`/targets/user-targets/${userId}?month=${currentMonth}`);
        const currentTarget = targetResponse.data.targets?.[0];
        
        // Then get history for this user and month
        const historyResponse = await axios.get(`/targets/history/${userId}?month=${currentMonth}`);
        
        return {
          currentTarget,
          history: historyResponse.data.history || []
        };
      } catch (error) {
        throw error;
      }
    },
    enabled: !!userId
  });

  const onRefresh = React.useCallback(async () => {
    setRefreshing(true);
    await refetch();
    setRefreshing(false);
  }, [refetch]);

  const handleBack = () => {
    navigation.goBack();
  };

  if (isLoading) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <StatusBar barStyle="light-content" backgroundColor="#4F46E5" />
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#4F46E5" />
          <Text style={styles.loadingText}>Loading history...</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (error) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <StatusBar barStyle="light-content" backgroundColor="#4F46E5" />
        <View style={styles.errorContainer}>
          <Icon name="error-outline" size={60} color="#EF4444" />
          <Text style={styles.errorTitle}>Error loading history</Text>
          <Text style={styles.errorMessage}>
            {error.response?.data?.message || 'Please check your connection and try again'}
          </Text>
          <TouchableOpacity 
            onPress={onRefresh}
            style={styles.retryButton}
          >
            <Icon name="refresh" size={20} color="#FFFFFF" />
            <Text style={styles.retryButtonText}>Retry</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  const { currentTarget, history } = targetHistory || {};
  const hasHistory = history && history.length > 0;

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="light-content" backgroundColor="#4F46E5" />
      
      {/* Header with Gradient */}
      <LinearGradient
        colors={['blue', 'blue']}
        style={styles.headerGradient}
      >
        <View style={styles.header}>
          <TouchableOpacity onPress={handleBack} style={styles.backButton}>
            <Icon name="arrow-back" size={24} color="#FFFFFF" />
          </TouchableOpacity>
          <View style={styles.headerContent}>
            <Text style={styles.headerTitle}>Target History</Text>
            <Text style={styles.headerSubtitle}>{currentMonth}</Text>
          </View>
          <View style={styles.placeholder} />
        </View>
      </LinearGradient>

      <ScrollView 
        style={styles.container}
        refreshControl={
          <RefreshControl 
            refreshing={refreshing} 
            onRefresh={onRefresh}
            colors={['#4F46E5']}
            tintColor="#4F46E5"
          />
        }
      >
        {/* Current Target Card */}
        {currentTarget && (
          <View style={styles.currentTargetCard}>
            <View style={styles.cardHeader}>
              <Icon name="assignment" size={24} color="blue" />
              <Text style={styles.cardTitle}>Current Target</Text>
            </View>
            
            <View style={styles.currentTargetContent}>
              <View style={styles.targetRow}>
                <View style={styles.targetInfo}>
                  <Text style={styles.targetLabel}>Monthly Target</Text>
                  <Text style={styles.targetValue}>
                    ₹{currentTarget.targetAmount?.toLocaleString()}
                  </Text>
                </View>
                <View style={styles.targetInfo}>
                  <Text style={styles.targetLabel}>Achieved</Text>
                  <Text style={[styles.targetValue, styles.achievedValue]}>
                    ₹{currentTarget.achievedAmount?.toLocaleString()}
                  </Text>
                </View>
              </View>
              
              <View style={styles.progressContainer}>
                <View style={styles.progressLabels}>
                  <Text style={styles.progressText}>Progress</Text>
                  <Text style={styles.progressPercentage}>
                    {((currentTarget.achievedAmount / currentTarget.targetAmount) * 100).toFixed(1)}%
                  </Text>
                </View>
                <View style={styles.progressBar}>
                  <View 
                    style={[
                      styles.progressFill,
                      { 
                        width: `${Math.min((currentTarget.achievedAmount / currentTarget.targetAmount) * 100, 100)}%` 
                      }
                    ]} 
                  />
                </View>
              </View>
            </View>
          </View>
        )}

        {/* History Section */}
        <View style={styles.historyCard}>
          <View style={styles.cardHeader}>
            <Icon name="history" size={24} color="blue" />
            <Text style={styles.cardTitle}>Target Changes History</Text>
            {hasHistory && (
              <Text style={styles.historyCount}>{history.length} changes</Text>
            )}
          </View>

          {hasHistory ? (
            <View style={styles.historyList}>
              {history.map((item, index) => (
                <View key={item._id} style={styles.historyItem}>
                  <View style={styles.historyIconContainer}>
                    <Icon 
                      name="trending-up" 
                      size={20} 
                      color="#4F46E5" 
                    />
                  </View>
                  
                  <View style={styles.historyContent}>
                    <Text style={styles.historyTarget}>
                      Target: ₹{item.targetAmount?.toLocaleString()}
                    </Text>
                    <Text style={styles.historyDate}>
                      {new Date(item.changedAt).toLocaleDateString('en-IN', {
                        day: '2-digit',
                        month: 'short',
                        year: 'numeric'
                      })} • {new Date(item.changedAt).toLocaleTimeString('en-IN', {
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
                    </Text>
                  </View>
                  
                  {index !== history.length - 1 && (
                    <View style={styles.historyConnector} />
                  )}
                </View>
              ))}
            </View>
          ) : (
            <View style={styles.noHistoryContainer}>
              <Icon name="info-outline" size={50} color="#9CA3AF" />
              <Text style={styles.noHistoryTitle}>No History Found</Text>
              <Text style={styles.noHistoryText}>
                No target changes recorded for {currentMonth}
              </Text>
            </View>
          )}
        </View>

        {/* Stats Summary */}
        {hasHistory && (
          <View style={styles.statsCard}>
            <Text style={styles.statsTitle}>Summary</Text>
            <View style={styles.statsGrid}>
              <View style={styles.statBox}>
                <Text style={styles.statNumber}>{history.length}</Text>
                <Text style={styles.statLabel}>Total Changes</Text>
              </View>
              
              <View style={styles.statBox}>
                <Text style={styles.statNumber}>
                  ₹{Math.max(...history.map(h => h.targetAmount))?.toLocaleString()}
                </Text>
                <Text style={styles.statLabel}>Highest Target</Text>
              </View>
              
              <View style={styles.statBox}>
                <Text style={styles.statNumber}>
                  ₹{Math.min(...history.map(h => h.targetAmount))?.toLocaleString()}
                </Text>
                <Text style={styles.statLabel}>Lowest Target</Text>
              </View>
            </View>
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#F9FAFB',
  },
  container: {
    flex: 1,
  },
  
  // Header Styles
  headerGradient: {
    paddingTop: 10,
    paddingBottom: 20,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
  },
  backButton: {
    padding: 8,
    borderRadius: 12,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
  },
  headerContent: {
    flex: 1,
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 4,
  },
  headerSubtitle: {
    fontSize: 14,
    color: '#E5E7EB',
  },
  placeholder: {
    width: 40,
  },
  
  // Loading Styles
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F9FAFB',
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: '#6B7280',
  },
  
  // Error Styles
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F9FAFB',
    paddingHorizontal: 32,
  },
  errorTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#374151',
    marginTop: 16,
    marginBottom: 8,
  },
  errorMessage: {
    fontSize: 16,
    color: '#6B7280',
    textAlign: 'center',
    lineHeight: 24,
  },
  retryButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#4F46E5',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 12,
    marginTop: 24,
  },
  retryButtonText: {
    color: '#FFFFFF',
    fontWeight: '600',
    marginLeft: 8,
  },
  
  // Card Styles
  currentTargetCard: {
    backgroundColor: '#FFFFFF',
    margin: 16,
    padding: 20,
    borderRadius: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  historyCard: {
    backgroundColor: '#FFFFFF',
    marginHorizontal: 16,
    marginBottom: 16,
    padding: 20,
    borderRadius: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  statsCard: {
    backgroundColor: '#FFFFFF',
    marginHorizontal: 16,
    marginBottom: 16,
    padding: 20,
    borderRadius: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: 'blue',
    marginLeft: 8,
    flex: 1,
  },
  historyCount: {
    fontSize: 14,
    color: '#6B7280',
    backgroundColor: '#F3F4F6',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  
  // Current Target Content
  currentTargetContent: {
    marginTop: 10,
  },
  targetRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  targetInfo: {
    flex: 1,
  },
  targetLabel: {
    fontSize: 14,
    color: '#6B7280',
    marginBottom: 4,
  },
  targetValue: {
    fontSize: 20,
    fontWeight: 'bold',
    color: 'blue',
  },
  achievedValue: {
    color: '#10B981',
  },
  
  progressContainer: {
    marginTop: 10,
  },
  progressLabels: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  progressText: {
    fontSize: 14,
    color: '#6B7280',
  },
  progressPercentage: {
    fontSize: 14,
    fontWeight: '600',
    color: '#10B981',
  },
  progressBar: {
    height: 8,
    backgroundColor: '#E5E7EB',
    borderRadius: 4,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#10B981',
    borderRadius: 4,
  },
  
  // History List
  historyList: {
    marginTop: 10,
  },
  historyItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    paddingVertical: 12,
  },
  historyIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#EEF2FF',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  historyContent: {
    flex: 1,
  },
  historyTarget: {
    fontSize: 16,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 4,
  },
  historyDate: {
    fontSize: 14,
    color: '#6B7280',
  },
  historyConnector: {
    position: 'absolute',
    left: 20,
    top: 52,
    bottom: -12,
    width: 2,
    backgroundColor: '#E5E7EB',
  },
  
  // No History
  noHistoryContainer: {
    alignItems: 'center',
    paddingVertical: 40,
  },
  noHistoryTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#374151',
    marginTop: 16,
    marginBottom: 8,
  },
  noHistoryText: {
    fontSize: 14,
    color: '#6B7280',
    textAlign: 'center',
    lineHeight: 20,
  },
  
  // Stats
  statsTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: 'blue',
    marginBottom: 16,
  },
  statsGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  statBox: {
    flex: 1,
    alignItems: 'center',
    backgroundColor: '#F9FAFB',
    paddingVertical: 16,
    paddingHorizontal: 8,
    borderRadius: 12,
    marginHorizontal: 4,
  },
  statNumber: {
    fontSize: 20,
    fontWeight: 'bold',
    color: 'blue',
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    color: '#6B7280',
    textAlign: 'center',
  },
});

export default TargetHistoryScreen;