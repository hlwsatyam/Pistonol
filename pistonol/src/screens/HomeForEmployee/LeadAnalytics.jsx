// import React from 'react';
// import { 
//   View, 
//   Text, 
//   StyleSheet, 
//   ScrollView, 
//   ActivityIndicator,
//   Dimensions,
//   TouchableOpacity,
   
// } from 'react-native';
// import { PieChart, BarChart } from 'react-native-chart-kit';
// import { useQuery } from '@tanstack/react-query';
// import axios from 'axios';
// import Ionicons from 'react-native-vector-icons/Ionicons';
// import LinearGradient from 'react-native-linear-gradient';
// import { themeColor, startDirectionTheme, endDirectionTheme } from '../../locale/Locale';
 
// import ThemeWithBg from '../../Skeleton/ThemeWithBg';

// const LeadAnalytics = ({ route, navigation }) => {
//   const { user } = route.params;

//   const { data, isLoading, error } = useQuery({
//     queryKey: ['leadAnalytics', user._id],
//     queryFn: async () => {
//       const response = await axios.get(`/leads/analytics/${user._id}`);
//       return response.data;
//     }
//   });

//   if (isLoading) {
//     return (
//       <View style={styles.loadingContainer}>
//         <ActivityIndicator size="large" color={themeColor[0]} />
//       </View>
//     );
//   }

//   if (error) {
//     return (
//       <View style={styles.errorContainer}>
//         <Ionicons name="alert-circle" size={40} color="#FF3B30" />
//         <Text style={styles.errorText}>Error loading analytics</Text>
//       </View>
//     );
//   }

//   const statusData = data?.statusCounts?.map(item => ({
//     name: item._id,
//     count: item.count,
//     color: getStatusColor(item._id),
//     legendFontColor: '#7F7F7F',
//     legendFontSize: 13
//   })) || [];

//   const weeklyTrendData = {
//     labels: data?.weeklyTrend?.map((_, index) => `Week ${index + 1}`) || [],
//     datasets: [{
//       data: data?.weeklyTrend?.map(item => item.count) || []
//     }]
//   };

//   return (
//     <ThemeWithBg style={styles.safeArea}>
//       <LinearGradient 
//         colors={themeColor} 
//         start={startDirectionTheme} 
//         end={endDirectionTheme}
//         style={styles.headerGradient}
//       >
//         <View style={styles.header}>
//           <TouchableOpacity 
//             style={styles.backButton} 
//             onPress={() => navigation.goBack()}
//           >
//             <Ionicons name="arrow-back" size={24} color="white" />
//           </TouchableOpacity>
//           <Text style={styles.headerTitle}>Lead Analytics</Text>
//           <View style={styles.headerRight} />
//         </View>
//       </LinearGradient>

//       <ScrollView 
//         style={styles.container}
//         showsVerticalScrollIndicator={false}
//       >
//         {/* Summary Cards */}
//         <View style={styles.cardRow}>
//           <LinearGradient
//             colors={['#4CAF50', '#8BC34A']}
//             style={[styles.card, styles.cardElevated]}
//             start={{x: 0, y: 0}}
//             end={{x: 1, y: 0}}
//           >
//             <Ionicons name="today" size={28} color="white" />
//             <Text style={styles.cardTitle}>Today</Text>
//             <Text style={styles.cardValue}>{data?.todaysLeads || 0}</Text>
//           </LinearGradient>
          
//           <LinearGradient
//             colors={['#2196F3', '#03A9F4']}
//             style={[styles.card, styles.cardElevated]}
//             start={{x: 0, y: 0}}
//             end={{x: 1, y: 0}}
//           >
//             <Ionicons name="calendar" size={28} color="white" />
//             <Text style={styles.cardTitle}>Last 7 Days</Text>
//             <Text style={styles.cardValue}>{data?.last7DaysLeads || 0}</Text>
//           </LinearGradient>
//         </View>
        
//         <View style={styles.cardRow}>
//           <LinearGradient
//             colors={['#9C27B0', '#E91E63']}
//             style={[styles.card, styles.cardWide, styles.cardElevated]}
//             start={{x: 0, y: 0}}
//             end={{x: 1, y: 0}}
//           >
//             <Ionicons name="today" size={28} color="white" />
//             <Text style={styles.cardTitle}>This Month</Text>
//             <Text style={styles.cardValue}>{data?.monthlyLeads || 0}</Text>
//           </LinearGradient>
//         </View>

//         {/* Status Distribution Pie Chart */}
//         <View style={[styles.chartContainer, styles.cardElevated]}>
//           <View style={styles.chartHeader}>
//             <Ionicons name="pie-chart" size={20} color="#555" />
//             <Text style={styles.chartTitle}>Lead Status Distribution</Text>
//           </View>
//           {statusData.length > 0 ? (
//             <PieChart
//               data={statusData}
//               width={Dimensions.get('window').width - 40}
//               height={200}
//               chartConfig={{
//                 color: (opacity = 1) => `rgba(255, 255, 255, ${opacity})`,
//               }}
//               accessor="count"
//               backgroundColor="transparent"
//               paddingLeft="15"
//               absolute
//               style={styles.chart}
//             />
//           ) : (
//             <View style={styles.noDataContainer}>
//               <Ionicons name="stats-chart" size={40} color="#ddd" />
//               <Text style={styles.noDataText}>No status data available</Text>
//             </View>
//           )}
//         </View>

//         {/* Weekly Trend Bar Chart */}
//         <View style={[styles.chartContainer, styles.cardElevated]}>
//           <View style={styles.chartHeader}>
//             <Ionicons name="bar-chart" size={20} color="#555" />
//             <Text style={styles.chartTitle}>Weekly Trend (Last 4 Weeks)</Text>
//           </View>
//           {weeklyTrendData.labels.length > 0 ? (
//             <BarChart
//               data={weeklyTrendData}
//               width={Dimensions.get('window').width - 40}
//               height={220}
//               yAxisLabel=""
//               chartConfig={{
//                 backgroundColor: '#ffffff',
//                 backgroundGradientFrom: '#f8f8f8',
//                 backgroundGradientTo: '#f8f8f8',
//                 decimalPlaces: 0,
//                 color: (opacity = 1) => `rgba(0, 122, 255, ${opacity})`,
//                 labelColor: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`,
//                 propsForDots: {
//                   r: "4",
//                   strokeWidth: "2",
//                   stroke: "#007aff"
//                 }
//               }}
//               style={styles.chart}
//               fromZero
//             />
//           ) : (
//             <View style={styles.noDataContainer}>
//               <Ionicons name="stats-chart" size={40} color="#ddd" />
//               <Text style={styles.noDataText}>No trend data available</Text>
//             </View>
//           )}
//         </View>
//       </ScrollView>
//     </ThemeWithBg>
//   );
// };

// // Helper function for status colors
// const getStatusColor = (status) => {
//   switch(status) {
//     case 'New': return '#2196F3';
//     case 'Contacted': return '#FFC107';
//     case 'Qualified': return '#4CAF50';
//     case 'Lost': return '#F44336';
//     default: return '#9E9E9E';
//   }
// };

// const styles = StyleSheet.create({
//   safeArea: {
//     flex: 1,
//     backgroundColor: '#f8f8f8'
//   },
//   headerGradient: {
  
//     shadowColor: '#000',
//     shadowOffset: { width: 0, height: 2 },
//     shadowOpacity: 0.2,
//     shadowRadius: 4,
//     elevation: 5,
//     zIndex: 10
//   },
//   header: {
//     flexDirection: 'row',
//     alignItems: 'center',
//     justifyContent: 'space-between',
//     paddingHorizontal: 20,
//     paddingVertical: 10
//   },
//   backButton: {
//     padding: 8,
//     borderRadius: 20,
//     backgroundColor: 'rgba(255,255,255,0.2)',
//     justifyContent: 'center',
//     alignItems: 'center'
//   },
//   headerTitle: {
//     fontSize: 20,
//     fontWeight: '600',
//     color: 'white',
//     marginLeft: 15
//   },
//   headerRight: {
//     width: 40
//   },
//   container: {
//     flex: 1,
//     padding: 20,
//     backgroundColor: '#f8f8f8'
//   },
//   loadingContainer: {
//     flex: 1,
//     justifyContent: 'center',
//     alignItems: 'center',
//     backgroundColor: '#f8f8f8'
//   },
//   errorContainer: {
//     flex: 1,
//     justifyContent: 'center',
//     alignItems: 'center',
//     backgroundColor: '#f8f8f8',
//     padding: 20
//   },
//   errorText: {
//     marginTop: 10,
//     fontSize: 16,
//     color: '#FF3B30',
//     fontWeight: '500'
//   },
//   cardRow: {
//     flexDirection: 'row',
//     justifyContent: 'space-between',
//     marginBottom: 20
//   },
//   card: {
//     borderRadius: 12,
//     padding: 20,
//     width: '48%',
//     alignItems: 'center',
//     justifyContent: 'center'
//   },
//   cardWide: {
//     width: '100%',
//     flexDirection: 'row',
//     justifyContent: 'space-around',
//     alignItems: 'center'
//   },
//   cardElevated: {
//     shadowColor: '#000',
//     shadowOffset: { width: 0, height: 4 },
//     shadowOpacity: 0.1,
//     shadowRadius: 8,
//     elevation: 5
//   },
//   cardTitle: {
//     fontSize: 14,
//     color: 'rgba(255,255,255,0.9)',
//     marginVertical: 5,
//     fontWeight: '500'
//   },
//   cardValue: {
//     fontSize: 28,
//     fontWeight: '700',
//     color: 'white',
//     marginTop: 5
//   },
//   chartContainer: {
//     backgroundColor: 'white',
//     borderRadius: 12,
//     padding: 15,
//     marginBottom: 20
//   },
//   chartHeader: {
//     flexDirection: 'row',
//     alignItems: 'center',
//     marginBottom: 15
//   },
//   chartTitle: {
//     fontSize: 16,
//     fontWeight: '600',
//     marginLeft: 8,
//     color: '#333'
//   },
//   chart: {
//     borderRadius: 8,
//     marginTop: 10
//   },
//   noDataContainer: {
//     height: 150,
//     justifyContent: 'center',
//     alignItems: 'center',
//     padding: 20
//   },
//   noDataText: {
//     marginTop: 10,
//     color: '#888',
//     fontSize: 14
//   }
// });

// export default LeadAnalytics;



import React from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  ScrollView, 
  ActivityIndicator,
  Dimensions,
  TouchableOpacity,
   
} from 'react-native';
import { PieChart, BarChart } from 'react-native-chart-kit';
import { useQuery } from '@tanstack/react-query';
import axios from 'axios';
import Ionicons from 'react-native-vector-icons/Ionicons';
import LinearGradient from 'react-native-linear-gradient';
import { themeColor, startDirectionTheme, endDirectionTheme } from '../../locale/Locale';
 
import ThemeWithBg from '../../Skeleton/ThemeWithBg';

const LeadAnalytics = ({ route, navigation }) => {
  const { user } = route.params;

  const { data, isLoading, error } = useQuery({
    queryKey: ['leadAnalytics', user._id],
    queryFn: async () => {
      const response = await axios.get(`/leads/analytics/${user._id}`);
      return response.data;
    }
  });

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#2196F3" />
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.errorContainer}>
        <Ionicons name="alert-circle" size={40} color="#FF3B30" />
        <Text style={[styles.errorText, { color: '#FF0000' }]}>Error loading analytics</Text>
      </View>
    );
  }

  const statusData = data?.statusCounts?.map(item => ({
    name: item._id,
    count: item.count,
    color: getStatusColor(item._id),
    legendFontColor: '#7F7F7F',
    legendFontSize: 13
  })) || [];

  const weeklyTrendData = {
    labels: data?.weeklyTrend?.map((_, index) => `Week ${index + 1}`) || [],
    datasets: [{
      data: data?.weeklyTrend?.map(item => item.count) || []
    }]
  };

  return (
    <ThemeWithBg style={styles.safeArea}>
      <LinearGradient 
        colors={['blue', 'blue']} 
        start={startDirectionTheme} 
        end={endDirectionTheme}
        style={styles.headerGradient}
      >
        <View style={styles.header}>
          <TouchableOpacity 
            style={styles.backButton} 
            onPress={() => navigation.goBack()}
          >
            <Ionicons name="arrow-back" size={24} color="white" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Lead Analytics</Text>
          <View style={styles.headerRight} />
        </View>
      </LinearGradient>

      <ScrollView 
        style={styles.container}
        showsVerticalScrollIndicator={false}
      >
        {/* Summary Cards */}
        <View style={styles.cardRow}>
          <LinearGradient
            colors={['#2196F3', '#64B5F6']}
            style={[styles.card, styles.cardElevated]}
            start={{x: 0, y: 0}}
            end={{x: 1, y: 0}}
          >
            <Ionicons name="today" size={28} color="white" />
            <Text style={styles.cardTitle}>Today</Text>
            <Text style={[styles.cardValue, { color: '#ffffffff' }]}>{data?.todaysLeads || 0}</Text>
          </LinearGradient>
          
          <LinearGradient
            colors={['#1976D2', '#42A5F5']}
            style={[styles.card, styles.cardElevated]}
            start={{x: 0, y: 0}}
            end={{x: 1, y: 0}}
          >
            <Ionicons name="calendar" size={28} color="white" />
            <Text style={styles.cardTitle}>Last 7 Days</Text>
            <Text style={styles.cardValue}>{data?.last7DaysLeads || 0}</Text>
          </LinearGradient>
        </View>
        
        <View style={styles.cardRow}>
          <LinearGradient
            colors={['#0D47A1', '#2196F3']}
            style={[styles.card, styles.cardWide, styles.cardElevated]}
            start={{x: 0, y: 0}}
            end={{x: 1, y: 0}}
          >
            <Ionicons name="today" size={28} color="white" />
            <Text style={styles.cardTitle}>This Month</Text>
            <Text style={[styles.cardValue, { color: '#ffffffff' }]}>{data?.monthlyLeads || 0}</Text>
          </LinearGradient>
        </View>

        {/* Status Distribution Pie Chart */}
        <View style={[styles.chartContainer, styles.cardElevated]}>
          <View style={styles.chartHeader}>
            <Ionicons name="pie-chart" size={20} color="#555" />
            <Text style={[styles.chartTitle, { color: '#FF0000' }]}>Lead Status Distribution</Text>
          </View>
          {statusData.length > 0 ? (
            <PieChart
              data={statusData}
              width={Dimensions.get('window').width - 40}
              height={200}
              chartConfig={{
                color: (opacity = 1) => `rgba(33, 150, 243, ${opacity})`,
              }}
              accessor="count"
              backgroundColor="transparent"
              paddingLeft="15"
              absolute
              style={styles.chart}
            />
          ) : (
            <View style={styles.noDataContainer}>
              <Ionicons name="stats-chart" size={40} color="#ddd" />
              <Text style={styles.noDataText}>No status data available</Text>
            </View>
          )}
        </View>

        {/* Weekly Trend Bar Chart */}
        <View style={[styles.chartContainer, styles.cardElevated]}>
          <View style={styles.chartHeader}>
            <Ionicons name="bar-chart" size={20} color="#555" />
            <Text style={styles.chartTitle}>Weekly Trend (Last 4 Weeks)</Text>
          </View>
          {weeklyTrendData.labels.length > 0 ? (
            <BarChart
              data={weeklyTrendData}
              width={Dimensions.get('window').width - 40}
              height={220}
              yAxisLabel=""
              chartConfig={{
                backgroundColor: '#ffffff',
                backgroundGradientFrom: '#E3F2FD',
                backgroundGradientTo: '#BBDEFB',
                decimalPlaces: 0,
                color: (opacity = 1) => `rgba(33, 150, 243, ${opacity})`,
                labelColor: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`,
                propsForDots: {
                  r: "4",
                  strokeWidth: "2",
                  stroke: "#2196F3"
                }
              }}
              style={styles.chart}
              fromZero
            />
          ) : (
            <View style={styles.noDataContainer}>
              <Ionicons name="stats-chart" size={40} color="#ddd" />
              <Text style={styles.noDataText}>No trend data available</Text>
            </View>
          )}
        </View>
      </ScrollView>
    </ThemeWithBg>
  );
};

// Helper function for status colors
const getStatusColor = (status) => {
  switch(status) {
    case 'New': return '#2196F3';
    case 'Contacted': return '#64B5F6';
    case 'Qualified': return '#1976D2';
    case 'Lost': return '#FF5252';
    default: return '#BBDEFB';
  }
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#E3F2FD'
  },
  headerGradient: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 5,
    zIndex: 10
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 10
  },
  backButton: {
    padding: 8,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.2)',
    justifyContent: 'center',
    alignItems: 'center'
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: 'white',
    marginLeft: 15
  },
  headerRight: {
    width: 40
  },
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#eae3fdff'
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#E3F2FD'
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#E3F2FD',
    padding: 20
  },
  errorText: {
    marginTop: 10,
    fontSize: 16,
    fontWeight: '500'
  },
  cardRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 20
  },
  card: {
    borderRadius: 12,
    padding: 20,
    width: '48%',
    alignItems: 'center',
    justifyContent: 'center'
  },
  cardWide: {
    width: '100%',
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center'
  },
  cardElevated: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 5
  },
  cardTitle: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.9)',
    marginVertical: 5,
    fontWeight: '500'
  },
  cardValue: {
    fontSize: 28,
    fontWeight: '700',
    color: 'white',
    marginTop: 5
  },
  chartContainer: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 15,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: '#BBDEFB'
  },
  chartHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 15
  },
  chartTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
    color: '#333'
  },
  chart: {
    borderRadius: 8,
    marginTop: 10
  },
  noDataContainer: {
    height: 150,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20
  },
  noDataText: {
    marginTop: 10,
    color: '#888',
    fontSize: 14
  }
});

export default LeadAnalytics;




