// import React, {useRef, useState} from 'react';
// import {
//   View,
//   TouchableOpacity,
//   Animated,
//   StyleSheet,
// } from 'react-native';
// import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
// import Ionicons from 'react-native-vector-icons/Ionicons';
// import ThemeWithBg from '../Skeleton/ThemeWithBg';
// import {createMaterialTopTabNavigator} from '@react-navigation/material-top-tabs';
// import HomeScreen from '../screens/Home';
// import {Text} from 'react-native-paper';
// import Scan from '../screens/Scan';
// import OrderProduct from '../screens/OrderProduct';
 

// const Tab = createMaterialTopTabNavigator();

// const TopBar = () => {
//   // Animation values
//   const scaleValue = useRef(new Animated.Value(1)).current;
//   const rotateValue = useRef(new Animated.Value(0)).current;
//   const [activeTab, setActiveTab] = useState('Home');

//   const animateScanIcon = () => {
//     // Reset values
//     scaleValue.setValue(1);
//     rotateValue.setValue(0);

//     // Parallel animations
//     Animated.parallel([
//       Animated.spring(scaleValue, {
//         toValue: 1.2,
//         friction: 3,
//         useNativeDriver: true,
//       }),
//       Animated.loop(
//         Animated.timing(rotateValue, {
//           toValue: 1,
//           duration: 2000,
//           useNativeDriver: true,
//         }),
//       ),
//     ]).start();
//   };

//   const rotateInterpolation = rotateValue.interpolate({
//     inputRange: [0, 1],
//     outputRange: ['0deg', '360deg'],
//   });

//   return (
//     <ThemeWithBg>
//       {activeTab === 'Home' && (
//         <View style={styles.header}>
//           <Text style={styles.headerTitle}>Pistonol</Text>
//           <View style={styles.headerIcons}>
//             <TouchableOpacity style={styles.iconButton}>
//               <Ionicons name="notifications-outline" size={24} color="#000" />
//             </TouchableOpacity>
//             <TouchableOpacity style={styles.iconButton}>
//               <Ionicons name="wallet-outline" size={24} color="#000" />
//             </TouchableOpacity>
//           </View>
//         </View>
//       )}

//       <Tab.Navigator
//         screenOptions={{
//           tabBarActiveTintColor: 'tomato',
//           tabBarInactiveTintColor: 'gray',
//           tabBarLabelStyle: {fontSize: 8},
//           tabBarStyle: {
//             backgroundColor: 'transparent',
//             elevation: 0,
//             margin: 0,
//             padding: 0,
//             shadowColor: 'transparent',
//           },
//           tabBarItemStyle: {margin: 0, padding: 0},
//           tabBarIndicatorStyle: {backgroundColor: 'tomato'},
//         }}
//         screenListeners={{
//           state: (e) => {
//             // Get the current route name when tab changes
//             const routeName = e.data?.state?.routes[e.data.state.index]?.name;
//             if (routeName) {
//               setActiveTab(routeName);
//             }
//           },
//         }}>
//         <Tab.Screen
//           name="Home"
//           component={HomeScreen}
//           options={{
//             tabBarIcon: ({color}) => (
//               <Icon name="home-outline" size={24} color={color} />
//             ),
//           }}
//         />
//         <Tab.Screen
//           name="Product"
//           component={OrderProduct}
//           options={{
//             tabBarIcon: ({color}) => (
//               <Ionicons name="briefcase-outline" size={24} color={color} />
//             ),
//           }}
//         />
//         <Tab.Screen
//           name="Scan"
//           component={Scan}
//           options={{
//             tabBarIcon: ({color}) => (
//               <Animated.View
//                 style={[
//                   styles.scanIconContainer,
//                   {
//                     transform: [
//                       {scale: scaleValue},
//                       {rotate: rotateInterpolation},
//                     ],
//                   },
//                 ]}>
//                 <Icon name="line-scan" size={32} color={color} />
//               </Animated.View>
//             ),
//             tabBarLabel: '',
//           }}
//           listeners={{
//             tabPress: animateScanIcon,
//           }}
//         />
//         <Tab.Screen
//           name="Rating"
//           component={HomeScreen}
//           options={{
//             tabBarIcon: ({color}) => (
//               <Icon name="star-outline" size={24} color={color} />
//             ),
//           }}
//         />
       
//       </Tab.Navigator>
//     </ThemeWithBg>
//   );
// };

// const styles = StyleSheet.create({
//   header: {
//     flexDirection: 'row',
//     paddingHorizontal: 20,
     
//     justifyContent: 'space-between',
//     alignItems: 'center',
//     backgroundColor: 'transparent',
//   },
//   headerTitle: {
//     fontSize: 18,
//     fontWeight: 'bold',
//     color: '#000',
//   },
//   headerIcons: {
//     flexDirection: 'row',
//     alignItems: 'center',
//     gap: 15,
//   },
//   iconButton: {
    
//   },
//   scanIconContainer: {
//     width: 40,
//     height: 40,
//     position: 'absolute',
//     top: -12,
//     left: '50%',
//     marginLeft: -30,
//     borderRadius: 30,
//     justifyContent: 'center',
//     alignItems: 'center',
   

//   },
// });

// export default TopBar;

 import React from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  RefreshControl,
  TouchableOpacity,
  Dimensions,
  Animated,
  FlatList
} from 'react-native';
import { useQuery } from '@tanstack/react-query';
import axios from 'axios';
import LinearGradient from 'react-native-linear-gradient';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { PieChart } from 'react-native-chart-kit';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useNavigation } from '@react-navigation/native';

const { width } = Dimensions.get('window');

const SimpleDistributorDashboard = ({ user }) => {
  const { data: dashboardData, isLoading, refetch } = useQuery({
    queryKey: ['distributor-dashboard'],
    queryFn: async () => {


   let user = await AsyncStorage.getItem('user');

      if (user) {
        user = JSON.parse(user);
        if (user?.role === 'distributor') {
          const response = await axios.get(`/orders/distributor/simple-dashboard?id=${user._id}`);
      return response.data;
        } 
      }


   
    }
  });

  const statusColors = {
    pending: '#FFA500',
    approved: '#1890FF',
    delivered: '#52C41A'
  };

  const { overview, recentOrders, statusDistribution } = dashboardData?.data || {};

  // Prepare data for pie chart
  const pieChartData = statusDistribution?.map((item, index) => ({
    name: item.name,
    population: item.value,
    color: statusColors[item.name],
    legendFontColor: '#7F7F7F',
    legendFontSize: 12,
  })) || [];

  const chartConfig = {
    backgroundColor: '#ffffff',
    backgroundGradientFrom: '#ffffff',
    backgroundGradientTo: '#ffffff',
    color: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`,
  };

  const StatCard = ({ title, value, icon, gradient, prefix }) => (
    <LinearGradient
      colors={gradient}
      style={styles.statCard}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
    >
      <View style={styles.statContent}>
        <View style={styles.statHeader}>
          <View style={styles.iconContainer}>
            <Icon name={icon} size={24} color="#fff" />
          </View>
          <Text style={styles.statValue}>
            {prefix}{value}
          </Text>
        </View>
        <Text style={styles.statTitle}>{title}</Text>
      </View>
    </LinearGradient>
  );

  const OrderItem = ({ item }) => (
    <View style={styles.orderItem}>
      <View style={styles.orderHeader}>
        <Text style={styles.orderNumber}>{item.orderNumber}</Text>
        <View style={[styles.statusBadge, { backgroundColor: statusColors[item.status] }]}>
          <Text style={styles.statusText}>{item.status.toUpperCase()}</Text>
        </View>
      </View>
      <View style={styles.orderDetails}>
        <Text style={styles.orderAmount}>₹{item.totalAmount}</Text>
        <Text style={styles.orderDate}>
          {new Date(item.createdAt).toLocaleDateString()}
        </Text>
      </View>
    </View>
  );

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <Icon name="loading" size={40} color="#1890FF" />
        <Text style={styles.loadingText}>Loading Dashboard...</Text>
      </View>
    );
  }
const nav=useNavigation()
  return (
    <View style={styles.container}>
      <ScrollView 
        style={styles.scrollView}
        refreshControl={
          <RefreshControl refreshing={isLoading} onRefresh={refetch} />
        }
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
         <LinearGradient
      colors={['#667eea', '#764ba2']}
      style={styles.header}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
    >
      <View style={styles.leftSection}>
        <Text style={styles.headerTitle}>Dashboard</Text>
        <Text style={styles.headerSubtitle}>Welcome back, {user?.username}</Text>
      </View>

      <TouchableOpacity style={styles.createButton} onPress={()=>nav.navigate('DistributorOrders')}>
        <Text style={styles.createButtonText}>+ Create Order</Text>
      </TouchableOpacity>
    </LinearGradient>

        {/* Stats Grid */}
        <View style={styles.statsGrid}>
          <StatCard
            title="Total Orders"
            value={overview?.totalOrders || 0}
            icon="cart-outline"
            gradient={['#667eea', '#764ba2']}
          />
          <StatCard
            title="Wallet Balance"
            value={overview?.walletBalance || 0}
            icon="wallet-outline"
            gradient={['#f093fb', '#f5576c']}
            prefix="₹"
          />
          <StatCard
            title="Monthly Revenue"
            value={overview?.monthlyRevenue || 0}
            icon="cash-multiple"
            gradient={['#4facfe', '#00f2fe']}
            prefix="₹"
          />
          <StatCard
            title="Delivered Orders"
            value={overview?.deliveredOrders || 0}
            icon="check-circle-outline"
            gradient={['#43e97b', '#38f9d7']}
          />
        </View>

        {/* Charts and Analytics */}
        <View style={styles.chartsSection}>
          {/* Order Status Chart */}
          <View style={styles.chartCard}>
            <View style={styles.cardHeader}>
              <Icon name="chart-pie" size={20} color="#1890FF" />
              <Text style={styles.cardTitle}>Order Status Distribution</Text>
            </View>
            {pieChartData.length > 0 ? (
              <>
                <PieChart
                  data={pieChartData}
                  width={width - 80}
                  height={180}
                  chartConfig={chartConfig}
                  accessor="population"
                  backgroundColor="transparent"
                  paddingLeft="15"
                  absolute
                />
                <View style={styles.legendContainer}>
                  {statusDistribution?.map((item, index) => (
                    <View key={index} style={styles.legendItem}>
                      <View 
                        style={[
                          styles.legendColor, 
                          { backgroundColor: statusColors[item.name] }
                        ]} 
                      />
                      <Text style={styles.legendText}>
                        {item.name}: {item.value}
                      </Text>
                    </View>
                  ))}
                </View>
              </>
            ) : (
              <View style={styles.noDataContainer}>
                <Icon name="chart-line" size={40} color="#ccc" />
                <Text style={styles.noDataText}>No data available</Text>
              </View>
            )}
          </View>

          {/* Performance Metrics */}
          <View style={styles.performanceCard}>
            <View style={styles.cardHeader}>
              <Icon name="trending-up" size={20} color="#52C41A" />
              <Text style={styles.cardTitle}>Performance Metrics</Text>
            </View>
            <View style={styles.metricsContainer}>
              <View style={styles.metricItem}>
                <Text style={styles.metricLabel}>Order Completion</Text>
                <View style={styles.progressContainer}>
                  <View style={styles.progressBackground}>
                    <View 
                      style={[
                        styles.progressFill,
                        { 
                          width: `${overview?.totalOrders ? 
                            Math.round((overview.deliveredOrders / overview.totalOrders) * 100) : 0}%` 
                        }
                      ]} 
                    />
                  </View>
                  <Text style={styles.progressText}>
                    {overview?.totalOrders ? 
                      Math.round((overview.deliveredOrders / overview.totalOrders) * 100) : 0}%
                  </Text>
                </View>
              </View>
              
              <View style={styles.metricItem}>
                <Text style={styles.metricLabel}>Pending Orders</Text>
                <Text style={styles.pendingCount}>{overview?.pendingOrders || 0}</Text>
              </View>
            </View>
          </View>
        </View>

        {/* Recent Orders */}
        <View style={styles.recentOrdersCard}>
          <View style={styles.cardHeader}>
            <Icon name="clock-outline" size={20} color="#FAAD14" />
            <Text style={styles.cardTitle}>Recent Orders</Text>
          </View>
          {recentOrders?.length > 0 ? (
            <FlatList
              data={recentOrders.slice(0, 5)}
              renderItem={({ item }) => <OrderItem item={item} />}
              keyExtractor={item => item._id}
              scrollEnabled={false}
              showsVerticalScrollIndicator={false}
            />
          ) : (
            <View style={styles.noDataContainer}>
              <Icon name="file-document-outline" size={40} color="#ccc" />
              <Text style={styles.noDataText}>No recent orders</Text>
            </View>
          )}
        </View>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  scrollView: {
    flex: 1,
  },







 header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 18,
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 20,
    elevation: 4,
  },
  leftSection: {
    flexDirection: 'column',
  },
  headerTitle: {
    color: '#fff',
    fontSize: 20,
    fontWeight: '700',
  },
  headerSubtitle: {
    color: '#f3f3f3',
    fontSize: 14,
    marginTop: 4,
  },
  createButton: {
    backgroundColor: '#fff',
    paddingVertical: 8,
    paddingHorizontal: 14,
    borderRadius: 25,
    elevation: 2,
  },
  createButtonText: {
    color: '#764ba2',
    fontSize: 14,
    fontWeight: '700',
  },







  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f8f9fa',
  },
  loadingText: {
    marginTop: 12,
    fontSize: 16,
    color: '#666',
  },
  header: {
    padding: 24,
    paddingTop: 50,
    borderBottomLeftRadius: 30,
    borderBottomRightRadius: 30,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 8,
  },
  headerSubtitle: {
    fontSize: 16,
    color: 'rgba(255,255,255,0.8)',
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    padding: 16,
    marginTop: -40,
  },
  statCard: {
    width: (width - 48) / 2,
    margin: 4,
    borderRadius: 20,
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
  },
  statContent: {
    padding: 20,
  },
  statHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  statValue: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#fff',
  },
  statTitle: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.9)',
    fontWeight: '600',
  },
  chartsSection: {
    padding: 16,
  },
  chartCard: {
    backgroundColor: '#fff',
    borderRadius: 20,
    padding: 20,
    marginBottom: 16,
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
  },
  performanceCard: {
    backgroundColor: '#fff',
    borderRadius: 20,
    padding: 20,
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
  },
  recentOrdersCard: {
    backgroundColor: '#fff',
    margin: 16,
    borderRadius: 20,
    padding: 20,
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginLeft: 12,
  },
  legendContainer: {
    marginTop: 16,
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  legendColor: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginRight: 8,
  },
  legendText: {
    fontSize: 12,
    color: '#666',
  },
  noDataContainer: {
    alignItems: 'center',
    padding: 40,
  },
  noDataText: {
    marginTop: 12,
    color: '#999',
    fontSize: 14,
  },
  metricsContainer: {
    marginTop: 8,
  },
  metricItem: {
    marginBottom: 20,
  },
  metricLabel: {
    fontSize: 14,
    color: '#666',
    marginBottom: 8,
  },
  progressContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  progressBackground: {
    flex: 1,
    height: 8,
    backgroundColor: '#f0f0f0',
    borderRadius: 4,
    marginRight: 12,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#52C41A',
    borderRadius: 4,
  },
  progressText: {
    fontSize: 12,
    color: '#666',
    minWidth: 35,
  },
  pendingCount: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#FAAD14',
  },
  orderItem: {
    backgroundColor: '#f8f9fa',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderLeftWidth: 4,
    borderLeftColor: '#1890FF',
  },
  orderHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  orderNumber: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#333',
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusText: {
    fontSize: 10,
    fontWeight: 'bold',
    color: '#fff',
  },
  orderDetails: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  orderAmount: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#1890FF',
  },
  orderDate: {
    fontSize: 12,
    color: '#999',
  },
});

export default SimpleDistributorDashboard;