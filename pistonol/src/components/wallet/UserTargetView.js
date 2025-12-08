import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
  Alert,
  RefreshControl,
  StatusBar,
  StyleSheet,
  Dimensions
} from 'react-native';
import { useQuery, useMutation } from '@tanstack/react-query';
import axios from 'axios';
import { useRoute, useNavigation } from '@react-navigation/native';
import LinearGradient from 'react-native-linear-gradient';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { SafeAreaView } from 'react-native-safe-area-context';

const { width } = Dimensions.get('window');

const UserTargetView = () => {
  const route = useRoute();
  const navigation = useNavigation();
  const { user, userType = 'company-employee' } = route.params || {};

  const [selectedMonth, setSelectedMonth] = useState(getCurrentMonth());
  const [achievedAmount, setAchievedAmount] = useState('');
  const [refreshing, setRefreshing] = useState(false);
 
const [timeoutId, setTimeoutId] = useState(null);
  function getCurrentMonth() {
    const now = new Date();
    return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
  }

  // User role based configuration
  const userConfig = {
    'company-employee': {
      title: 'Employee Target & Achievement',
         gradientColors: ['blue', 'blue'],
    iconColor: 'blue',
      displayName: 'Employee'
    },
    'distributor': {
      title: 'Distributor Target & Achievement',
      gradientColors: ['blue', 'blue'],
     iconColor: 'blue',
      displayName: 'Distributor'
    },
    'dealer': {
      title: 'Dealer Target & Achievement',
      gradientColors: ['blue', 'blue'],
      iconColor: 'blue',
      displayName: 'Dealer'
    },
    'mechanic': {
      title: 'Mechanic Target & Achievement',
      gradientColors: ['blue', 'blue'],
      iconColor: 'blue',
      displayName: 'Mechanic'
    }
  };

  const config = userConfig[userType] || userConfig['company-employee'];

  // User target fetch
  const { 
    data: targets, 
    isLoading, 
    error,
    refetch
  } = useQuery({
    queryKey: ['userTarget', user?._id, selectedMonth, userType],
    queryFn: async () => {
      const response = await axios.get(`/targets/user-targets/${user._id}?month=${selectedMonth}`);
      return response.data.targets;
    },
    enabled: !!user?._id
  });

  // Achieved amount update
  const updateAchievedMutation = useMutation({
    mutationFn: async (amount) => {
      const response = await axios.patch('/targets/update-achieved', {
        userId: user._id,
        month: selectedMonth,
        achievedAmount: amount
      });
      return response.data;
    },
    onSuccess: () => {
      refetch();
      setAchievedAmount('');
      Alert.alert('Success', 'Sales updated successfully! 🎉');
    },
    onError: (error) => {
      Alert.alert('Error', error.response?.data?.message || 'Failed to update sales');
    }
  });

  const onRefresh = React.useCallback(async () => {
    setRefreshing(true);
    await refetch();
    setRefreshing(false);
  }, [refetch]);

  const currentTarget = targets?.[0];

  const handleUpdateSales = () => {
    const amount = parseFloat(achievedAmount);
    if (!amount || amount <= 0) {
      Alert.alert('Error', 'Please enter valid sales amount');
      return;
    }
    
    Alert.alert(
      'Confirm Update',
      `Add ₹${amount.toLocaleString()} to today's sales?`,
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Update', 
          onPress: () => updateAchievedMutation.mutate(amount) 
        }
      ]
    );
  };

  const handleBack = () => {
    navigation.goBack();
  };

  if (isLoading) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <StatusBar barStyle="light-content" backgroundColor={config.gradientColors[0]} />
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={config.iconColor} />
          <Text style={styles.loadingText}>Loading your target...</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (error) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <StatusBar barStyle="light-content" backgroundColor={config.gradientColors[0]} />
        <View style={styles.errorContainer}>
          <Icon name="error-outline" size={60} color="#EF4444" />
          <Text style={styles.errorTitle}>Error loading target</Text>
          <Text style={styles.errorMessage}>
            Please check your connection and try again
          </Text>
          <TouchableOpacity 
            onPress={onRefresh}
            style={[styles.retryButton, { backgroundColor: config.iconColor }]}
          >
            <Icon name="refresh" size={20} color="#FFFFFF" />
            <Text style={styles.retryButtonText}>Retry</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  const progress = currentTarget ? (currentTarget.achievedAmount / currentTarget.targetAmount) * 100 : 0;
  const remainingAmount = currentTarget ? currentTarget.targetAmount - currentTarget.achievedAmount : 0;

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="light-content" backgroundColor={config.gradientColors[0]} />
      
      {/* Header with Gradient */}
      <LinearGradient
        colors={config.gradientColors}
        style={styles.headerGradient}
      >
        <View style={styles.header}>
          <TouchableOpacity onPress={handleBack} style={styles.backButton}>
            <Icon name="arrow-back" size={24} color="#FFFFFF" />
          </TouchableOpacity>
          <View style={styles.headerContent}>
            <Text style={styles.headerTitle}>{config.title}</Text>
            <Text style={styles.headerSubtitle}>Track and update your progress</Text>
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
            colors={[config.iconColor]}
            tintColor={config.iconColor}
          />
        }
      >
        {/* User Info Card */}
        <View style={styles.userInfoCard}>
          <View style={styles.userInfo}>
            <View style={[styles.userIcon, { backgroundColor: `${config.iconColor}20` }]}>
              <Icon name="person" size={24} color={config.iconColor} />
            </View>
            <View style={styles.userDetails}>
              <Text style={styles.userName}>{user?.name}</Text>
              <Text style={styles.userRole}>{config.displayName}</Text>
              <Text style={styles.userId}>ID: {user?.username}</Text>
            </View>
          </View>
        </View>

        {/* Month Selection */}
        <View style={styles.monthContainer}>
          <View style={styles.monthHeader}>
            <Icon name="calendar-today" size={20} color={config.iconColor} />
            <Text style={[styles.monthLabel, { color: config.iconColor }]}>Select Month</Text>
          </View>
          {/* <TextInput
            value={selectedMonth}
            onChangeText={setSelectedMonth}
            placeholder="YYYY-MM"
            placeholderTextColor="#9CA3AF"
            style={styles.monthInput}
          /> */}




<TextInput
  defaultValue={selectedMonth}
  onChangeText={(text) => {
    if (timeoutId) clearTimeout(timeoutId);

    const newTimeout = setTimeout(() => {
      setSelectedMonth(text);
    }, 1000);

    setTimeoutId(newTimeout);
  }}
  placeholder="YYYY-MM"
  placeholderTextColor="#9CA3AF"
  style={styles.monthInput}
/>




        </View>

        {/* Target Display */}
        {currentTarget ? (
          <View style={styles.content}>
            {/* Progress Card */}
            <View style={styles.progressCard}>
              <View style={styles.progressHeader}>
                <Text style={[styles.progressTitle, { color: config.iconColor }]}>
                  Monthly Progress
                </Text>
                <View style={[styles.progressPercentage, { backgroundColor: `#4c8a48` }]}>
                  <Text style={[styles.progressPercentageText, { color: "white" }]}>
                    {progress.toFixed(1)}%
                  </Text>
                </View>
              </View>
              
              {/* Progress Bar */}
              <View style={styles.progressBarContainer}>
                <View style={styles.progressBarBackground}>
                  <View
                    style={[
                      styles.progressBarFill,
                      { 
                        width: `${Math.min(progress, 100)}%`,
                        backgroundColor: "green"
                      }
                    ]}
                  />
                </View>
              </View>

              {/* Stats Grid */}
              <View style={styles.statsGrid}>
                <View style={styles.statItem}>
                  <Icon name="leaderboard" size={24} color={config.iconColor} />
                  <Text style={styles.statLabel}>Target</Text>
                  <Text style={[styles.statValue, { color: config.iconColor }]}>
                    ₹{(currentTarget.targetAmount / 100000).toFixed(1)}L
                  </Text>
                </View>
                
                <View style={styles.statItem}>
                  <Icon name="check-circle" size={24} color="green" />
                  <Text style={styles.statLabel}>Achieved</Text>
                  <Text style={[styles.statValue, styles.achievedText]}>
                    ₹{(currentTarget.achievedAmount / 100000).toFixed(1)}L
                  </Text>
                </View>
                
                <View style={styles.statItem}>
                  <Icon name="schedule" size={24} color="#EF4444" />
                  <Text style={styles.statLabel}>Remaining</Text>
                  <Text style={[styles.statValue, styles.remainingText]}>
                    ₹{(remainingAmount / 100000).toFixed(1)}L
                  </Text>
                </View>
              </View>
            </View>

            {/* Detailed Breakdown */}
            <View style={styles.detailsCard}>
              <View style={styles.detailsHeader}>
                <Icon name="analytics" size={24} color={config.iconColor} />
                <Text style={[styles.detailsTitle, { color: config.iconColor }]}>Details</Text>
              </View>
              
              <View style={styles.detailsList}>
                <View style={styles.detailRow}>
                  <Text style={styles.detailLabel}>Monthly Target</Text>
                  <Text style={[styles.detailValue, { color: config.iconColor }]}>
                    ₹{currentTarget.targetAmount?.toLocaleString()}
                  </Text>
                </View>
                
                <View style={styles.detailRow}>
                  <Text style={styles.detailLabel}>Achieved So Far</Text>
                  <Text style={[styles.detailValue, styles.detailAchieved]}>
                    ₹{currentTarget.achievedAmount?.toLocaleString()}
                  </Text>
                </View>
                
                <View style={styles.detailRow}>
                  <Text style={styles.detailLabel}>Remaining</Text>
                  <Text style={[styles.detailValue, styles.detailRemaining]}>
                    ₹{remainingAmount.toLocaleString()}
                  </Text>
                </View>
                
                <View style={styles.divider} />
                
                <View style={styles.detailRow}>
                  <Text style={styles.dailyAverageLabel}>Daily Average Target</Text>
                  <Text style={[styles.dailyAverageValue, { color: config.iconColor }]}>
                    ₹{Math.ceil(remainingAmount / getDaysRemaining()).toLocaleString()}
                  </Text>
                </View>
              </View>
            </View>
          </View>
        ) : (
          <View style={styles.noTargetContainer}>
            <Icon name="assignment" size={60} color="#F59E0B" />
            <Text style={styles.noTargetTitle}>No Target Set</Text>
            <Text style={styles.noTargetMessage}>
              No target set for {selectedMonth}.{'\n'}
              Please contact your manager.
            </Text>
          </View>
        )}

        {/* Update Sales Section */}
        {currentTarget && (
          <View style={styles.updateCard}>
            <View style={styles.updateHeader}>
              <Icon name="update" size={24} color={config.iconColor} />
              <Text style={[styles.updateTitle, { color: config.iconColor }]}>
                Update Today's Sales
              </Text>
            </View>
            
            <View style={styles.inputContainer}>
              <Icon name="currency-rupee" size={20} color={config.iconColor} style={styles.inputIcon} />
              <TextInput
                value={achievedAmount}
                onChangeText={setAchievedAmount}
                placeholder="Enter today's sales amount"
                placeholderTextColor="#9CA3AF"
                keyboardType="numeric"
                style={styles.amountInput}
              />
            </View>
            
            <TouchableOpacity
              onPress={handleUpdateSales}
              disabled={updateAchievedMutation.isPending || !achievedAmount}
              style={[
                styles.updateButton,
                { backgroundColor: config.iconColor },
                (updateAchievedMutation.isPending || !achievedAmount) && styles.updateButtonDisabled
              ]}
            >
              {updateAchievedMutation.isPending ? (
                <ActivityIndicator color="white" />
              ) : (
                <>
                  <Icon name="add-chart" size={20} color="#FFFFFF" />
                  <Text style={styles.updateButtonText}>
                    Add Sales ₹{achievedAmount ? parseFloat(achievedAmount).toLocaleString() : '0'}
                  </Text>
                </>
              )}
            </TouchableOpacity>
            
            <Text style={styles.updateNote}>
              This will be added to your total achieved amount
            </Text>
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
};

// Helper function - remaining days in month
function getDaysRemaining() {
  const now = new Date();
  const lastDay = new Date(now.getFullYear(), now.getMonth() + 1, 0);
  const remaining = lastDay.getDate() - now.getDate();
  return Math.max(remaining, 1);
}

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
  
  // User Info Card
  userInfoCard: {
    backgroundColor: '#FFFFFF',
    margin: 16,
    padding: 16,
    borderRadius: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  userInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  userIcon: {
    width: 50,
    height: 50,
    borderRadius: 25,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  userDetails: {
    flex: 1,
  },
  userName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#374151',
  },
  userRole: {
    fontSize: 14,
    color: '#6B7280',
    marginTop: 2,
  },
  userId: {
    fontSize: 12,
    color: '#9CA3AF',
    marginTop: 2,
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
  
  // Month Selection
  monthContainer: {
    backgroundColor: '#FFFFFF',
    margin: 16,
    padding: 16,
    borderRadius: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  monthHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  monthLabel: {
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
  },
  monthInput: {
    borderWidth: 1,
    borderColor: '#D1D5DB',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontSize: 16,
    color: '#374151',
    backgroundColor: '#FFFFFF',
  },
  
  // Content
  content: {
    paddingHorizontal: 16,
  },
  
  // Progress Card
  progressCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  progressHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  progressTitle: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  progressPercentage: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 20,
  },
  progressPercentageText: {
    fontSize: 12,
    fontWeight: 'bold',
  },
  progressBarContainer: {
    marginBottom: 20,
  },
  progressBarBackground: {
    height: 12,
    backgroundColor: '#E5E7EB',
    borderRadius: 6,
    overflow: 'hidden',
  },
  progressBarFill: {
    height: '100%',
    borderRadius: 6,
  },
  
  // Stats Grid
  statsGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  statItem: {
    alignItems: 'center',
    flex: 1,
  },
  statLabel: {
    fontSize: 12,
    color: '#6B7280',
    marginTop: 8,
    marginBottom: 4,
  },
  statValue: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  achievedText: {
    color: 'green',
  },
  remainingText: {
    color: '#EF4444',
  },
  
  // Details Card
  detailsCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  detailsHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  detailsTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginLeft: 8,
  },
  detailsList: {
    spaceY: 12,
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  detailLabel: {
    fontSize: 14,
    color: '#6B7280',
  },
  detailValue: {
    fontSize: 16,
    fontWeight: '600',
  },
  detailAchieved: {
    color: '#10B981',
  },
  detailRemaining: {
    color: '#EF4444',
  },
  divider: {
    height: 1,
    backgroundColor: '#E5E7EB',
    marginVertical: 8,
  },
  dailyAverageLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#374151',
  },
  dailyAverageValue: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  
  // No Target
  noTargetContainer: {
    backgroundColor: '#FFFFFF',
    margin: 16,
    padding: 32,
    borderRadius: 16,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  noTargetTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#374151',
    marginTop: 16,
    marginBottom: 8,
  },
  noTargetMessage: {
    fontSize: 16,
    color: '#6B7280',
    textAlign: 'center',
    lineHeight: 24,
  },
  
  // Update Card
  updateCard: {
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
  updateHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  updateTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginLeft: 8,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#D1D5DB',
    borderRadius: 12,
    marginBottom: 16,
    backgroundColor: '#FFFFFF',
  },
  inputIcon: {
    paddingHorizontal: 16,
  },
  amountInput: {
    flex: 1,
    paddingVertical: 14,
    fontSize: 16,
    color: '#374151',
  },
  updateButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    borderRadius: 12,
    marginBottom: 12,
  },
  updateButtonDisabled: {
    backgroundColor: '#9CA3AF',
  },
  updateButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
    marginLeft: 8,
  },
  updateNote: {
    fontSize: 12,
    color: '#6B7280',
    textAlign: 'center',
  },
});

export default UserTargetView;