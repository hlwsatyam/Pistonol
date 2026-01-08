// import React, { useState, useEffect } from 'react';
// import {
//   View,
//   Text,
//   TextInput,
//   TouchableOpacity,
//   StyleSheet,
//   Alert,
//   ScrollView,
//   ActivityIndicator,
//   FlatList,
//   Modal,
//   RefreshControl,
//   Dimensions,
//   KeyboardAvoidingView,
//   Platform
// } from 'react-native';
// import axios from 'axios';
// import Icon from 'react-native-vector-icons/MaterialIcons';
// import DateTimePicker from '@react-native-community/datetimepicker';
// import { Picker } from '@react-native-picker/picker';
// import { useNavigation } from '@react-navigation/native';
// import { SafeAreaView } from 'react-native-safe-area-context';

// const { width } = Dimensions.get('window');

// const TravelScreen = ({ route }) => {
//   const navigation = useNavigation();
//   const { userId } = route.params || { userId: 'user123' };
  
//   const [distance, setDistance] = useState('');
//   const [todayTravel, setTodayTravel] = useState(null);
//   const [travelHistory, setTravelHistory] = useState([]);
//   const [loading, setLoading] = useState(false);
//   const [fetching, setFetching] = useState(false);
//   const [historyLoading, setHistoryLoading] = useState(false);
//   const [refreshing, setRefreshing] = useState(false);
//   const [showHistory, setShowHistory] = useState(false);
//   const [showDatePicker, setShowDatePicker] = useState(false);
//   const [datePickerMode, setDatePickerMode] = useState(null); // 'start' or 'end'
//   const [stats, setStats] = useState(null);
//   const [editMode, setEditMode] = useState(false);
//   const [editingItem, setEditingItem] = useState(null);
  
//   // Pagination states
//   const [currentPage, setCurrentPage] = useState(1);
//   const [totalPages, setTotalPages] = useState(1);
//   const [totalItems, setTotalItems] = useState(0);
//   const [itemsPerPage, setItemsPerPage] = useState(10);
  
//   // Filter states
//   const [startDate, setStartDate] = useState(null);
//   const [endDate, setEndDate] = useState(null);
//   const [filterModalVisible, setFilterModalVisible] = useState(false);
  
//   const API_URL = '/v1/travel';

//   // Fetch initial data
//   useEffect(() => {
//     fetchTodayTravel();
//     fetchUserStats();
//     fetchTravelHistory(1);
//   }, []);

//   const fetchTodayTravel = async () => {
//     try {
//       setFetching(true);
//       const response = await axios.get(`${API_URL}/today/${userId}`);
      
//       if (response.data.success) {
//         setTodayTravel(response.data.data);
//         // If today has travel, pre-fill the input
//         if (response.data.data) {
//           setDistance(response.data.data.distance.toString());
//         }
//       }
//     } catch (error) {
//       console.error('Error fetching travel:', error);
//       Alert.alert('Error', 'Failed to load today\'s travel');
//     } finally {
//       setFetching(false);
//     }
//   };

//   const fetchTravelHistory = async (page = 1) => {
//     try {
//       setHistoryLoading(true);
//       let url = `${API_URL}/user-history/${userId}?page=${page}&limit=${itemsPerPage}`;
      
//       if (startDate) {
//         url += `&startDate=${startDate.toISOString().split('T')[0]}`;
//       }
//       if (endDate) {
//         url += `&endDate=${endDate.toISOString().split('T')[0]}`;
//       }
      
//       const response = await axios.get(url);
      
//       if (response.data.success) {
//         if (page === 1) {
//           setTravelHistory(response.data.data);
//         } else {
//           setTravelHistory(prev => [...prev, ...response.data.data]);
//         }
//         setCurrentPage(response.data.pagination.page);
//         setTotalPages(response.data.pagination.pages);
//         setTotalItems(response.data.pagination.total);
//       }
//     } catch (error) {
//       console.error('Error fetching history:', error);
//       Alert.alert('Error', 'Failed to load travel history');
//     } finally {
//       setHistoryLoading(false);
//     }
//   };

//   const fetchUserStats = async () => {
//     try {
//       const response = await axios.get(`${API_URL}/user-stats/${userId}`);
//       if (response.data.success) {
//         setStats(response.data.stats);
//       }
//     } catch (error) {
//       console.error('Error fetching stats:', error);
//     }
//   };

//   const onRefresh = async () => {
//     setRefreshing(true);
//     await Promise.all([
//       fetchTodayTravel(),
//       fetchTravelHistory(1),
//       fetchUserStats()
//     ]);
//     setRefreshing(false);
//   };

//   const handleSubmit = async () => {
//     if (!distance || parseFloat(distance) <= 0) {
//       Alert.alert('Error', 'Please enter valid distance (greater than 0)');
//       return;
//     }

//     setLoading(true);
//     try {
//       let response;
      
//       if (editMode && editingItem) {
//         // Edit existing entry
//         response = await axios.put(`${API_URL}/edit/${editingItem._id}`, {
//           distance: parseFloat(distance)
//         });
//       } else {
//         // Add new entry for today
//         response = await axios.post(`${API_URL}/add`, {
//           userId,
//           distance: parseFloat(distance)
//         });
//       }

//       if (response.data.success) {
//         Alert.alert('Success', response.data.message);
//         setDistance('');
//         setEditMode(false);
//         setEditingItem(null);
//         onRefresh(); // Refresh all data
//       }
//     } catch (error) {
//       const errorMessage = error.response?.data?.message || 'Failed to save travel';
//       Alert.alert('Error', errorMessage);
//     } finally {
//       setLoading(false);
//     }
//   };

//   const handleEdit = (item) => {
//     if (item.canEdit) {
//       setEditMode(true);
//       setEditingItem(item);
//       setDistance(item.distance.toString());
//       setShowHistory(false); // Close history modal
//     } else {
//       Alert.alert('Not Allowed', 'You can only edit today\'s travel entry');
//     }
//   };

//   const cancelEdit = () => {
//     setEditMode(false);
//     setEditingItem(null);
//     setDistance(todayTravel?.distance?.toString() || '');
//   };

//   const loadMore = () => {
//     if (currentPage < totalPages && !historyLoading) {
//       fetchTravelHistory(currentPage + 1);
//     }
//   };

//   const applyFilters = () => {
//     setFilterModalVisible(false);
//     setTravelHistory([]); // Clear old data
//     fetchTravelHistory(1); // Fetch with new filters
//   };

//   const clearFilters = () => {
//     setStartDate(null);
//     setEndDate(null);
//     setTravelHistory([]); // Clear old data
//     fetchTravelHistory(1); // Fetch without filters
//   };

//   const formatDate = (dateString) => {
//     if (!dateString) return 'N/A';
//     const date = new Date(dateString);
//     return date.toLocaleDateString('en-IN', {
//       weekday: 'short',
//       day: '2-digit',
//       month: 'short',
//       year: 'numeric'
//     });
//   };

//   const formatTime = (dateString) => {
//     if (!dateString) return 'N/A';
//     const date = new Date(dateString);
//     return date.toLocaleTimeString('en-IN', {
//       hour: '2-digit',
//       minute: '2-digit'
//     });
//   };

//   const isToday = (dateString) => {
//     if (!dateString) return false;
//     const today = new Date();
//     const inputDate = new Date(dateString);
//     return today.toDateString() === inputDate.toDateString();
//   };

//   const handleDatePicker = (event, selectedDate) => {
//     setShowDatePicker(false);
//     if (selectedDate) {
//       if (datePickerMode === 'start') {
//         setStartDate(selectedDate);
//       } else if (datePickerMode === 'end') {
//         setEndDate(selectedDate);
//       }
//     }
//   };

//   const renderHistoryItem = ({ item }) => {
//     const today = isToday(item.date);
    
//     return (
//       <TouchableOpacity
//         style={[
//           styles.historyItem,
//           today && styles.todayHistoryItem,
//           editingItem?._id === item._id && styles.selectedHistoryItem
//         ]}
//         onPress={() => handleEdit(item)}
//         activeOpacity={0.7}
//       >
//         <View style={styles.historyHeader}>
//           <View style={styles.dateContainer}>
//             <Icon 
//               name={today ? "today" : "calendar-today"} 
//               size={20} 
//               color={today ? "#3B82F6" : "#6B7280"} 
//             />
//             <View>
//               <Text style={[
//                 styles.historyDate,
//                 today && styles.todayText
//               ]}>
//                 {formatDate(item.date)}
//                 {today && " (Today)"}
//               </Text>
//               <Text style={styles.historyDateSmall}>
//                 {formatTime(item.updatedAt)}
//               </Text>
//             </View>
//           </View>
          
//           {today ? (
//             <View style={styles.editBadge}>
//               <Icon name="edit" size={14} color="#FFFFFF" />
//               <Text style={styles.editBadgeText}>Tap to Edit</Text>
//             </View>
//           ) : (
//             <View style={styles.readOnlyBadge}>
//               <Icon name="lock" size={14} color="#FFFFFF" />
//               <Text style={styles.readOnlyBadgeText}>View Only</Text>
//             </View>
//           )}
//         </View>

//         <View style={styles.historyContent}>
//           <View style={styles.distanceContainer}>
//             <Icon name="directions-car" size={28} color="#059669" />
//             <Text style={styles.historyDistance}>{item.distance} km</Text>
//           </View>
          
//           {editingItem?._id === item._id && (
//             <View style={styles.editingIndicator}>
//               <Icon name="edit" size={16} color="#3B82F6" />
//               <Text style={styles.editingText}>Currently Editing</Text>
//             </View>
//           )}
//         </View>
//       </TouchableOpacity>
//     );
//   };

//   const renderFooter = () => {
//     if (!historyLoading) return null;
    
//     return (
//       <View style={styles.footerLoader}>
//         <ActivityIndicator size="small" color="#3B82F6" />
//         <Text style={styles.loadingText}>Loading more...</Text>
//       </View>
//     );
//   };

//   return (
//     <SafeAreaView   style={{flex:1}}>
//     <KeyboardAvoidingView 
//       style={{ flex: 1 }}
//       behavior={Platform.OS === "ios" ? "padding" : "height"}
//     >
//       <ScrollView 
//         style={styles.container}
//         refreshControl={
//           <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
//         }
//       >
//         {/* Header with Back Button */}
//         <View style={styles.topHeader}>
//           <TouchableOpacity 
//             onPress={() => navigation.goBack()}
//             style={styles.backButton}
//             activeOpacity={0.8}
//           >
//             <Icon name="arrow-back" size={28} color="#333" />
//           </TouchableOpacity>
//           <View style={styles.headerTitleContainer}>
//             <Text style={styles.title}>Travel Tracker</Text>
//             <Text style={styles.subtitle}>User ID: {userId}</Text>
//           </View>
//           <View style={styles.headerRight} />
//         </View>

//         {/* Stats Overview */}
//         {stats && (
//           <View style={styles.statsContainer}>
//             <View style={styles.statsRow}>
//               <View style={styles.statCard}>
//                 <Icon name="today" size={24} color="#3B82F6" />
//                 <Text style={styles.statValue}>{stats.todayDistance.toFixed(1)}</Text>
//                 <Text style={styles.statLabel}>Today</Text>
//               </View>
//               <View style={styles.statCard}>
//                 <Icon name="date-range" size={24} color="#8B5CF6" />
//                 <Text style={styles.statValue}>{stats.weekDistance.toFixed(1)}</Text>
//                 <Text style={styles.statLabel}>This Week</Text>
//               </View>
//               <View style={styles.statCard}>
//                 <Icon name="show-chart" size={24} color="#059669" />
//                 <Text style={styles.statValue}>{stats.totalDistance.toFixed(1)}</Text>
//                 <Text style={styles.statLabel}>Total</Text>
//               </View>
//             </View>
//           </View>
//         )}

//         {/* Today's Travel Card */}
//         <View style={styles.card}>
//           <View style={styles.cardHeader}>
//             <Text style={styles.cardTitle}>
//               <Icon name="today" size={22} color="#3B82F6" /> Today's Travel
//             </Text>
//             <View style={styles.headerButtons}>
//               <TouchableOpacity 
//                 style={styles.iconButton}
//                 onPress={() => setShowHistory(true)}
//               >
//                 <Icon name="history" size={22} color="#6B7280" />
//                 <Text style={styles.iconButtonText}>History</Text>
//               </TouchableOpacity>
//               <TouchableOpacity 
//                 style={styles.iconButton}
//                 onPress={onRefresh}
//               >
//                 <Icon name="refresh" size={22} color="#6B7280" />
//                 <Text style={styles.iconButtonText}>Refresh</Text>
//               </TouchableOpacity>
//             </View>
//           </View>
          
//           {fetching ? (
//             <ActivityIndicator size="large" color="#3B82F6" style={{ marginVertical: 20 }} />
//           ) : (
//             <>
//               <View style={styles.todayInfo}>
//                 <Text style={styles.dateText}>
//                   {todayTravel?.date ? formatDate(todayTravel.date) : formatDate(new Date())}
//                 </Text>
//                 <View style={styles.distanceContainerMain}>
//                   <Icon name="directions-car" size={36} color="#059669" />
//                   <Text style={styles.distanceText}>
//                     {todayTravel?.distance || 0} km
//                   </Text>
//                 </View>
//                 {todayTravel?.updatedAt && (
//                   <Text style={styles.updatedText}>
//                     Last updated: {formatTime(todayTravel.updatedAt)}
//                   </Text>
//                 )}
//               </View>
              
//               <Text style={styles.note}>
//                 <Icon name="info" size={16} color="#6B7280" />
//                 {" "}You can only edit today's travel. Tap on today's entry in history to edit.
//               </Text>
//             </>
//           )}
//         </View>

//         {/* Input Form */}
//         <View style={styles.card}>
//           <Text style={styles.cardTitle}>
//             <Icon name="edit" size={22} color="#3B82F6" /> 
//             {editMode ? 'Edit Today\'s Distance' : 'Add Today\'s Distance'}
//           </Text>
          
//           <View style={styles.inputContainer}>
//             <Text style={styles.label}>
//               <Icon name="speed" size={18} color="#374151" /> Distance (km)
//             </Text>
//             <TextInput
//               style={styles.input}
//               placeholder="Enter travel distance in km"
//               keyboardType="decimal-pad"
//               value={distance}
//               onChangeText={setDistance}
//               placeholderTextColor="#9CA3AF"
//             />
//           </View>

//           <View style={styles.buttonRow}>
//             {editMode && (
//               <TouchableOpacity
//                 style={[styles.button, styles.cancelButton]}
//                 onPress={cancelEdit}
//               >
//                 <Icon name="close" size={22} color="#FFFFFF" />
//                 <Text style={styles.buttonText}>Cancel</Text>
//               </TouchableOpacity>
//             )}
            
//             <TouchableOpacity
//               style={[
//                 styles.button, 
//                 loading && styles.buttonDisabled,
//                 editMode ? styles.editButton : styles.saveButton
//               ]}
//               onPress={handleSubmit}
//               disabled={loading}
//             >
//               {loading ? (
//                 <ActivityIndicator color="#FFFFFF" />
//               ) : (
//                 <>
//                   <Icon name={editMode ? "save" : "add"} size={22} color="#FFFFFF" />
//                   <Text style={styles.buttonText}>
//                     {editMode ? 'Update' : 'Save'}
//                   </Text>
//                 </>
//               )}
//             </TouchableOpacity>
//           </View>
//         </View>

   

//         {/* History Modal */}
//         <Modal
//           visible={showHistory}
//           animationType="slide"
//           transparent={true}
//           onRequestClose={() => setShowHistory(false)}
//         >
//           <View style={styles.modalContainer}>
//             <View style={styles.modalContent}>
//               <View style={styles.modalHeader}>
//                 <Text style={styles.modalTitle}>
//                   <Icon name="history" size={24} color="#3B82F6" /> Travel History
//                 </Text>
//                 <View style={styles.modalHeaderButtons}>
//                   <TouchableOpacity 
//                     style={styles.iconButton}
//                     onPress={() => setFilterModalVisible(true)}
//                   >
//                     <Icon name="filter-list" size={22} color="#6B7280" />
//                   </TouchableOpacity>
//                   <TouchableOpacity 
//                     onPress={() => setShowHistory(false)}
//                     style={styles.closeButton}
//                   >
//                     <Icon name="close" size={24} color="#6B7280" />
//                   </TouchableOpacity>
//                 </View>
//               </View>

//               {/* Filter Summary */}
//               {(startDate || endDate) && (
//                 <View style={styles.filterSummary}>
//                   <Text style={styles.filterSummaryText}>
//                     Filters:{' '}
//                     {startDate && `From: ${formatDate(startDate)} `}
//                     {endDate && `To: ${formatDate(endDate)}`}
//                   </Text>
//                   <TouchableOpacity onPress={clearFilters}>
//                     <Icon name="clear" size={18} color="#EF4444" />
//                   </TouchableOpacity>
//                 </View>
//               )}

//               {/* Pagination Info */}
//               <View style={styles.paginationInfo}>
//                 <Text style={styles.paginationText}>
//                   Page {currentPage} of {totalPages} • {totalItems} records
//                 </Text>
//                 {editMode && (
//                   <Text style={styles.editingInfo}>
//                     <Icon name="edit" size={14} color="#3B82F6" />
//                     {' '}Editing today's entry
//                   </Text>
//                 )}
//               </View>

//               {historyLoading && travelHistory.length === 0 ? (
//                 <View style={styles.loadingContainer}>
//                   <ActivityIndicator size="large" color="#3B82F6" />
//                   <Text style={styles.loadingText}>Loading history...</Text>
//                 </View>
//               ) : travelHistory.length === 0 ? (
//                 <View style={styles.emptyContainer}>
//                   <Icon name="history-off" size={60} color="#D1D5DB" />
//                   <Text style={styles.emptyText}>No travel history found</Text>
//                   {(startDate || endDate) && (
//                     <TouchableOpacity 
//                       style={styles.clearFilterButton}
//                       onPress={clearFilters}
//                     >
//                       <Text style={styles.clearFilterText}>Clear Filters</Text>
//                     </TouchableOpacity>
//                   )}
//                 </View>
//               ) : (
//                 <FlatList
//                   data={travelHistory}
//                   renderItem={renderHistoryItem}
//                   keyExtractor={(item) => item._id}
//                   showsVerticalScrollIndicator={false}
//                   contentContainerStyle={styles.historyList}
//                   ListFooterComponent={renderFooter}
//                   onEndReached={loadMore}
//                   onEndReachedThreshold={0.5}
//                 />
//               )}

//               <View style={styles.modalFooter}>
//                 <TouchableOpacity 
//                   style={styles.modalCloseBtn}
//                   onPress={() => setShowHistory(false)}
//                 >
//                   <Text style={styles.modalCloseText}>Close History</Text>
//                 </TouchableOpacity>
//               </View>
//             </View>
//           </View>
//         </Modal>

//         {/* Filter Modal */}
//         <Modal
//           visible={filterModalVisible}
//           animationType="slide"
//           transparent={true}
//           onRequestClose={() => setFilterModalVisible(false)}
//         >
//           <View style={styles.modalContainer}>
//             <View style={[styles.modalContent, { height: '50%' }]}>
//               <View style={styles.modalHeader}>
//                 <Text style={styles.modalTitle}>
//                   <Icon name="filter-list" size={24} color="#3B82F6" /> Filter History
//                 </Text>
//                 <TouchableOpacity 
//                   onPress={() => setFilterModalVisible(false)}
//                   style={styles.closeButton}
//                 >
//                   <Icon name="close" size={24} color="#6B7280" />
//                 </TouchableOpacity>
//               </View>

//               <ScrollView style={styles.filterContent}>
//                 {/* Start Date */}
//                 <View style={styles.filterSection}>
//                   <Text style={styles.filterLabel}>
//                     <Icon name="calendar-today" size={18} color="#6B7280" /> Start Date
//                   </Text>
//                   <TouchableOpacity 
//                     style={styles.dateButton}
//                     onPress={() => {
//                       setDatePickerMode('start');
//                       setShowDatePicker(true);
//                     }}
//                   >
//                     <Icon name="event" size={20} color="#6B7280" />
//                     <Text style={styles.dateButtonText}>
//                       {startDate ? formatDate(startDate) : 'Select start date'}
//                     </Text>
//                   </TouchableOpacity>
//                 </View>

//                 {/* End Date */}
//                 <View style={styles.filterSection}>
//                   <Text style={styles.filterLabel}>
//                     <Icon name="calendar-today" size={18} color="#6B7280" /> End Date
//                   </Text>
//                   <TouchableOpacity 
//                     style={styles.dateButton}
//                     onPress={() => {
//                       setDatePickerMode('end');
//                       setShowDatePicker(true);
//                     }}
//                   >
//                     <Icon name="event" size={20} color="#6B7280" />
//                     <Text style={styles.dateButtonText}>
//                       {endDate ? formatDate(endDate) : 'Select end date'}
//                     </Text>
//                   </TouchableOpacity>
//                 </View>

//                 {/* Items Per Page */}
//                 <View style={styles.filterSection}>
//                   <Text style={styles.filterLabel}>
//                     <Icon name="list" size={18} color="#6B7280" /> Items Per Page
//                   </Text>
//                   <View style={styles.pickerContainer}>
//                     <Picker
//                       selectedValue={itemsPerPage}
//                       style={styles.picker}
//                       onValueChange={(itemValue) => setItemsPerPage(itemValue)}
//                     >
//                       <Picker.Item label="10 items" value={10} />
//                       <Picker.Item label="20 items" value={20} />
//                       <Picker.Item label="50 items" value={50} />
//                     </Picker>
//                   </View>
//                 </View>
//               </ScrollView>

//               <View style={styles.filterFooter}>
//                 <TouchableOpacity 
//                   style={[styles.filterButton, styles.clearButton]}
//                   onPress={clearFilters}
//                 >
//                   <Text style={styles.clearButtonText}>Clear All</Text>
//                 </TouchableOpacity>
//                 <TouchableOpacity 
//                   style={[styles.filterButton, styles.applyButton]}
//                   onPress={applyFilters}
//                 >
//                   <Text style={styles.applyButtonText}>Apply Filters</Text>
//                 </TouchableOpacity>
//               </View>
//             </View>
//           </View>
//         </Modal>

//         {/* Date Picker */}
//         {showDatePicker && (
//           <DateTimePicker
//             value={datePickerMode === 'start' && startDate ? startDate : 
//                    datePickerMode === 'end' && endDate ? endDate : new Date()}
//             mode="date"
//             display={Platform.OS === 'ios' ? 'spinner' : 'default'}
//             onChange={handleDatePicker}
//           />
//         )}
//       </ScrollView>
//     </KeyboardAvoidingView>

//     </SafeAreaView>

//   );
// };

// const styles = StyleSheet.create({
//   container: {
//     flex: 1,
//     backgroundColor: '#F3F4F6',
//   },
//   topHeader: {
//     flexDirection: 'row',
//     alignItems: 'center',
//     justifyContent: 'space-between',
//     padding: 16,
//     backgroundColor: '#FFFFFF',
//     borderBottomWidth: 1,
//     borderBottomColor: '#E5E7EB',
//   },
//   backButton: {
//     padding: 8,
//   },
//   headerTitleContainer: {
//     flex: 1,
//     alignItems: 'center',
//   },
//   title: {
//     fontSize: 20,
//     fontWeight: 'bold',
//     color: '#1F2937',
//   },
//   subtitle: {
//     fontSize: 14,
//     color: '#6B7280',
//     marginTop: 4,
//   },
//   headerRight: {
//     width: 40,
//   },
//   statsContainer: {
//     paddingHorizontal: 16,
//     marginTop: 16,
//     marginBottom: 16,
//   },
//   statsRow: {
//     flexDirection: 'row',
//     justifyContent: 'space-between',
//   },
//   statCard: {
//     flex: 1,
//     backgroundColor: '#FFFFFF',
//     borderRadius: 12,
//     padding: 16,
//     marginHorizontal: 4,
//     alignItems: 'center',
//     shadowColor: '#000',
//     shadowOffset: { width: 0, height: 2 },
//     shadowOpacity: 0.1,
//     shadowRadius: 4,
//     elevation: 2,
//   },
//   statValue: {
//     fontSize: 20,
//     fontWeight: 'bold',
//     color: '#1F2937',
//     marginVertical: 8,
//   },
//   statLabel: {
//     fontSize: 12,
//     color: '#6B7280',
//   },
//   card: {
//     backgroundColor: '#FFFFFF',
//     borderRadius: 16,
//     padding: 20,
//     marginHorizontal: 16,
//     marginBottom: 16,
//     shadowColor: '#000',
//     shadowOffset: { width: 0, height: 4 },
//     shadowOpacity: 0.1,
//     shadowRadius: 8,
//     elevation: 5,
//   },
//   cardHeader: {
//     flexDirection: 'row',
//     justifyContent: 'space-between',
//     alignItems: 'center',
//     marginBottom: 16,
//   },
//   cardTitle: {
//     fontSize: 18,
//     fontWeight: '600',
//     color: '#1F2937',
//     flexDirection: 'row',
//     alignItems: 'center',
//     gap: 8,
//   },
//   headerButtons: {
//     flexDirection: 'row',
//     gap: 12,
//     alignItems: 'center',
//   },
//   iconButton: {
//     alignItems: 'center',
//     padding: 4,
//   },
//   iconButtonText: {
//     fontSize: 10,
//     color: '#6B7280',
//     marginTop: 2,
//   },
//   todayInfo: {
//     backgroundColor: '#F0F9FF',
//     padding: 20,
//     borderRadius: 12,
//     alignItems: 'center',
//     marginBottom: 12,
//   },
//   dateText: {
//     fontSize: 16,
//     color: '#374151',
//     marginBottom: 12,
//     fontWeight: '500',
//   },
//   distanceContainerMain: {
//     flexDirection: 'row',
//     alignItems: 'center',
//     gap: 12,
//     marginBottom: 8,
//   },
//   distanceText: {
//     fontSize: 36,
//     fontWeight: 'bold',
//     color: '#059669',
//   },
//   updatedText: {
//     fontSize: 14,
//     color: '#6B7280',
//     fontStyle: 'italic',
//   },
//   note: {
//     fontSize: 14,
//     color: '#6B7280',
//     lineHeight: 20,
//     fontStyle: 'italic',
//   },
//   inputContainer: {
//     marginBottom: 20,
//   },
//   label: {
//     fontSize: 16,
//     color: '#374151',
//     marginBottom: 8,
//     fontWeight: '500',
//     flexDirection: 'row',
//     alignItems: 'center',
//     gap: 8,
//   },
//   input: {
//     borderWidth: 1,
//     borderColor: '#D1D5DB',
//     borderRadius: 12,
//     padding: 16,
//     fontSize: 16,
//     backgroundColor: '#F9FAFB',
//     color: '#1F2937',
//   },
//   buttonRow: {
//     flexDirection: 'row',
//     gap: 12,
//   },
//   button: {
//     flex: 1,
//     borderRadius: 12,
//     padding: 16,
//     alignItems: 'center',
//     flexDirection: 'row',
//     justifyContent: 'center',
//     gap: 8,
//   },
//   saveButton: {
//     backgroundColor: '#3B82F6',
//   },
//   editButton: {
//     backgroundColor: '#059669',
//   },
//   cancelButton: {
//     backgroundColor: '#EF4444',
//   },
//   buttonDisabled: {
//     backgroundColor: '#93C5FD',
//   },
//   buttonText: {
//     color: '#FFFFFF',
//     fontSize: 16,
//     fontWeight: '600',
//   },
//   quickActions: {
//     flexDirection: 'row',
//     justifyContent: 'space-around',
//     marginTop: 8,
//   },
//   quickAction: {
//     alignItems: 'center',
//     padding: 12,
//     flex: 1,
//   },
//   quickActionText: {
//     fontSize: 12,
//     color: '#374151',
//     marginTop: 4,
//   },
//   disabledText: {
//     color: '#9CA3AF',
//   },
//   // Modal Styles
//   modalContainer: {
//     flex: 1,
//     backgroundColor: 'rgba(0, 0, 0, 0.5)',
//     justifyContent: 'flex-end',
//   },
//   modalContent: {
//     backgroundColor: '#FFFFFF',
//     borderTopLeftRadius: 24,
//     borderTopRightRadius: 24,
//     maxHeight: '90%',
//   },
//   modalHeader: {
//     flexDirection: 'row',
//     justifyContent: 'space-between',
//     alignItems: 'center',
//     padding: 20,
//     borderBottomWidth: 1,
//     borderBottomColor: '#E5E7EB',
//   },
//   modalHeaderButtons: {
//     flexDirection: 'row',
//     alignItems: 'center',
//     gap: 12,
//   },
//   modalTitle: {
//     fontSize: 20,
//     fontWeight: 'bold',
//     color: '#1F2937',
//     flexDirection: 'row',
//     alignItems: 'center',
//     gap: 8,
//   },
//   closeButton: {
//     padding: 4,
//   },
//   filterSummary: {
//     flexDirection: 'row',
//     justifyContent: 'space-between',
//     alignItems: 'center',
//     padding: 12,
//     backgroundColor: '#FEF3C7',
//     marginHorizontal: 16,
//     marginTop: 8,
//     borderRadius: 8,
//   },
//   filterSummaryText: {
//     fontSize: 14,
//     color: '#92400E',
//     flex: 1,
//   },
//   paginationInfo: {
//     padding: 12,
//     alignItems: 'center',
//     borderBottomWidth: 1,
//     borderBottomColor: '#E5E7EB',
//   },
//   paginationText: {
//     fontSize: 14,
//     color: '#6B7280',
//   },
//   editingInfo: {
//     fontSize: 14,
//     color: '#3B82F6',
//     marginTop: 4,
//     flexDirection: 'row',
//     alignItems: 'center',
//   },
//   loadingContainer: {
//     padding: 40,
//     alignItems: 'center',
//     gap: 16,
//   },
//   loadingText: {
//     fontSize: 16,
//     color: '#6B7280',
//   },
//   emptyContainer: {
//     padding: 40,
//     alignItems: 'center',
//     gap: 16,
//   },
//   emptyText: {
//     fontSize: 16,
//     color: '#9CA3AF',
//   },
//   clearFilterButton: {
//     backgroundColor: '#EF4444',
//     paddingHorizontal: 20,
//     paddingVertical: 10,
//     borderRadius: 8,
//     marginTop: 8,
//   },
//   clearFilterText: {
//     color: '#FFFFFF',
//     fontSize: 14,
//     fontWeight: '600',
//   },
//   historyList: {
//     padding: 16,
//   },
//   historyItem: {
//     backgroundColor: '#F9FAFB',
//     borderRadius: 12,
//     padding: 16,
//     marginBottom: 12,
//     borderWidth: 1,
//     borderColor: '#E5E7EB',
//   },
//   todayHistoryItem: {
//     backgroundColor: '#F0F9FF',
//     borderColor: '#93C5FD',
//   },
//   selectedHistoryItem: {
//     borderColor: '#3B82F6',
//     borderWidth: 2,
//     backgroundColor: '#EFF6FF',
//   },
//   historyHeader: {
//     flexDirection: 'row',
//     justifyContent: 'space-between',
//     alignItems: 'flex-start',
//     marginBottom: 12,
//   },
//   dateContainer: {
//     flexDirection: 'row',
//     alignItems: 'flex-start',
//     gap: 8,
//     flex: 1,
//   },
//   historyDate: {
//     fontSize: 16,
//     color: '#374151',
//     fontWeight: '500',
//   },
//   historyDateSmall: {
//     fontSize: 12,
//     color: '#6B7280',
//     marginTop: 2,
//   },
//   todayText: {
//     color: '#3B82F6',
//     fontWeight: '600',
//   },
//   editBadge: {
//     backgroundColor: '#059669',
//     flexDirection: 'row',
//     alignItems: 'center',
//     gap: 4,
//     paddingHorizontal: 10,
//     paddingVertical: 6,
//     borderRadius: 12,
//   },
//   editBadgeText: {
//     fontSize: 12,
//     color: '#FFFFFF',
//     fontWeight: '600',
//   },
//   readOnlyBadge: {
//     backgroundColor: '#6B7280',
//     flexDirection: 'row',
//     alignItems: 'center',
//     gap: 4,
//     paddingHorizontal: 10,
//     paddingVertical: 6,
//     borderRadius: 12,
//   },
//   readOnlyBadgeText: {
//     fontSize: 12,
//     color: '#FFFFFF',
//     fontWeight: '600',
//   },
//   historyContent: {
//     marginBottom: 8,
//   },
//   distanceContainer: {
//     flexDirection: 'row',
//     alignItems: 'center',
//     gap: 10,
//     marginBottom: 8,
//   },
//   historyDistance: {
//     fontSize: 24,
//     fontWeight: 'bold',
//     color: '#059669',
//   },
//   editingIndicator: {
//     flexDirection: 'row',
//     alignItems: 'center',
//     gap: 6,
//     backgroundColor: '#DBEAFE',
//     paddingHorizontal: 10,
//     paddingVertical: 6,
//     borderRadius: 8,
//     alignSelf: 'flex-start',
//     marginTop: 8,
//   },
//   editingText: {
//     fontSize: 12,
//     color: '#1E40AF',
//     fontWeight: '600',
//   },
//   footerLoader: {
//     padding: 20,
//     alignItems: 'center',
//   },
//   modalFooter: {
//     padding: 20,
//     borderTopWidth: 1,
//     borderTopColor: '#E5E7EB',
//   },
//   modalCloseBtn: {
//     backgroundColor: '#3B82F6',
//     borderRadius: 12,
//     padding: 16,
//     alignItems: 'center',
//   },
//   modalCloseText: {
//     color: '#FFFFFF',
//     fontSize: 16,
//     fontWeight: '600',
//   },
//   // Filter Modal Styles
//   filterContent: {
//     padding: 20,
//   },
//   filterSection: {
//     marginBottom: 24,
//   },
//   filterLabel: {
//     fontSize: 16,
//     fontWeight: '600',
//     color: '#374151',
//     marginBottom: 8,
//     flexDirection: 'row',
//     alignItems: 'center',
//     gap: 8,
//   },
//   dateButton: {
//     flexDirection: 'row',
//     alignItems: 'center',
//     gap: 10,
//     borderWidth: 1,
//     borderColor: '#D1D5DB',
//     borderRadius: 8,
//     padding: 14,
//     backgroundColor: '#F9FAFB',
//   },
//   dateButtonText: {
//     fontSize: 16,
//     color: '#374151',
//     flex: 1,
//   },
//   pickerContainer: {
//     borderWidth: 1,
//     borderColor: '#D1D5DB',
//     borderRadius: 8,
//     overflow: 'hidden',
//   },
//   picker: {
//     height: 50,
//     width: '100%',
//     backgroundColor: '#F9FAFB',
//   },
//   filterFooter: {
//     flexDirection: 'row',
//     padding: 20,
//     borderTopWidth: 1,
//     borderTopColor: '#E5E7EB',
//     gap: 12,
//   },
//   filterButton: {
//     flex: 1,
//     padding: 16,
//     borderRadius: 8,
//     alignItems: 'center',
//   },
//   clearButton: {
//     backgroundColor: '#F3F4F6',
//   },
//   clearButtonText: {
//     color: '#374151',
//     fontSize: 16,
//     fontWeight: '600',
//   },
//   applyButton: {
//     backgroundColor: '#3B82F6',
//   },
//   applyButtonText: {
//     color: '#FFFFFF',
//     fontSize: 16,
//     fontWeight: '600',
//   },
// });

// export default TravelScreen;






import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ScrollView,
  ActivityIndicator,
  FlatList,
  Modal,
  RefreshControl,
  Dimensions,
  KeyboardAvoidingView,
  Platform
} from 'react-native';
import axios from 'axios';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { useNavigation } from '@react-navigation/native';
import { SafeAreaView } from 'react-native-safe-area-context';

const { width } = Dimensions.get('window');

const TravelScreen = ({ route }) => {
  const navigation = useNavigation();
  const { userId } = route.params || { userId: 'user123' };
  
  const [distanceIn, setDistanceIn] = useState('');
  const [distanceOut, setDistanceOut] = useState('');
  const [notes, setNotes] = useState('');
  const [todayTravel, setTodayTravel] = useState(null);
  const [monthlySummary, setMonthlySummary] = useState(null);
  const [userStats, setUserStats] = useState(null);
  const [loadingIn, setLoadingIn] = useState(false);
  const [loadingOut, setLoadingOut] = useState(false);
  const [fetching, setFetching] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [showMonthlyModal, setShowMonthlyModal] = useState(false);
  const [showHistoryModal, setShowHistoryModal] = useState(false);
  const [showStatsModal, setShowStatsModal] = useState(false);
  const [travelHistory, setTravelHistory] = useState([]);
  const [historyLoading, setHistoryLoading] = useState(false);
  
  const API_URL = '/v1/travel';

  // Fetch initial data
  useEffect(() => {
    fetchTodayTravel();
    fetchMonthlySummary();
    fetchUserStats();
  }, []);

  const fetchTodayTravel = async () => {
    try {
      setFetching(true);
      const response = await axios.get(`${API_URL}/today/${userId}`);
      
      if (response.data.success) {
        const data = response.data.data;
        setTodayTravel(data);
        if (data.inEntered) {
          setDistanceIn(data.distanceIn.toString());
        }
        if (data.outEntered) {
          setDistanceOut(data.distanceOut.toString());
        }
        if (data.notes) {
          setNotes(data.notes);
        }
      }
    } catch (error) {
      console.error('Error fetching travel:', error);
      Alert.alert('Error', 'Failed to load today\'s travel');
    } finally {
      setFetching(false);
    }
  };

  const fetchMonthlySummary = async () => {
    try {
      const response = await axios.get(`${API_URL}/monthly-summary/${userId}`);
      if (response.data.success) {
        setMonthlySummary(response.data);
      }
    } catch (error) {
      console.error('Error fetching monthly summary:', error);
    }
  };

  const fetchUserStats = async () => {
    try {
      const response = await axios.get(`${API_URL}/user-stats/${userId}`);
      if (response.data.success) {
        setUserStats(response.data.stats);
      }
    } catch (error) {
      console.error('Error fetching user stats:', error);
    }
  };

  const fetchTravelHistory = async () => {
    try {
      setHistoryLoading(true);
      const response = await axios.get(`${API_URL}/user-history/${userId}?limit=50`);
      if (response.data.success) {
        setTravelHistory(response.data.data);
      }
    } catch (error) {
      console.error('Error fetching history:', error);
    } finally {
      setHistoryLoading(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await Promise.all([
      fetchTodayTravel(),
      fetchMonthlySummary(),
      fetchUserStats()
    ]);
    setRefreshing(false);
  };

  const handleSubmit = async (type) => {
    const distance = type === 'in' ? distanceIn : distanceOut;
    
    if (!distance || parseFloat(distance) < 0) {
      Alert.alert('Error', 'Please enter valid distance (0 or greater)');
      return;
    }

    if (type === 'in') setLoadingIn(true);
    else setLoadingOut(true);

    try {
      const response = await axios.post(`${API_URL}/add-distance`, {
        userId,
        distance: parseFloat(distance),
        type,
        notes: notes.trim()
      });

      if (response.data.success) {
        Alert.alert('Success', response.data.message);
        if (type === 'in') {
          setDistanceIn('');
        } else {
          setDistanceOut('');
        }
        onRefresh();
      }
    } catch (error) {
      const errorMessage = error.response?.data?.message || 'Failed to save distance';
      Alert.alert('Error', errorMessage);
    } finally {
      if (type === 'in') setLoadingIn(false);
      else setLoadingOut(false);
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-IN', {
      day: '2-digit',
      month: 'short',
      year: 'numeric'
    });
  };

  const formatDay = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.getDate();
  };

  const calculateTotalTravel = (inDist, outDist) => {
    const inNum = parseFloat(inDist) || 0;
    const outNum = parseFloat(outDist) || 0;
    return Math.max(0, outNum - inNum);
  };

  const renderTodayCard = () => {
    const totalToday = todayTravel ? calculateTotalTravel(todayTravel.distanceIn, todayTravel.distanceOut) : 0;
    const netDistance = (todayTravel?.distanceOut || 0) - (todayTravel?.distanceIn || 0);
    
    return (
      <View style={styles.card}>
        <View style={styles.cardHeader}>
          <Text style={styles.cardTitle}>
            <Icon name="today" size={22} color="#3B82F6" /> Today's Travel
          </Text>
          <Text style={styles.dateText}>
            {new Date().toLocaleDateString('en-IN', {
              weekday: 'long',
              day: 'numeric',
              month: 'long',
              year: 'numeric'
            })}
          </Text>
        </View>

        <View style={styles.todayGrid}>
          {/* Distance In - Starting Point */}
          <View style={[
            styles.distanceCard,
            todayTravel?.inEntered && styles.enteredCard
          ]}>
            <View style={styles.distanceHeader}>
              <Icon 
                name="home" 
                size={24} 
                color={todayTravel?.inEntered ? "#059669" : "#6B7280"} 
              />
              <Text style={[
                styles.distanceTitle,
                todayTravel?.inEntered && styles.enteredTitle
              ]}>
                Starting Point (In)
              </Text>
            </View>
            
            {todayTravel?.inEntered ? (
              <View style={styles.distanceValueContainer}>
                <Text style={styles.distanceValue}>
                  {todayTravel.distanceIn} km
                </Text>
                <View style={styles.enteredBadge}>
                  <Icon name="check-circle" size={16} color="#059669" />
                  <Text style={styles.enteredText}>Recorded</Text>
                </View>
              </View>
            ) : (
              <>
                <TextInput
                  style={styles.distanceInput}
                  placeholder="Enter starting km reading"
                  keyboardType="decimal-pad"
                  value={distanceIn}
                  onChangeText={setDistanceIn}
                  placeholderTextColor="#9CA3AF"
                  editable={!todayTravel?.inEntered}
                />
                <TouchableOpacity
                  style={[
                    styles.addButton,
                    loadingIn && styles.buttonDisabled
                  ]}
                  onPress={() => handleSubmit('in')}
                  disabled={loadingIn || todayTravel?.inEntered}
                >
                  {loadingIn ? (
                    <ActivityIndicator color="#FFFFFF" />
                  ) : (
                    <>
                      <Icon name="add" size={20} color="#FFFFFF" />
                      <Text style={styles.addButtonText}>Add Start</Text>
                    </>
                  )}
                </TouchableOpacity>
              </>
            )}
          </View>

          {/* Distance Out - Ending Point */}
          <View style={[
            styles.distanceCard,
            todayTravel?.outEntered && styles.enteredCard
          ]}>
            <View style={styles.distanceHeader}>
              <Icon 
                name="location-on" 
                size={24} 
                color={todayTravel?.outEntered ? "#EF4444" : "#6B7280"} 
              />
              <Text style={[
                styles.distanceTitle,
                todayTravel?.outEntered && styles.enteredTitle
              ]}>
                Ending Point (Out)
              </Text>
            </View>
            
            {todayTravel?.outEntered ? (
              <View style={styles.distanceValueContainer}>
                <Text style={styles.distanceValue}>
                  {todayTravel.distanceOut} km
                </Text>
                <View style={[styles.enteredBadge, styles.outBadge]}>
                  <Icon name="check-circle" size={16} color="#EF4444" />
                  <Text style={styles.enteredText}>Recorded</Text>
                </View>
              </View>
            ) : (
              <>
                <TextInput
                  style={styles.distanceInput}
                  placeholder="Enter ending km reading"
                  keyboardType="decimal-pad"
                  value={distanceOut}
                  onChangeText={setDistanceOut}
                  placeholderTextColor="#9CA3AF"
                  editable={!todayTravel?.outEntered}
                />
                <TouchableOpacity
                  style={[
                    styles.addButton,
                    loadingOut && styles.buttonDisabled
                  ]}
                  onPress={() => handleSubmit('out')}
                  disabled={loadingOut || todayTravel?.outEntered}
                >
                  {loadingOut ? (
                    <ActivityIndicator color="#FFFFFF" />
                  ) : (
                    <>
                      <Icon name="add" size={20} color="#FFFFFF" />
                      <Text style={styles.addButtonText}>Add End</Text>
                    </>
                  )}
                </TouchableOpacity>
              </>
            )}
          </View>
        </View>

        {/* Notes Input */}
        <View style={styles.notesContainer}>
          <Text style={styles.notesLabel}>
            <Icon name="notes" size={18} color="#6B7280" /> Notes (Optional)
          </Text>
          <TextInput
            style={styles.notesInput}
            placeholder="Add any notes about today's travel..."
            value={notes}
            onChangeText={setNotes}
            placeholderTextColor="#9CA3AF"
            multiline
            numberOfLines={3}
            maxLength={500}
          />
        </View>

        {/* Today's Travel Calculation */}
        <View style={styles.calculationCard}>
          <View style={styles.calculationHeader}>
            <Icon name="calculate" size={28} color="#8B5CF6" />
            <View>
              <Text style={styles.calculationTitle}>Today's Travel Calculation</Text>
              <Text style={styles.calculationFormula}>End - Start = Total Travel</Text>
            </View>
          </View>
          
          <View style={styles.calculationDetails}>
            <View style={styles.calculationRow}>
              <Text style={styles.calculationLabel}>Ending Point:</Text>
              <Text style={styles.calculationValue}>{todayTravel?.distanceOut || 0} km</Text>
            </View>
            <View style={styles.calculationRow}>
              <Text style={styles.calculationLabel}>Starting Point:</Text>
              <Text style={styles.calculationValue}>{todayTravel?.distanceIn || 0} km</Text>
            </View>
            <View style={styles.separator} />
            <View style={styles.calculationRow}>
              <Text style={[styles.calculationLabel, styles.totalLabel]}>Total Travel:</Text>
              <Text style={[styles.calculationValue, styles.totalValue]}>
                {totalToday.toFixed(1)} km
              </Text>
            </View>
            <View style={styles.calculationRow}>
              <Text style={styles.calculationLabel}>Net Distance:</Text>
              <Text style={[
                styles.calculationValue,
                netDistance >= 0 ? styles.positiveNet : styles.negativeNet
              ]}>
                {netDistance.toFixed(1)} km
              </Text>
            </View>
          </View>
          
          {todayTravel?.travelCompleted && (
            <View style={styles.completedBadge}>
              <Icon name="check-circle" size={20} color="#FFFFFF" />
              <Text style={styles.completedText}>Today's travel recorded</Text>
            </View>
          )}
        </View>
      </View>
    );
  };

  const renderMonthlySummary = () => {
    if (!monthlySummary) return null;
    
    const { summary } = monthlySummary;
    const netDistance = summary.netDistance || 0;
    
    return (
      <View style={styles.card}>
        <View style={styles.cardHeader}>
          <View>
            <Text style={styles.cardTitle}>
              <Icon name="date-range" size={22} color="#8B5CF6" /> {summary.monthName} Summary
            </Text>
            <Text style={styles.cardSubtitle}>
              {summary.completedDays} of {summary.totalDaysInMonth} days completed
            </Text>
          </View>
          <TouchableOpacity
            style={styles.viewDetailsButton}
            onPress={() => {
              fetchTravelHistory();
              setShowMonthlyModal(true);
            }}
          >
            <Text style={styles.viewDetailsText}>Details</Text>
            <Icon name="chevron-right" size={20} color="#3B82F6" />
          </TouchableOpacity>
        </View>

        <View style={styles.monthlyStats}>
          <View style={styles.statItem}>
            <Icon name="trending-up" size={24} color="#059669" />
            <Text style={styles.statValue}>{summary.totalTravelDistance.toFixed(1)}</Text>
            <Text style={styles.statLabel}>Total Travel</Text>
          </View>
          <View style={styles.statItem}>
            <Icon name="show-chart" size={24} color="#3B82F6" />
            <Text style={styles.statValue}>{summary.averageDailyTravel.toFixed(1)}</Text>
            <Text style={styles.statLabel}>Avg/Day</Text>
          </View>
          <View style={styles.statItem}>
            <Icon name="percent" size={24} color="#8B5CF6" />
            <Text style={styles.statValue}>{summary.completionRate.toFixed(0)}%</Text>
            <Text style={styles.statLabel}>Complete</Text>
          </View>
        </View>

        <View style={styles.monthlyBreakdown}>
          <View style={styles.breakdownItem}>
            <View style={styles.breakdownHeader}>
              <Icon name="home" size={20} color="#059669" />
              <Text style={styles.breakdownTitle}>Total Start</Text>
            </View>
            <Text style={styles.breakdownValue}>{summary.totalIn.toFixed(1)} km</Text>
          </View>
          <View style={styles.breakdownItem}>
            <View style={styles.breakdownHeader}>
              <Icon name="location-on" size={20} color="#EF4444" />
              <Text style={styles.breakdownTitle}>Total End</Text>
            </View>
            <Text style={styles.breakdownValue}>{summary.totalOut.toFixed(1)} km</Text>
          </View>
        </View>

        <View style={styles.netContainer}>
          <Text style={styles.netLabel}>Net Distance (End - Start):</Text>
          <Text style={[
            styles.netValue,
            netDistance >= 0 ? styles.positiveNet : styles.negativeNet
          ]}>
            {netDistance.toFixed(1)} km
          </Text>
        </View>

        {summary.maxTravelDay && (
          <View style={styles.highlightCard}>
            <Icon name="emoji-events" size={20} color="#F59E0B" />
            <Text style={styles.highlightText}>
              Highest travel: {summary.maxTravelDay.distance.toFixed(1)} km on {formatDay(summary.maxTravelDay.date)}th
            </Text>
          </View>
        )}
      </View>
    );
  };

  const renderStatsCard = () => {
    if (!userStats) return null;
    
    return (
      <TouchableOpacity
        style={styles.statsCard}
        onPress={() => setShowStatsModal(true)}
        activeOpacity={0.8}
      >
        <View style={styles.statsHeader}>
          <Icon name="bar-chart" size={24} color="#3B82F6" />
          <Text style={styles.statsTitle}>Quick Stats</Text>
          <Icon name="chevron-right" size={20} color="#6B7280" />
        </View>
        
        <View style={styles.statsGrid}>
          <View style={styles.miniStat}>
            <Text style={styles.miniStatValue}>{userStats.today.total.toFixed(1)}</Text>
            <Text style={styles.miniStatLabel}>Today</Text>
          </View>
          <View style={styles.miniStat}>
            <Text style={styles.miniStatValue}>{userStats.week.total.toFixed(0)}</Text>
            <Text style={styles.miniStatLabel}>This Week</Text>
          </View>
          <View style={styles.miniStat}>
            <Text style={styles.miniStatValue}>{userStats.allTime.total.toFixed(0)}</Text>
            <Text style={styles.miniStatLabel}>All Time</Text>
          </View>
        </View>
      </TouchableOpacity>
    );
  };

  const renderMonthlyModal = () => {
    if (!monthlySummary) return null;
    
    const { summary, dailyData } = monthlySummary;
    
    return (
      <Modal
        visible={showMonthlyModal}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setShowMonthlyModal(false)}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <View>
                <Text style={styles.modalTitle}>{summary.monthName} Details</Text>
                <Text style={styles.modalSubtitle}>
                  Total Travel: {summary.totalTravelDistance.toFixed(1)} km
                </Text>
              </View>
              <TouchableOpacity 
                onPress={() => setShowMonthlyModal(false)}
                style={styles.closeButton}
              >
                <Icon name="close" size={24} color="#6B7280" />
              </TouchableOpacity>
            </View>

            <ScrollView style={styles.modalBody}>
              {/* Summary Stats */}
              <View style={styles.modalStats}>
                <View style={styles.modalStatCard}>
                  <Text style={styles.modalStatValue}>{summary.totalIn.toFixed(1)}</Text>
                  <Text style={styles.modalStatLabel}>Total Start</Text>
                </View>
                <View style={styles.modalStatCard}>
                  <Text style={styles.modalStatValue}>{summary.totalOut.toFixed(1)}</Text>
                  <Text style={styles.modalStatLabel}>Total End</Text>
                </View>
                <View style={styles.modalStatCard}>
                  <Text style={styles.modalStatValue}>{summary.netDistance.toFixed(1)}</Text>
                  <Text style={styles.modalStatLabel}>Net</Text>
                </View>
              </View>

              {/* Daily Breakdown */}
              <Text style={styles.sectionTitle}>Daily Breakdown</Text>
              {dailyData && dailyData.length > 0 ? (
                dailyData.map((travel, index) => (
                  <View key={index} style={[
                    styles.dailyItem,
                    travel.travelCompleted && styles.completedDay
                  ]}>
                    <View style={styles.dailyHeader}>
                      <View style={styles.dayInfo}>
                        <Text style={styles.dayNumber}>{travel.day}</Text>
                        <Text style={styles.dayName}>{travel.dayName}</Text>
                      </View>
                      <Text style={styles.dailyTotal}>{travel.totalDistance.toFixed(1)} km</Text>
                    </View>
                    <View style={styles.dailyDetails}>
                      <View style={styles.dailyDetail}>
                        <Icon name="home" size={14} color="#059669" />
                        <Text style={styles.dailyDetailText}>Start: {travel.distanceIn} km</Text>
                      </View>
                      <View style={styles.dailyDetail}>
                        <Icon name="location-on" size={14} color="#EF4444" />
                        <Text style={styles.dailyDetailText}>End: {travel.distanceOut} km</Text>
                      </View>
                    </View>
                    <View style={styles.dailyCalculation}>
                      <Text style={styles.calculationText}>
                        {travel.distanceOut} - {travel.distanceIn} = {travel.totalDistance} km
                      </Text>
                    </View>
                    {travel.notes ? (
                      <View style={styles.notesBubble}>
                        <Icon name="notes" size={12} color="#6B7280" />
                        <Text style={styles.notesText} numberOfLines={2}>{travel.notes}</Text>
                      </View>
                    ) : null}
                  </View>
                ))
              ) : (
                <View style={styles.emptyContainer}>
                  <Icon name="calendar-today" size={48} color="#D1D5DB" />
                  <Text style={styles.emptyText}>No travel data for this month</Text>
                </View>
              )}

              {/* Navigation Buttons */}
              <View style={styles.modalButtons}>
                <TouchableOpacity
                  style={[styles.modalButton, styles.historyButton]}
                  onPress={() => {
                    setShowMonthlyModal(false);
                    setTimeout(() => {
                      fetchTravelHistory();
                      setShowHistoryModal(true);
                    }, 300);
                  }}
                >
                  <Icon name="history" size={20} color="#FFFFFF" />
                  <Text style={styles.modalButtonText}>Full History</Text>
                </TouchableOpacity>
                
                <TouchableOpacity
                  style={[styles.modalButton, styles.statsButton]}
                  onPress={() => {
                    setShowMonthlyModal(false);
                    setTimeout(() => {
                      setShowStatsModal(true);
                    }, 300);
                  }}
                >
                  <Icon name="bar-chart" size={20} color="#FFFFFF" />
                  <Text style={styles.modalButtonText}>View Stats</Text>
                </TouchableOpacity>
              </View>
            </ScrollView>
          </View>
        </View>
      </Modal>
    );
  };

  const renderHistoryModal = () => {
    return (
      <Modal
        visible={showHistoryModal}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setShowHistoryModal(false)}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Travel History</Text>
              <TouchableOpacity 
                onPress={() => setShowHistoryModal(false)}
                style={styles.closeButton}
              >
                <Icon name="close" size={24} color="#6B7280" />
              </TouchableOpacity>
            </View>

            {historyLoading ? (
              <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color="#3B82F6" />
                <Text style={styles.loadingText}>Loading history...</Text>
              </View>
            ) : travelHistory.length === 0 ? (
              <View style={styles.emptyContainer}>
                <Icon name="history-off" size={48} color="#D1D5DB" />
                <Text style={styles.emptyText}>No travel history found</Text>
              </View>
            ) : (
              <FlatList
                data={travelHistory}
                style={styles.historyList}
                renderItem={({ item }) => {
                  const total = calculateTotalTravel(item.distanceIn, item.distanceOut);
                  const net = (item.distanceOut || 0) - (item.distanceIn || 0);
                  
                  return (
                    <View style={styles.historyItem}>
                      <View style={styles.historyHeader}>
                        <Text style={styles.historyDate}>{formatDate(item.date)}</Text>
                        <Text style={styles.historyTotal}>{total.toFixed(1)} km</Text>
                      </View>
                      <View style={styles.historyDetails}>
                        <View style={styles.historyDetail}>
                          <Icon name="home" size={14} color="#059669" />
                          <Text style={styles.historyDetailText}>Start: {item.distanceIn} km</Text>
                        </View>
                        <View style={styles.historyDetail}>
                          <Icon name="location-on" size={14} color="#EF4444" />
                          <Text style={styles.historyDetailText}>End: {item.distanceOut} km</Text>
                        </View>
                      </View>
                      <View style={styles.historyCalculation}>
                        <Text style={styles.calculationText}>
                          {item.distanceOut} - {item.distanceIn} = {total.toFixed(1)} km
                        </Text>
                        <Text style={[
                          styles.netText,
                          net >= 0 ? styles.positiveNet : styles.negativeNet
                        ]}>
                          Net: {net.toFixed(1)} km
                        </Text>
                      </View>
                      {item.notes ? (
                        <View style={styles.historyNotes}>
                          <Icon name="notes" size={12} color="#6B7280" />
                          <Text style={styles.historyNotesText} numberOfLines={2}>
                            {item.notes}
                          </Text>
                        </View>
                      ) : null}
                    </View>
                  );
                }}
                keyExtractor={(item) => item._id}
                showsVerticalScrollIndicator={false}
              />
            )}
          </View>
        </View>
      </Modal>
    );
  };

  const renderStatsModal = () => {
    if (!userStats) return null;
    
    return (
      <Modal
        visible={showStatsModal}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setShowStatsModal(false)}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Travel Statistics</Text>
              <TouchableOpacity 
                onPress={() => setShowStatsModal(false)}
                style={styles.closeButton}
              >
                <Icon name="close" size={24} color="#6B7280" />
              </TouchableOpacity>
            </View>

            <ScrollView style={styles.modalBody}>
              {/* Today */}
              <View style={styles.statsSection}>
                <Text style={styles.sectionTitle}>
                  <Icon name="today" size={18} color="#3B82F6" /> Today
                </Text>
                <View style={styles.statsGridLarge}>
                  <View style={styles.statsCardLarge}>
                    <Text style={styles.statsValueLarge}>{userStats.today.total.toFixed(1)}</Text>
                    <Text style={styles.statsLabelLarge}>Total Travel</Text>
                  </View>
                  <View style={styles.statsCardLarge}>
                    <Text style={styles.statsValueLarge}>{userStats.today.in}</Text>
                    <Text style={styles.statsLabelLarge}>Start</Text>
                  </View>
                  <View style={styles.statsCardLarge}>
                    <Text style={styles.statsValueLarge}>{userStats.today.out}</Text>
                    <Text style={styles.statsLabelLarge}>End</Text>
                  </View>
                </View>
              </View>

              {/* This Week */}
              <View style={styles.statsSection}>
                <Text style={styles.sectionTitle}>
                  <Icon name="date-range" size={18} color="#8B5CF6" /> This Week
                </Text>
                <View style={styles.statsRow}>
                  <View style={styles.statsItem}>
                    <Text style={styles.statsValue}>{userStats.week.total.toFixed(1)}</Text>
                    <Text style={styles.statsLabel}>Total Travel</Text>
                  </View>
                  <View style={styles.statsItem}>
                    <Text style={styles.statsValue}>{userStats.week.daysCompleted}</Text>
                    <Text style={styles.statsLabel}>Days</Text>
                  </View>
                  <View style={styles.statsItem}>
                    <Text style={styles.statsValue}>{userStats.week.averageDaily.toFixed(1)}</Text>
                    <Text style={styles.statsLabel}>Avg/Day</Text>
                  </View>
                </View>
                <View style={styles.breakdownRow}>
                  <Text style={styles.breakdownText}>Start: {userStats.week.in.toFixed(1)} km</Text>
                  <Text style={styles.breakdownText}>End: {userStats.week.out.toFixed(1)} km</Text>
                </View>
              </View>

              {/* All Time */}
              <View style={styles.statsSection}>
                <Text style={styles.sectionTitle}>
                  <Icon name="all-inclusive" size={18} color="#059669" /> All Time
                </Text>
                <View style={styles.statsGrid}>
                  <View style={styles.statsItem}>
                    <Text style={styles.statsValue}>{userStats.allTime.total.toFixed(0)}</Text>
                    <Text style={styles.statsLabel}>Total km</Text>
                  </View>
                  <View style={styles.statsItem}>
                    <Text style={styles.statsValue}>{userStats.allTime.daysCompleted}</Text>
                    <Text style={styles.statsLabel}>Days</Text>
                  </View>
                  <View style={styles.statsItem}>
                    <Text style={styles.statsValue}>{userStats.allTime.averagePerDay.toFixed(1)}</Text>
                    <Text style={styles.statsLabel}>Avg/Day</Text>
                  </View>
                </View>
                <View style={styles.netSummary}>
                  <Text style={styles.netLabel}>Net Distance (All Time):</Text>
                  <Text style={[
                    styles.netValue,
                    userStats.allTime.net >= 0 ? styles.positiveNet : styles.negativeNet
                  ]}>
                    {userStats.allTime.net.toFixed(1)} km
                  </Text>
                </View>
              </View>

              {/* Completion Stats */}
              <View style={styles.statsSection}>
                <Text style={styles.sectionTitle}>
                  <Icon name="check-circle" size={18} color="#F59E0B" /> Completion
                </Text>
                <View style={styles.completionStats}>
                  <View style={styles.completionItem}>
                    <Text style={styles.completionValue}>{userStats.allTime.daysCompleted}</Text>
                    <Text style={styles.completionLabel}>Days Completed</Text>
                  </View>
                  <View style={styles.completionItem}>
                    <Text style={styles.completionValue}>{userStats.allTime.totalEntries}</Text>
                    <Text style={styles.completionLabel}>Total Entries</Text>
                  </View>
                  <View style={styles.completionItem}>
                    <Text style={styles.completionValue}>
                      {((userStats.allTime.daysCompleted / userStats.allTime.totalEntries) * 100).toFixed(0)}%
                    </Text>
                    <Text style={styles.completionLabel}>Completion Rate</Text>
                  </View>
                </View>
              </View>
            </ScrollView>
          </View>
        </View>
      </Modal>
    );
  };

  return (
    <SafeAreaView style={{flex: 1}}>
      <KeyboardAvoidingView 
        style={{ flex: 1 }}
        behavior={Platform.OS === "ios" ? "padding" : "height"}
      >
        <ScrollView 
          style={styles.container}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
          }
        >
          {/* Header */}
          <View style={styles.topHeader}>
            <TouchableOpacity 
              onPress={() => navigation.goBack()}
              style={styles.backButton}
              activeOpacity={0.8}
            >
              <Icon name="arrow-back" size={28} color="#333" />
            </TouchableOpacity>
            <View style={styles.headerTitleContainer}>
              <Text style={styles.title}>Travel Tracker</Text>
              <Text style={styles.subtitle}>Track your daily travel</Text>
            </View>
            <TouchableOpacity 
              style={styles.refreshButton}
              onPress={onRefresh}
              activeOpacity={0.8}
            >
              <Icon name="refresh" size={24} color="#3B82F6" />
            </TouchableOpacity>
          </View>

          {/* Today's Travel */}
          {renderTodayCard()}

          {/* Stats Card */}
          {renderStatsCard()}

          {/* Monthly Summary */}
          {renderMonthlySummary()}

          {/* Info Card */}
          <View style={styles.infoCard}>
            <Icon name="info" size={24} color="#6B7280" />
            <View style={styles.infoContent}>
              <Text style={styles.infoTitle}>How to use:</Text>
              <Text style={styles.infoText}>1. Enter Starting Point (In) once per day</Text>
              <Text style={styles.infoText}>2. Enter Ending Point (Out) once per day</Text>
              <Text style={styles.infoText}>3. Total Travel = Ending - Starting</Text>
              <Text style={styles.infoText}>4. View monthly summary and statistics</Text>
              <Text style={styles.infoText}>5. All data is read-only after entry</Text>
            </View>
          </View>

          {/* Action Buttons */}
          <View style={styles.actionButtons}>
            <TouchableOpacity
              style={styles.actionButton}
              onPress={() => {
                fetchTravelHistory();
                setShowHistoryModal(true);
              }}
            >
              <Icon name="history" size={20} color="#FFFFFF" />
              <Text style={styles.actionButtonText}>History</Text>
            </TouchableOpacity>
            
            <TouchableOpacity
              style={[styles.actionButton, styles.statsAction]}
              onPress={() => setShowStatsModal(true)}
            >
              <Icon name="bar-chart" size={20} color="#FFFFFF" />
              <Text style={styles.actionButtonText}>Stats</Text>
            </TouchableOpacity>
          </View>

          {/* Modals */}
          {renderMonthlyModal()}
          {renderHistoryModal()}
          {renderStatsModal()}
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F3F4F6',
  },
  topHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  backButton: {
    padding: 8,
  },
  headerTitleContainer: {
    flex: 1,
    alignItems: 'center',
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1F2937',
  },
  subtitle: {
    fontSize: 14,
    color: '#6B7280',
    marginTop: 4,
  },
  refreshButton: {
    padding: 8,
  },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 20,
    marginHorizontal: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 5,
  },
  cardHeader: {
    marginBottom: 16,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1F2937',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  cardSubtitle: {
    fontSize: 14,
    color: '#6B7280',
    marginTop: 4,
  },
  dateText: {
    fontSize: 14,
    color: '#6B7280',
    marginTop: 4,
  },
  todayGrid: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 16,
  },
  distanceCard: {
    flex: 1,
    backgroundColor: '#F9FAFB',
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  enteredCard: {
    backgroundColor: '#F0F9FF',
    borderColor: '#93C5FD',
  },
  distanceHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 12,
  },
  distanceTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#6B7280',
  },
  enteredTitle: {
    color: '#1F2937',
  },
  distanceValueContainer: {
    alignItems: 'center',
  },
  distanceValue: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#059669',
    marginBottom: 8,
  },
  enteredBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#D1FAE5',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  outBadge: {
    backgroundColor: '#FEE2E2',
  },
  enteredText: {
    fontSize: 12,
    color: '#059669',
    fontWeight: '600',
  },
  distanceInput: {
    borderWidth: 1,
    borderColor: '#D1D5DB',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    backgroundColor: '#FFFFFF',
    color: '#1F2937',
    marginBottom: 12,
  },
  addButton: {
    backgroundColor: '#3B82F6',
    borderRadius: 8,
    padding: 12,
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 8,
  },
  buttonDisabled: {
    backgroundColor: '#93C5FD',
  },
  addButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
  },
  notesContainer: {
    marginBottom: 16,
  },
  notesLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#6B7280',
    marginBottom: 8,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  notesInput: {
    borderWidth: 1,
    borderColor: '#D1D5DB',
    borderRadius: 8,
    padding: 12,
    fontSize: 14,
    backgroundColor: '#FFFFFF',
    color: '#1F2937',
    textAlignVertical: 'top',
    minHeight: 80,
  },
  calculationCard: {
    backgroundColor: '#F8FAFC',
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  calculationHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 16,
  },
  calculationTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1F2937',
  },
  calculationFormula: {
    fontSize: 12,
    color: '#6B7280',
    marginTop: 2,
  },
  calculationDetails: {
    backgroundColor: '#FFFFFF',
    borderRadius: 8,
    padding: 12,
  },
  calculationRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  calculationLabel: {
    fontSize: 14,
    color: '#6B7280',
  },
  totalLabel: {
    fontWeight: '600',
    color: '#1F2937',
  },
  calculationValue: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1F2937',
  },
  totalValue: {
    fontSize: 20,
    color: '#8B5CF6',
  },
  positiveNet: {
    color: '#059669',
  },
  negativeNet: {
    color: '#EF4444',
  },
  separator: {
    height: 1,
    backgroundColor: '#E5E7EB',
    marginVertical: 8,
  },
  completedBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: '#059669',
    alignSelf: 'flex-start',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    marginTop: 12,
  },
  completedText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '600',
  },
  viewDetailsButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  viewDetailsText: {
    fontSize: 14,
    color: '#3B82F6',
    fontWeight: '600',
  },
  monthlyStats: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  statItem: {
    alignItems: 'center',
    flex: 1,
  },
  statValue: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1F2937',
    marginVertical: 4,
  },
  statLabel: {
    fontSize: 12,
    color: '#6B7280',
  },
  monthlyBreakdown: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 12,
  },
  breakdownItem: {
    flex: 1,
    backgroundColor: '#F9FAFB',
    borderRadius: 8,
    padding: 12,
  },
  breakdownHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 8,
  },
  breakdownTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#6B7280',
  },
  breakdownValue: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1F2937',
  },
  netContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#F3F4F6',
    padding: 12,
    borderRadius: 8,
    marginTop: 12,
  },
  netLabel: {
    fontSize: 14,
    color: '#6B7280',
  },
  netValue: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  highlightCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: '#FFFBEB',
    padding: 12,
    borderRadius: 8,
    marginTop: 12,
  },
  highlightText: {
    fontSize: 14,
    color: '#92400E',
    flex: 1,
  },
  statsCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    marginHorizontal: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  statsHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  statsTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1F2937',
    flex: 1,
    marginLeft: 8,
  },
  statsGrid: {
    flexDirection: 'row',
    gap: 8,
  },
  miniStat: {
    flex: 1,
    alignItems: 'center',
    padding: 8,
    backgroundColor: '#F9FAFB',
    borderRadius: 8,
  },
  miniStatValue: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#3B82F6',
    marginBottom: 4,
  },
  miniStatLabel: {
    fontSize: 11,
    color: '#6B7280',
  },
  infoCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    marginHorizontal: 16,
    marginBottom: 20,
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
    borderLeftWidth: 4,
    borderLeftColor: '#3B82F6',
  },
  infoContent: {
    flex: 1,
  },
  infoTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1F2937',
    marginBottom: 8,
  },
  infoText: {
    fontSize: 14,
    color: '#6B7280',
    lineHeight: 20,
    marginBottom: 4,
  },
  actionButtons: {
    flexDirection: 'row',
    gap: 12,
    paddingHorizontal: 16,
    marginBottom: 24,
  },
  actionButton: {
    flex: 1,
    backgroundColor: '#3B82F6',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 8,
  },
  statsAction: {
    backgroundColor: '#8B5CF6',
  },
  actionButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  // Modal Styles
  modalContainer: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    maxHeight: '90%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1F2937',
  },
  modalSubtitle: {
    fontSize: 14,
    color: '#6B7280',
    marginTop: 4,
  },
  closeButton: {
    padding: 4,
  },
  modalBody: {
    padding: 20,
  },
  modalStats: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 24,
  },
  modalStatCard: {
    flex: 1,
    backgroundColor: '#F9FAFB',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
  },
  modalStatValue: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1F2937',
    marginBottom: 4,
  },
  modalStatLabel: {
    fontSize: 12,
    color: '#6B7280',
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1F2937',
    marginBottom: 16,
  },
  dailyItem: {
    backgroundColor: '#F9FAFB',
    borderRadius: 8,
    padding: 12,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  completedDay: {
    backgroundColor: '#F0F9FF',
    borderColor: '#93C5FD',
  },
  dailyHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  dayInfo: {
    alignItems: 'center',
  },
  dayNumber: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1F2937',
  },
  dayName: {
    fontSize: 12,
    color: '#6B7280',
  },
  dailyTotal: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#8B5CF6',
  },
  dailyDetails: {
    flexDirection: 'row',
    gap: 16,
    marginBottom: 8,
  },
  dailyDetail: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  dailyDetailText: {
    fontSize: 14,
    color: '#6B7280',
  },
  dailyCalculation: {
    backgroundColor: '#FFFFFF',
    padding: 8,
    borderRadius: 6,
    marginBottom: 8,
  },
  calculationText: {
    fontSize: 13,
    color: '#6B7280',
    fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace',
  },
  notesBubble: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#F3F4F6',
    padding: 8,
    borderRadius: 6,
  },
  notesText: {
    fontSize: 12,
    color: '#6B7280',
    flex: 1,
    fontStyle: 'italic',
  },
  modalButtons: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 20,
  },
  modalButton: {
    flex: 1,
    borderRadius: 8,
    padding: 16,
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 8,
  },
  historyButton: {
    backgroundColor: '#3B82F6',
  },
  statsButton: {
    backgroundColor: '#8B5CF6',
  },
  modalButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  loadingContainer: {
    padding: 40,
    alignItems: 'center',
    gap: 16,
  },
  loadingText: {
    fontSize: 16,
    color: '#6B7280',
  },
  emptyContainer: {
    padding: 40,
    alignItems: 'center',
    gap: 16,
  },
  emptyText: {
    fontSize: 16,
    color: '#9CA3AF',
  },
  historyList: {
    padding: 20,
  },
  historyItem: {
    backgroundColor: '#F9FAFB',
    borderRadius: 8,
    padding: 12,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  historyHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  historyDate: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1F2937',
  },
  historyTotal: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#8B5CF6',
  },
  historyDetails: {
    flexDirection: 'row',
    gap: 16,
    marginBottom: 8,
  },
  historyDetail: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  historyDetailText: {
    fontSize: 14,
    color: '#6B7280',
  },
  historyCalculation: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    padding: 8,
    borderRadius: 6,
    marginBottom: 8,
  },
  netText: {
    fontSize: 13,
    fontWeight: '600',
  },
  historyNotes: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#F3F4F6',
    padding: 8,
    borderRadius: 6,
  },
  historyNotesText: {
    fontSize: 12,
    color: '#6B7280',
    flex: 1,
    fontStyle: 'italic',
  },
  statsSection: {
    marginBottom: 24,
  },
  statsGridLarge: {
    flexDirection: 'row',
    gap: 12,
  },
  statsCardLarge: {
    flex: 1,
    backgroundColor: '#F9FAFB',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
  },
  statsValueLarge: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1F2937',
    marginBottom: 4,
  },
  statsLabelLarge: {
    fontSize: 12,
    color: '#6B7280',
  },
  statsRow: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 8,
  },
  statsItem: {
    flex: 1,
    backgroundColor: '#F9FAFB',
    borderRadius: 8,
    padding: 12,
    alignItems: 'center',
  },
  statsValue: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1F2937',
    marginBottom: 4,
  },
  statsLabel: {
    fontSize: 12,
    color: '#6B7280',
  },
  statsGrid: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 12,
  },
  breakdownRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    backgroundColor: '#F3F4F6',
    padding: 12,
    borderRadius: 8,
  },
  breakdownText: {
    fontSize: 14,
    color: '#6B7280',
  },
  netSummary: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#F3F4F6',
    padding: 12,
    borderRadius: 8,
  },
  completionStats: {
    flexDirection: 'row',
    gap: 12,
  },
  completionItem: {
    flex: 1,
    backgroundColor: '#F9FAFB',
    borderRadius: 8,
    padding: 12,
    alignItems: 'center',
  },
  completionValue: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1F2937',
    marginBottom: 4,
  },
  completionLabel: {
    fontSize: 11,
    color: '#6B7280',
    textAlign: 'center',
  },
});

export default TravelScreen;