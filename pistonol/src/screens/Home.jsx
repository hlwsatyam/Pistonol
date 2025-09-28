import React, {useState, useRef} from 'react';
import {
  View,
  StyleSheet,
  Image,
  ScrollView,
  TouchableOpacity,
  Dimensions,
  Animated,
  FlatList,
} from 'react-native';
import {Text, Card} from 'react-native-paper';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import LinearGradient from 'react-native-linear-gradient';
import {Logo, themeColor} from '../locale/Locale';
 

const HomeScreen = ({navigation}) => {
  // Scheme Data
  const [schemes, setSchemes] = useState([
    {
      id: 1,
      title: 'Winter Special',
      description: 'Get 20% off on all products',
      icon: 'snowflake',
    },
    {
      id: 2,
      title: 'New Year Bonus',
      description: 'Earn double points this month',
      icon: 'party-popper',
    },
    {
      id: 3,
      title: 'Referral Program',
      description: 'Get ₹500 for each successful referral',
      icon: 'account-group',
    },
  ]);

  // Sales Data
  const [salesData, setSalesData] = useState({
    today: 12500,
    weekly: 87500,
    monthly: 325000,
    target: 500000,
  });

  // Progress Data
  const [progressData, setProgressData] = useState([
    {title: 'Daily Target', current: 65, target: 100, color: '#4CAF50'},
    {title: 'Product Knowledge', current: 80, target: 100, color: '#2196F3'},
    {title: 'Training Modules', current: 45, target: 100, color: '#FF9800'},
  ]);

  // Custom Carousel Implementation
  const scrollX = useRef(new Animated.Value(0)).current;
  const schemeRef = useRef(null);
  const {width: windowWidth} = Dimensions.get('window');
  const itemWidth = windowWidth * 0.8;
  const spacerWidth = (windowWidth - itemWidth) / 2;

  // Render Scheme Item
  const renderSchemeItem = ({item, index}) => {
    const inputRange = [
      (index - 1) * itemWidth,
      index * itemWidth,
      (index + 1) * itemWidth,
    ];

    const scale = scrollX.interpolate({
      inputRange,
      outputRange: [0.9, 1, 0.9],
      extrapolate: 'clamp',
    });

    return (
      <Animated.View style={{transform: [{scale}], width: itemWidth}}>
        <Card style={styles.schemeCard}>
          <Card.Content style={styles.schemeContent}>
            <Icon name={item.icon} size={40} color={themeColor[0]} />
            <Text style={styles.schemeTitle}>{item.title}</Text>
            <Text style={styles.schemeDescription}>{item.description}</Text>
            <TouchableOpacity style={styles.schemeButton}>
              <Text style={styles.schemeButtonText}>View Details</Text>
            </TouchableOpacity>
          </Card.Content>
        </Card>
      </Animated.View>
    );
  };

  // Render Progress Bar
  const renderProgressBar = (current, target, color) => {
    const percentage = (current / target) * 100;
    return (
      <View style={styles.progressContainer}>
        <View style={styles.progressBackground}>
          <View
            style={[
              styles.progressFill,
              {width: `${percentage}%`, backgroundColor: color},
            ]}
          />
        </View>
        <Text style={styles.progressText}>
          {current}/{target} ({percentage.toFixed(0)}%)
        </Text>
      </View>
    );
  };

  return (
    <View style={{flex: 1, backgroundColor: 'transparent'}}>
      <ScrollView contentContainerStyle={styles.scrollContainer}>
        {/* Header */}
        <View style={styles.header}>
          <Image source={Logo} style={styles.logo} resizeMode="contain" />
          <TouchableOpacity
            style={styles.profileButton}
            onPress={() => navigation.navigate('Profile')}>
            <Icon name="account" size={28} color="#333" />
          </TouchableOpacity>
        </View>

        {/* Welcome Message */}
        <Text style={styles.welcomeText}>Welcome back!</Text>
        <Text style={styles.subHeader}>Here's your dashboard overview</Text>

        {/* Custom Schemes Slider */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Current Schemes</Text>
          <View style={styles.carouselContainer}>
            <Animated.FlatList
              ref={schemeRef}
              data={schemes}
              renderItem={renderSchemeItem}
              keyExtractor={item => item.id.toString()}
              horizontal
              showsHorizontalScrollIndicator={false}
              snapToInterval={itemWidth}
              decelerationRate="fast"
              contentContainerStyle={styles.carouselContent}
              onScroll={Animated.event(
                [{nativeEvent: {contentOffset: {x: scrollX}}}],
                {useNativeDriver: true},
              )}
              scrollEventThrottle={16}
            />
          </View>
        </View>

        {/* Sales Overview */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Sales Overview</Text>
          <View style={styles.salesContainer}>
            <Card style={styles.salesCard}>
              <Card.Content>
                <Icon name="currency-inr" size={24} color="#4CAF50" />
                <Text style={styles.salesTitle}>Today</Text>
                <Text style={styles.salesAmount}>
                  ₹{salesData.today.toLocaleString()}
                </Text>
              </Card.Content>
            </Card>
            <Card style={styles.salesCard}>
              <Card.Content>
                <Icon name="calendar-week" size={24} color="#2196F3" />
                <Text style={styles.salesTitle}>This Week</Text>
                <Text style={styles.salesAmount}>
                  ₹{salesData.weekly.toLocaleString()}
                </Text>
              </Card.Content>
            </Card>
            <Card style={styles.salesCard}>
              <Card.Content>
                <Icon name="calendar-month" size={24} color="#FF9800" />
                <Text style={styles.salesTitle}>This Month</Text>
                <Text style={styles.salesAmount}>
                  ₹{salesData.monthly.toLocaleString()}
                </Text>
              </Card.Content>
            </Card>
          </View>
          <LinearGradient
            colors={themeColor}
            style={styles.targetCard}
            start={{x: 0, y: 0}}
            end={{x: 1, y: 0}}>
            <Text style={styles.targetText}>Monthly Target</Text>
            <Text style={styles.targetAmount}>
              ₹{salesData.monthly.toLocaleString()} / ₹
              {salesData.target.toLocaleString()}
            </Text>
            {renderProgressBar(salesData.monthly, salesData.target, '#FFFFFF')}
          </LinearGradient>
        </View>

        {/* Progress Trackers */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Your Progress</Text>
          <View style={styles.progressGrid}>
            {progressData.map((item, index) => (
              <Card key={index} style={styles.progressCard}>
                <Card.Content>
                  <Text style={styles.progressTitle}>{item.title}</Text>
                  {renderProgressBar(item.current, item.target, item.color)}
                </Card.Content>
              </Card>
            ))}
          </View>
        </View>

        {/* Quick Actions */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Quick Actions</Text>
          <View style={styles.actionsContainer}>
            <TouchableOpacity
              style={styles.actionButton}
              onPress={() => navigation.navigate('NewSale')}>
              <Icon name="plus" size={24} color="white" />
              <Text style={styles.actionText}>New Sale</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.actionButton}
              onPress={() => navigation.navigate('AddCustomer')}>
              <Icon name="account-multiple-plus" size={24} color="white" />
              <Text style={styles.actionText}>Add Customer</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.actionButton}
              onPress={() => navigation.navigate('Reports')}>
              <Icon name="chart-bar" size={24} color="white" />
              <Text style={styles.actionText}>Reports</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Recent Activity */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Recent Activity</Text>
          <Card style={styles.activityCard}>
            <Card.Content>
              <View style={styles.activityItem}>
                <Icon name="check-circle" size={20} color="#4CAF50" />
                <Text style={styles.activityText}>Sale completed - ₹2,500</Text>
                <Text style={styles.activityTime}>2 hours ago</Text>
              </View>
              <View style={styles.activityItem}>
                <Icon name="account-plus" size={20} color="#2196F3" />
                <Text style={styles.activityText}>New customer added</Text>
                <Text style={styles.activityTime}>Yesterday</Text>
              </View>
              <View style={styles.activityItem}>
                <Icon name="alert-circle" size={20} color="#FF9800" />
                <Text style={styles.activityText}>Follow up reminder</Text>
                <Text style={styles.activityTime}>2 days ago</Text>
              </View>
            </Card.Content>
          </Card>
        </View>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  scrollContainer: {
    padding: 16,

    paddingBottom: 32,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  logo: {
    width: 120,
    height: 60,
  },
  profileButton: {
    padding: 8,
  },
  welcomeText: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 4,
  },
  subHeader: {
    fontSize: 16,
    color: '#666',
    marginBottom: 24,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 16,
  },
  carouselContainer: {
    height: 220,
  },
  carouselContent: {
    alignItems: 'center',
  },
  schemeCard: {
    backgroundColor: 'white',
    borderRadius: 12,
    elevation: 3,
    marginHorizontal: 8,
  },
  schemeContent: {
    alignItems: 'center',
    padding: 20,
  },
  schemeTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginTop: 12,
    marginBottom: 8,
    textAlign: 'center',
  },
  schemeDescription: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
    marginBottom: 16,
  },
  schemeButton: {
    backgroundColor: themeColor[0],
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 20,
  },
  schemeButtonText: {
    color: 'white',
    fontWeight: 'bold',
  },
  salesContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  salesCard: {
    flex: 1,
    marginHorizontal: 4,
    backgroundColor: 'white',
    borderRadius: 12,
  },
  salesTitle: {
    fontSize: 14,
    color: '#666',
    marginTop: 8,
  },
  salesAmount: {
    fontSize: 18,
    fontWeight: 'bold',
    marginTop: 4,
  },
  targetCard: {
    borderRadius: 12,
    padding: 16,
  },
  targetText: {
    color: 'white',
    fontSize: 16,
  },
  targetAmount: {
    color: 'white',
    fontSize: 20,
    fontWeight: 'bold',
    marginVertical: 8,
  },
  progressContainer: {
    marginTop: 8,
  },
  progressBackground: {
    height: 8,
    backgroundColor: 'rgba(255,255,255,0.3)',
    borderRadius: 4,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    borderRadius: 4,
  },
  progressText: {
    color: 'white',
    fontSize: 12,
    marginTop: 4,
    textAlign: 'right',
  },
  progressGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  progressCard: {
    width: '48%',
    marginBottom: 16,
    backgroundColor: 'white',
    borderRadius: 12,
  },
  progressTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  actionsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  actionButton: {
    backgroundColor: themeColor[0],
    borderRadius: 8,
    padding: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    width: '30%',
  },
  actionText: {
    color: 'white',
    marginLeft: 8,
    fontWeight: 'bold',
  },
  activityCard: {
    backgroundColor: 'white',
    borderRadius: 12,
  },
  activityItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  activityText: {
    flex: 1,
    marginLeft: 12,
  },
  activityTime: {
    color: '#666',
    fontSize: 12,
  },
});

export default HomeScreen;
