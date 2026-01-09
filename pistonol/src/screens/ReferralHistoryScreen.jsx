import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Image,
  ScrollView,
  RefreshControl,
  ActivityIndicator,
  Alert,
  Share,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import AsyncStorage from '@react-native-async-storage/async-storage';
import   api  from 'axios';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import LinearGradient from 'react-native-linear-gradient';

const ReferralHistoryScreen = ({ navigation, route }) => {
  const { userId } = route.params || {};
  const [history, setHistory] = useState([]);
  const [referralCode, setReferralCode] = useState('');
  const [points, setPoints] = useState(0);
  const [totalReferrals, setTotalReferrals] = useState(0);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [userData, setUserData] = useState(null);

  useEffect(() => {
    loadReferralInfo();
  }, []);

  const loadReferralInfo = async () => {
    try {
      setLoading(true);
      let user;
      
      if (userId) {
        // If userId is passed, use that
        const response = await api.get(`/auth/user/${userId}/referral-info`);
        user = response.data;
      } else {
        // Else get current user
        const storedUser = await AsyncStorage.getItem('user');
        if (storedUser) {
          user = JSON.parse(storedUser);
          const response = await api.get('/auth/referral/my-info');
          if (response.data) {
            user = { ...user, ...response.data };
          }
        }
      }
      
      if (user) {
        setUserData(user);
        setReferralCode(user.myReferralCode || 'Generating...');
        setPoints(user.referralPoints || 0);
        setHistory(user.referralHistory || []);
        setTotalReferrals(user.totalReferrals || user.referralHistory?.length || 0);
      }
    } catch (error) {
      console.error('Error loading referral info:', error);
      Alert.alert('Error', 'Failed to load referral information');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const onRefresh = () => {
    setRefreshing(true);
    loadReferralInfo();
  };

  const handleShareCode = () => {
    if (referralCode && referralCode !== 'Generating...') {
      Alert.alert(
        'Share Referral Code',
        `Your referral code: ${referralCode}\n\nShare this code with friends to earn 10 points each!`,
        [
          { text: 'Copy', onPress: () => copyToClipboard(referralCode) },
          { text: 'Share', onPress: () => shareReferralCode() },
          { text: 'Cancel', style: 'cancel' }
        ]
      );
    }
  };

  const copyToClipboard = (text) => {
    // Implement clipboard functionality
    Alert.alert('Copied!', 'Referral code copied to clipboard');
  };

  const shareReferralCode =async () => {
 



 
   
    await Share.share({
      message: `⭐ Check out this amazing app!\n\n👉 Download here:\nhttps://play.google.com/store/apps/details?id=com.pistonol\n\n🎁 Use my referral code: ${userData.myReferralCode}`,
    });
 
 












  };

  const renderHistoryItem = ({ item, index }) => (
    <LinearGradient
      colors={['#FFFFFF', '#F8F9FA']}
      style={styles.historyCard}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 0 }}
    >
      <View style={styles.historyHeader}>
        <View style={styles.userInfo}>
          <View style={styles.avatarContainer}>
            <Icon name="account" size={24} color="#FF4757" />
          </View>
          <View>
            <Text style={styles.mobileText}>+91 {item.mobile}</Text>
            <Text style={styles.dateText}>
              {new Date(item.date).toLocaleDateString('en-IN', {
                day: 'numeric',
                month: 'short',
                year: 'numeric',
              })}
            </Text>
          </View>
        </View>
        <View style={styles.pointsBadge}>
          <Icon name="star" size={14} color="#FFD700" />
          <Text style={styles.pointsText}>+{item.pointsEarned}</Text>
        </View>
      </View>
      
      <View style={styles.statusRow}>
        <View style={styles.statusBadge}>
          <Icon name="check-circle" size={12} color="#4CAF50" />
          <Text style={styles.statusText}>Successful</Text>
        </View>
        <Text style={styles.indexText}>#{index + 1}</Text>
      </View>
    </LinearGradient>
  );

  const renderEmptyHistory = () => (
    <View style={styles.emptyContainer}>
      <View style={styles.emptyIcon}>
        <Icon name="account-multiple-plus" size={80} color="#E0E0E0" />
      </View>
      <Text style={styles.emptyTitle}>No Referrals Yet</Text>
      <Text style={styles.emptySubtitle}>
        Share your referral code with friends and start earning points!
      </Text>
      <TouchableOpacity 
        style={styles.shareButton}
        onPress={handleShareCode}
      >
        <Icon name="share-variant" size={20} color="#FFFFFF" />
        <Text style={styles.shareButtonText}>Share Your Code</Text>
      </TouchableOpacity>
    </View>
  );

  if (loading) {
    return (
      <SafeAreaView style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#FF4757" />
        <Text style={styles.loadingText}>Loading referral data...</Text>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      {/* Header */}
      <LinearGradient
        colors={['#FF4757', '#FF6B6B']}
        style={styles.headerGradient}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 0 }}
      >
        <View style={styles.header}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => navigation.goBack()}
          >
            <Icon name="arrow-left" size={24} color="#FFFFFF" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Refer & Earn</Text>
          <TouchableOpacity
            style={styles.shareHeaderButton}
            onPress={handleShareCode}
          >
            <Icon name="share-variant" size={22} color="#FFFFFF" />
          </TouchableOpacity>
        </View>
      </LinearGradient>

      <ScrollView
        style={styles.container}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={['#FF4757']}
            tintColor="#FF4757"
          />
        }
        showsVerticalScrollIndicator={false}
      >
        {/* Stats Cards */}
        <View style={styles.statsContainer}>
          <View style={styles.statRow}>
            <View style={styles.statCard}>
              <LinearGradient
                colors={['#4CAF50', '#8BC34A']}
                style={styles.statGradient}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
              >
                <Icon name="star" size={28} color="#FFFFFF" />
                <Text style={styles.statValue}>{points}</Text>
                <Text style={styles.statLabel}>Total Points</Text>
              </LinearGradient>
            </View>

            <View style={styles.statCard}>
              <LinearGradient
                colors={['#2196F3', '#03A9F4']}
                style={styles.statGradient}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
              >
                <Icon name="account-multiple" size={28} color="#FFFFFF" />
                <Text style={styles.statValue}>{totalReferrals}</Text>
                <Text style={styles.statLabel}>Total Referrals</Text>
              </LinearGradient>
            </View>
          </View>
        </View>

        {/* Your Referral Code Card */}
        <LinearGradient
          colors={['#667EEA', '#764BA2']}
          style={styles.referralCard}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
        >
          <View style={styles.referralContent}>
            <View style={styles.referralHeader}>
              <Icon name="gift" size={24} color="#FFFFFF" />
              <Text style={styles.referralCardTitle}>Your Referral Code</Text>
            </View>
            
            <TouchableOpacity 
              style={styles.codeContainer}
              onPress={handleShareCode}
              activeOpacity={0.8}
            >
              <Text style={styles.codeText}>{referralCode}</Text>
              <Icon name="content-copy" size={20} color="#FFFFFF" />
            </TouchableOpacity>
            
            <Text style={styles.referralCardSubtitle}>
              Share this code and earn 10 points for each successful referral
            </Text>
            
            <TouchableOpacity 
              style={styles.shareCardButton}
              onPress={handleShareCode}
            >
              <Icon name="share-variant" size={20} color="#764BA2" />
              <Text style={styles.shareCardButtonText}>Share Code</Text>
            </TouchableOpacity>
          </View>
        </LinearGradient>

        {/* History Section */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Referral History</Text>
          <View style={styles.historyCount}>
            <Text style={styles.historyCountText}>{history.length}</Text>
          </View>
        </View>

        {history.length > 0 ? (
          <FlatList
            data={history}
            renderItem={renderHistoryItem}
            keyExtractor={(item, index) => index.toString()}
            scrollEnabled={false}
            contentContainerStyle={styles.listContainer}
          />
        ) : (
          renderEmptyHistory()
        )}

        {/* How It Works */}
        <View style={styles.howItWorks}>
          <Text style={styles.howItWorksTitle}>🎯 How It Works</Text>
          
          <View style={styles.stepContainer}>
            <View style={styles.step}>
              <View style={styles.stepNumber}>
                <Text style={styles.stepNumberText}>1</Text>
              </View>
              <Text style={styles.stepText}>Share your referral code with friends</Text>
            </View>
            
            <View style={styles.step}>
              <View style={styles.stepNumber}>
                <Text style={styles.stepNumberText}>2</Text>
              </View>
              <Text style={styles.stepText}>Friend signs up using your code</Text>
            </View>
            
            <View style={styles.step}>
              <View style={styles.stepNumber}>
                <Text style={styles.stepNumberText}>3</Text>
              </View>
              <Text style={styles.stepText}>Both get 10 points instantly!</Text>
            </View>
          </View>
        </View>

        {/* Footer Space */}
        <View style={styles.footerSpace} />
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#F5F5F5',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: '#666',
  },
  headerGradient: {
    paddingTop: 10,
    paddingBottom: 15,
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 20,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 10,
  },
  backButton: {
    padding: 8,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#FFFFFF',
    flex: 1,
    textAlign: 'center',
  },
  shareHeaderButton: {
    padding: 8,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
  },
  container: {
    flex: 1,
  },
  statsContainer: {
    paddingHorizontal: 20,
    marginTop: 20,
  },
  statRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  statCard: {
    flex: 1,
    marginHorizontal: 5,
    borderRadius: 15,
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  statGradient: {
    padding: 20,
    borderRadius: 15,
    alignItems: 'center',
  },
  statValue: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginTop: 10,
  },
  statLabel: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.9)',
    marginTop: 5,
    textAlign: 'center',
  },
  referralCard: {
    marginHorizontal: 20,
    marginTop: 20,
    borderRadius: 20,
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
  },
  referralContent: {
    padding: 25,
  },
  referralHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 15,
  },
  referralCardTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginLeft: 10,
  },
  codeContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    padding: 15,
    borderRadius: 12,
    marginBottom: 15,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.3)',
  },
  codeText: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#FFFFFF',
    letterSpacing: 2,
  },
  referralCardSubtitle: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.9)',
    marginBottom: 20,
    lineHeight: 20,
  },
  shareCardButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FFFFFF',
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 25,
    elevation: 3,
  },
  shareCardButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#764BA2',
    marginLeft: 8,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    marginTop: 30,
    marginBottom: 15,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
  },
  historyCount: {
    backgroundColor: '#FF4757',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
    minWidth: 30,
    alignItems: 'center',
  },
  historyCountText: {
    color: '#FFFFFF',
    fontWeight: 'bold',
    fontSize: 14,
  },
  listContainer: {
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  historyCard: {
    borderRadius: 15,
    padding: 18,
    marginBottom: 12,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  historyHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  userInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  avatarContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 71, 87, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  mobileText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 2,
  },
  dateText: {
    fontSize: 12,
    color: '#666',
  },
  pointsBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 215, 0, 0.1)',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 15,
    borderWidth: 1,
    borderColor: 'rgba(255, 215, 0, 0.3)',
  },
  pointsText: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#FF6B00',
    marginLeft: 4,
  },
  statusRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderTopWidth: 1,
    borderTopColor: '#EEE',
    paddingTop: 12,
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(76, 175, 80, 0.1)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 10,
  },
  statusText: {
    fontSize: 12,
    color: '#4CAF50',
    fontWeight: '600',
    marginLeft: 4,
  },
  indexText: {
    fontSize: 12,
    color: '#999',
    fontWeight: '500',
  },
  emptyContainer: {
    alignItems: 'center',
    paddingVertical: 40,
    paddingHorizontal: 20,
  },
  emptyIcon: {
    marginBottom: 20,
  },
  emptyTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#666',
    marginBottom: 10,
    textAlign: 'center',
  },
  emptySubtitle: {
    fontSize: 16,
    color: '#999',
    textAlign: 'center',
    marginBottom: 30,
    lineHeight: 22,
  },
  shareButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FF4757',
    paddingHorizontal: 25,
    paddingVertical: 12,
    borderRadius: 25,
    elevation: 3,
  },
  shareButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
    marginLeft: 8,
  },
  howItWorks: {
    backgroundColor: '#FFFFFF',
    marginHorizontal: 20,
    marginTop: 20,
    padding: 20,
    borderRadius: 15,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  howItWorksTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 15,
  },
  stepContainer: {
    marginTop: 10,
  },
  step: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 15,
  },
  stepNumber: {
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: '#FF4757',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 15,
  },
  stepNumberText: {
    color: '#FFFFFF',
    fontWeight: 'bold',
    fontSize: 14,
  },
  stepText: {
    fontSize: 14,
    color: '#555',
    flex: 1,
    lineHeight: 20,
  },
  footerSpace: {
    height: 30,
  },
});

export default ReferralHistoryScreen;