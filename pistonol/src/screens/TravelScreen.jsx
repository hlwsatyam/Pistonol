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
import DateTimePicker from '@react-native-community/datetimepicker';
import { Picker } from '@react-native-picker/picker';
import { useNavigation } from '@react-navigation/native';
import { SafeAreaView } from 'react-native-safe-area-context';

const { width } = Dimensions.get('window');

const TravelScreen = ({ route }) => {
  const navigation = useNavigation();
  const { userId } = route.params || { userId: 'user123' };
  
  const [distance, setDistance] = useState('');
  const [todayTravel, setTodayTravel] = useState(null);
  const [travelHistory, setTravelHistory] = useState([]);
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(false);
  const [historyLoading, setHistoryLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [showHistory, setShowHistory] = useState(false);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [datePickerMode, setDatePickerMode] = useState(null); // 'start' or 'end'
  const [stats, setStats] = useState(null);
  const [editMode, setEditMode] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  
  // Pagination states
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  
  // Filter states
  const [startDate, setStartDate] = useState(null);
  const [endDate, setEndDate] = useState(null);
  const [filterModalVisible, setFilterModalVisible] = useState(false);
  
  const API_URL = '/v1/travel';

  // Fetch initial data
  useEffect(() => {
    fetchTodayTravel();
    fetchUserStats();
    fetchTravelHistory(1);
  }, []);

  const fetchTodayTravel = async () => {
    try {
      setFetching(true);
      const response = await axios.get(`${API_URL}/today/${userId}`);
      
      if (response.data.success) {
        setTodayTravel(response.data.data);
        // If today has travel, pre-fill the input
        if (response.data.data) {
          setDistance(response.data.data.distance.toString());
        }
      }
    } catch (error) {
      console.error('Error fetching travel:', error);
      Alert.alert('Error', 'Failed to load today\'s travel');
    } finally {
      setFetching(false);
    }
  };

  const fetchTravelHistory = async (page = 1) => {
    try {
      setHistoryLoading(true);
      let url = `${API_URL}/user-history/${userId}?page=${page}&limit=${itemsPerPage}`;
      
      if (startDate) {
        url += `&startDate=${startDate.toISOString().split('T')[0]}`;
      }
      if (endDate) {
        url += `&endDate=${endDate.toISOString().split('T')[0]}`;
      }
      
      const response = await axios.get(url);
      
      if (response.data.success) {
        if (page === 1) {
          setTravelHistory(response.data.data);
        } else {
          setTravelHistory(prev => [...prev, ...response.data.data]);
        }
        setCurrentPage(response.data.pagination.page);
        setTotalPages(response.data.pagination.pages);
        setTotalItems(response.data.pagination.total);
      }
    } catch (error) {
      console.error('Error fetching history:', error);
      Alert.alert('Error', 'Failed to load travel history');
    } finally {
      setHistoryLoading(false);
    }
  };

  const fetchUserStats = async () => {
    try {
      const response = await axios.get(`${API_URL}/user-stats/${userId}`);
      if (response.data.success) {
        setStats(response.data.stats);
      }
    } catch (error) {
      console.error('Error fetching stats:', error);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await Promise.all([
      fetchTodayTravel(),
      fetchTravelHistory(1),
      fetchUserStats()
    ]);
    setRefreshing(false);
  };

  const handleSubmit = async () => {
    if (!distance || parseFloat(distance) <= 0) {
      Alert.alert('Error', 'Please enter valid distance (greater than 0)');
      return;
    }

    setLoading(true);
    try {
      let response;
      
      if (editMode && editingItem) {
        // Edit existing entry
        response = await axios.put(`${API_URL}/edit/${editingItem._id}`, {
          distance: parseFloat(distance)
        });
      } else {
        // Add new entry for today
        response = await axios.post(`${API_URL}/add`, {
          userId,
          distance: parseFloat(distance)
        });
      }

      if (response.data.success) {
        Alert.alert('Success', response.data.message);
        setDistance('');
        setEditMode(false);
        setEditingItem(null);
        onRefresh(); // Refresh all data
      }
    } catch (error) {
      const errorMessage = error.response?.data?.message || 'Failed to save travel';
      Alert.alert('Error', errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (item) => {
    if (item.canEdit) {
      setEditMode(true);
      setEditingItem(item);
      setDistance(item.distance.toString());
      setShowHistory(false); // Close history modal
    } else {
      Alert.alert('Not Allowed', 'You can only edit today\'s travel entry');
    }
  };

  const cancelEdit = () => {
    setEditMode(false);
    setEditingItem(null);
    setDistance(todayTravel?.distance?.toString() || '');
  };

  const loadMore = () => {
    if (currentPage < totalPages && !historyLoading) {
      fetchTravelHistory(currentPage + 1);
    }
  };

  const applyFilters = () => {
    setFilterModalVisible(false);
    setTravelHistory([]); // Clear old data
    fetchTravelHistory(1); // Fetch with new filters
  };

  const clearFilters = () => {
    setStartDate(null);
    setEndDate(null);
    setTravelHistory([]); // Clear old data
    fetchTravelHistory(1); // Fetch without filters
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-IN', {
      weekday: 'short',
      day: '2-digit',
      month: 'short',
      year: 'numeric'
    });
  };

  const formatTime = (dateString) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return date.toLocaleTimeString('en-IN', {
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const isToday = (dateString) => {
    if (!dateString) return false;
    const today = new Date();
    const inputDate = new Date(dateString);
    return today.toDateString() === inputDate.toDateString();
  };

  const handleDatePicker = (event, selectedDate) => {
    setShowDatePicker(false);
    if (selectedDate) {
      if (datePickerMode === 'start') {
        setStartDate(selectedDate);
      } else if (datePickerMode === 'end') {
        setEndDate(selectedDate);
      }
    }
  };

  const renderHistoryItem = ({ item }) => {
    const today = isToday(item.date);
    
    return (
      <TouchableOpacity
        style={[
          styles.historyItem,
          today && styles.todayHistoryItem,
          editingItem?._id === item._id && styles.selectedHistoryItem
        ]}
        onPress={() => handleEdit(item)}
        activeOpacity={0.7}
      >
        <View style={styles.historyHeader}>
          <View style={styles.dateContainer}>
            <Icon 
              name={today ? "today" : "calendar-today"} 
              size={20} 
              color={today ? "#3B82F6" : "#6B7280"} 
            />
            <View>
              <Text style={[
                styles.historyDate,
                today && styles.todayText
              ]}>
                {formatDate(item.date)}
                {today && " (Today)"}
              </Text>
              <Text style={styles.historyDateSmall}>
                {formatTime(item.updatedAt)}
              </Text>
            </View>
          </View>
          
          {today ? (
            <View style={styles.editBadge}>
              <Icon name="edit" size={14} color="#FFFFFF" />
              <Text style={styles.editBadgeText}>Tap to Edit</Text>
            </View>
          ) : (
            <View style={styles.readOnlyBadge}>
              <Icon name="lock" size={14} color="#FFFFFF" />
              <Text style={styles.readOnlyBadgeText}>View Only</Text>
            </View>
          )}
        </View>

        <View style={styles.historyContent}>
          <View style={styles.distanceContainer}>
            <Icon name="directions-car" size={28} color="#059669" />
            <Text style={styles.historyDistance}>{item.distance} km</Text>
          </View>
          
          {editingItem?._id === item._id && (
            <View style={styles.editingIndicator}>
              <Icon name="edit" size={16} color="#3B82F6" />
              <Text style={styles.editingText}>Currently Editing</Text>
            </View>
          )}
        </View>
      </TouchableOpacity>
    );
  };

  const renderFooter = () => {
    if (!historyLoading) return null;
    
    return (
      <View style={styles.footerLoader}>
        <ActivityIndicator size="small" color="#3B82F6" />
        <Text style={styles.loadingText}>Loading more...</Text>
      </View>
    );
  };

  return (
    <SafeAreaView   style={{flex:1}}>
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
        {/* Header with Back Button */}
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
            <Text style={styles.subtitle}>User ID: {userId}</Text>
          </View>
          <View style={styles.headerRight} />
        </View>

        {/* Stats Overview */}
        {stats && (
          <View style={styles.statsContainer}>
            <View style={styles.statsRow}>
              <View style={styles.statCard}>
                <Icon name="today" size={24} color="#3B82F6" />
                <Text style={styles.statValue}>{stats.todayDistance.toFixed(1)}</Text>
                <Text style={styles.statLabel}>Today</Text>
              </View>
              <View style={styles.statCard}>
                <Icon name="date-range" size={24} color="#8B5CF6" />
                <Text style={styles.statValue}>{stats.weekDistance.toFixed(1)}</Text>
                <Text style={styles.statLabel}>This Week</Text>
              </View>
              <View style={styles.statCard}>
                <Icon name="show-chart" size={24} color="#059669" />
                <Text style={styles.statValue}>{stats.totalDistance.toFixed(1)}</Text>
                <Text style={styles.statLabel}>Total</Text>
              </View>
            </View>
          </View>
        )}

        {/* Today's Travel Card */}
        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <Text style={styles.cardTitle}>
              <Icon name="today" size={22} color="#3B82F6" /> Today's Travel
            </Text>
            <View style={styles.headerButtons}>
              <TouchableOpacity 
                style={styles.iconButton}
                onPress={() => setShowHistory(true)}
              >
                <Icon name="history" size={22} color="#6B7280" />
                <Text style={styles.iconButtonText}>History</Text>
              </TouchableOpacity>
              <TouchableOpacity 
                style={styles.iconButton}
                onPress={onRefresh}
              >
                <Icon name="refresh" size={22} color="#6B7280" />
                <Text style={styles.iconButtonText}>Refresh</Text>
              </TouchableOpacity>
            </View>
          </View>
          
          {fetching ? (
            <ActivityIndicator size="large" color="#3B82F6" style={{ marginVertical: 20 }} />
          ) : (
            <>
              <View style={styles.todayInfo}>
                <Text style={styles.dateText}>
                  {todayTravel?.date ? formatDate(todayTravel.date) : formatDate(new Date())}
                </Text>
                <View style={styles.distanceContainerMain}>
                  <Icon name="directions-car" size={36} color="#059669" />
                  <Text style={styles.distanceText}>
                    {todayTravel?.distance || 0} km
                  </Text>
                </View>
                {todayTravel?.updatedAt && (
                  <Text style={styles.updatedText}>
                    Last updated: {formatTime(todayTravel.updatedAt)}
                  </Text>
                )}
              </View>
              
              <Text style={styles.note}>
                <Icon name="info" size={16} color="#6B7280" />
                {" "}You can only edit today's travel. Tap on today's entry in history to edit.
              </Text>
            </>
          )}
        </View>

        {/* Input Form */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>
            <Icon name="edit" size={22} color="#3B82F6" /> 
            {editMode ? 'Edit Today\'s Distance' : 'Add Today\'s Distance'}
          </Text>
          
          <View style={styles.inputContainer}>
            <Text style={styles.label}>
              <Icon name="speed" size={18} color="#374151" /> Distance (km)
            </Text>
            <TextInput
              style={styles.input}
              placeholder="Enter travel distance in km"
              keyboardType="decimal-pad"
              value={distance}
              onChangeText={setDistance}
              placeholderTextColor="#9CA3AF"
            />
          </View>

          <View style={styles.buttonRow}>
            {editMode && (
              <TouchableOpacity
                style={[styles.button, styles.cancelButton]}
                onPress={cancelEdit}
              >
                <Icon name="close" size={22} color="#FFFFFF" />
                <Text style={styles.buttonText}>Cancel</Text>
              </TouchableOpacity>
            )}
            
            <TouchableOpacity
              style={[
                styles.button, 
                loading && styles.buttonDisabled,
                editMode ? styles.editButton : styles.saveButton
              ]}
              onPress={handleSubmit}
              disabled={loading}
            >
              {loading ? (
                <ActivityIndicator color="#FFFFFF" />
              ) : (
                <>
                  <Icon name={editMode ? "save" : "add"} size={22} color="#FFFFFF" />
                  <Text style={styles.buttonText}>
                    {editMode ? 'Update' : 'Save'}
                  </Text>
                </>
              )}
            </TouchableOpacity>
          </View>
        </View>

   

        {/* History Modal */}
        <Modal
          visible={showHistory}
          animationType="slide"
          transparent={true}
          onRequestClose={() => setShowHistory(false)}
        >
          <View style={styles.modalContainer}>
            <View style={styles.modalContent}>
              <View style={styles.modalHeader}>
                <Text style={styles.modalTitle}>
                  <Icon name="history" size={24} color="#3B82F6" /> Travel History
                </Text>
                <View style={styles.modalHeaderButtons}>
                  <TouchableOpacity 
                    style={styles.iconButton}
                    onPress={() => setFilterModalVisible(true)}
                  >
                    <Icon name="filter-list" size={22} color="#6B7280" />
                  </TouchableOpacity>
                  <TouchableOpacity 
                    onPress={() => setShowHistory(false)}
                    style={styles.closeButton}
                  >
                    <Icon name="close" size={24} color="#6B7280" />
                  </TouchableOpacity>
                </View>
              </View>

              {/* Filter Summary */}
              {(startDate || endDate) && (
                <View style={styles.filterSummary}>
                  <Text style={styles.filterSummaryText}>
                    Filters:{' '}
                    {startDate && `From: ${formatDate(startDate)} `}
                    {endDate && `To: ${formatDate(endDate)}`}
                  </Text>
                  <TouchableOpacity onPress={clearFilters}>
                    <Icon name="clear" size={18} color="#EF4444" />
                  </TouchableOpacity>
                </View>
              )}

              {/* Pagination Info */}
              <View style={styles.paginationInfo}>
                <Text style={styles.paginationText}>
                  Page {currentPage} of {totalPages} • {totalItems} records
                </Text>
                {editMode && (
                  <Text style={styles.editingInfo}>
                    <Icon name="edit" size={14} color="#3B82F6" />
                    {' '}Editing today's entry
                  </Text>
                )}
              </View>

              {historyLoading && travelHistory.length === 0 ? (
                <View style={styles.loadingContainer}>
                  <ActivityIndicator size="large" color="#3B82F6" />
                  <Text style={styles.loadingText}>Loading history...</Text>
                </View>
              ) : travelHistory.length === 0 ? (
                <View style={styles.emptyContainer}>
                  <Icon name="history-off" size={60} color="#D1D5DB" />
                  <Text style={styles.emptyText}>No travel history found</Text>
                  {(startDate || endDate) && (
                    <TouchableOpacity 
                      style={styles.clearFilterButton}
                      onPress={clearFilters}
                    >
                      <Text style={styles.clearFilterText}>Clear Filters</Text>
                    </TouchableOpacity>
                  )}
                </View>
              ) : (
                <FlatList
                  data={travelHistory}
                  renderItem={renderHistoryItem}
                  keyExtractor={(item) => item._id}
                  showsVerticalScrollIndicator={false}
                  contentContainerStyle={styles.historyList}
                  ListFooterComponent={renderFooter}
                  onEndReached={loadMore}
                  onEndReachedThreshold={0.5}
                />
              )}

              <View style={styles.modalFooter}>
                <TouchableOpacity 
                  style={styles.modalCloseBtn}
                  onPress={() => setShowHistory(false)}
                >
                  <Text style={styles.modalCloseText}>Close History</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </Modal>

        {/* Filter Modal */}
        <Modal
          visible={filterModalVisible}
          animationType="slide"
          transparent={true}
          onRequestClose={() => setFilterModalVisible(false)}
        >
          <View style={styles.modalContainer}>
            <View style={[styles.modalContent, { height: '50%' }]}>
              <View style={styles.modalHeader}>
                <Text style={styles.modalTitle}>
                  <Icon name="filter-list" size={24} color="#3B82F6" /> Filter History
                </Text>
                <TouchableOpacity 
                  onPress={() => setFilterModalVisible(false)}
                  style={styles.closeButton}
                >
                  <Icon name="close" size={24} color="#6B7280" />
                </TouchableOpacity>
              </View>

              <ScrollView style={styles.filterContent}>
                {/* Start Date */}
                <View style={styles.filterSection}>
                  <Text style={styles.filterLabel}>
                    <Icon name="calendar-today" size={18} color="#6B7280" /> Start Date
                  </Text>
                  <TouchableOpacity 
                    style={styles.dateButton}
                    onPress={() => {
                      setDatePickerMode('start');
                      setShowDatePicker(true);
                    }}
                  >
                    <Icon name="event" size={20} color="#6B7280" />
                    <Text style={styles.dateButtonText}>
                      {startDate ? formatDate(startDate) : 'Select start date'}
                    </Text>
                  </TouchableOpacity>
                </View>

                {/* End Date */}
                <View style={styles.filterSection}>
                  <Text style={styles.filterLabel}>
                    <Icon name="calendar-today" size={18} color="#6B7280" /> End Date
                  </Text>
                  <TouchableOpacity 
                    style={styles.dateButton}
                    onPress={() => {
                      setDatePickerMode('end');
                      setShowDatePicker(true);
                    }}
                  >
                    <Icon name="event" size={20} color="#6B7280" />
                    <Text style={styles.dateButtonText}>
                      {endDate ? formatDate(endDate) : 'Select end date'}
                    </Text>
                  </TouchableOpacity>
                </View>

                {/* Items Per Page */}
                <View style={styles.filterSection}>
                  <Text style={styles.filterLabel}>
                    <Icon name="list" size={18} color="#6B7280" /> Items Per Page
                  </Text>
                  <View style={styles.pickerContainer}>
                    <Picker
                      selectedValue={itemsPerPage}
                      style={styles.picker}
                      onValueChange={(itemValue) => setItemsPerPage(itemValue)}
                    >
                      <Picker.Item label="10 items" value={10} />
                      <Picker.Item label="20 items" value={20} />
                      <Picker.Item label="50 items" value={50} />
                    </Picker>
                  </View>
                </View>
              </ScrollView>

              <View style={styles.filterFooter}>
                <TouchableOpacity 
                  style={[styles.filterButton, styles.clearButton]}
                  onPress={clearFilters}
                >
                  <Text style={styles.clearButtonText}>Clear All</Text>
                </TouchableOpacity>
                <TouchableOpacity 
                  style={[styles.filterButton, styles.applyButton]}
                  onPress={applyFilters}
                >
                  <Text style={styles.applyButtonText}>Apply Filters</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </Modal>

        {/* Date Picker */}
        {showDatePicker && (
          <DateTimePicker
            value={datePickerMode === 'start' && startDate ? startDate : 
                   datePickerMode === 'end' && endDate ? endDate : new Date()}
            mode="date"
            display={Platform.OS === 'ios' ? 'spinner' : 'default'}
            onChange={handleDatePicker}
          />
        )}
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
    justifyContent: 'space-between',
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
  headerRight: {
    width: 40,
  },
  statsContainer: {
    paddingHorizontal: 16,
    marginTop: 16,
    marginBottom: 16,
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  statCard: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    marginHorizontal: 4,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  statValue: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1F2937',
    marginVertical: 8,
  },
  statLabel: {
    fontSize: 12,
    color: '#6B7280',
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
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
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
  headerButtons: {
    flexDirection: 'row',
    gap: 12,
    alignItems: 'center',
  },
  iconButton: {
    alignItems: 'center',
    padding: 4,
  },
  iconButtonText: {
    fontSize: 10,
    color: '#6B7280',
    marginTop: 2,
  },
  todayInfo: {
    backgroundColor: '#F0F9FF',
    padding: 20,
    borderRadius: 12,
    alignItems: 'center',
    marginBottom: 12,
  },
  dateText: {
    fontSize: 16,
    color: '#374151',
    marginBottom: 12,
    fontWeight: '500',
  },
  distanceContainerMain: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 8,
  },
  distanceText: {
    fontSize: 36,
    fontWeight: 'bold',
    color: '#059669',
  },
  updatedText: {
    fontSize: 14,
    color: '#6B7280',
    fontStyle: 'italic',
  },
  note: {
    fontSize: 14,
    color: '#6B7280',
    lineHeight: 20,
    fontStyle: 'italic',
  },
  inputContainer: {
    marginBottom: 20,
  },
  label: {
    fontSize: 16,
    color: '#374151',
    marginBottom: 8,
    fontWeight: '500',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  input: {
    borderWidth: 1,
    borderColor: '#D1D5DB',
    borderRadius: 12,
    padding: 16,
    fontSize: 16,
    backgroundColor: '#F9FAFB',
    color: '#1F2937',
  },
  buttonRow: {
    flexDirection: 'row',
    gap: 12,
  },
  button: {
    flex: 1,
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 8,
  },
  saveButton: {
    backgroundColor: '#3B82F6',
  },
  editButton: {
    backgroundColor: '#059669',
  },
  cancelButton: {
    backgroundColor: '#EF4444',
  },
  buttonDisabled: {
    backgroundColor: '#93C5FD',
  },
  buttonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  quickActions: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginTop: 8,
  },
  quickAction: {
    alignItems: 'center',
    padding: 12,
    flex: 1,
  },
  quickActionText: {
    fontSize: 12,
    color: '#374151',
    marginTop: 4,
  },
  disabledText: {
    color: '#9CA3AF',
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
  modalHeaderButtons: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1F2937',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  closeButton: {
    padding: 4,
  },
  filterSummary: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 12,
    backgroundColor: '#FEF3C7',
    marginHorizontal: 16,
    marginTop: 8,
    borderRadius: 8,
  },
  filterSummaryText: {
    fontSize: 14,
    color: '#92400E',
    flex: 1,
  },
  paginationInfo: {
    padding: 12,
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  paginationText: {
    fontSize: 14,
    color: '#6B7280',
  },
  editingInfo: {
    fontSize: 14,
    color: '#3B82F6',
    marginTop: 4,
    flexDirection: 'row',
    alignItems: 'center',
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
  clearFilterButton: {
    backgroundColor: '#EF4444',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 8,
    marginTop: 8,
  },
  clearFilterText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
  },
  historyList: {
    padding: 16,
  },
  historyItem: {
    backgroundColor: '#F9FAFB',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  todayHistoryItem: {
    backgroundColor: '#F0F9FF',
    borderColor: '#93C5FD',
  },
  selectedHistoryItem: {
    borderColor: '#3B82F6',
    borderWidth: 2,
    backgroundColor: '#EFF6FF',
  },
  historyHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  dateContainer: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 8,
    flex: 1,
  },
  historyDate: {
    fontSize: 16,
    color: '#374151',
    fontWeight: '500',
  },
  historyDateSmall: {
    fontSize: 12,
    color: '#6B7280',
    marginTop: 2,
  },
  todayText: {
    color: '#3B82F6',
    fontWeight: '600',
  },
  editBadge: {
    backgroundColor: '#059669',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 12,
  },
  editBadgeText: {
    fontSize: 12,
    color: '#FFFFFF',
    fontWeight: '600',
  },
  readOnlyBadge: {
    backgroundColor: '#6B7280',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 12,
  },
  readOnlyBadgeText: {
    fontSize: 12,
    color: '#FFFFFF',
    fontWeight: '600',
  },
  historyContent: {
    marginBottom: 8,
  },
  distanceContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginBottom: 8,
  },
  historyDistance: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#059669',
  },
  editingIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#DBEAFE',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
    alignSelf: 'flex-start',
    marginTop: 8,
  },
  editingText: {
    fontSize: 12,
    color: '#1E40AF',
    fontWeight: '600',
  },
  footerLoader: {
    padding: 20,
    alignItems: 'center',
  },
  modalFooter: {
    padding: 20,
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
  },
  modalCloseBtn: {
    backgroundColor: '#3B82F6',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
  },
  modalCloseText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  // Filter Modal Styles
  filterContent: {
    padding: 20,
  },
  filterSection: {
    marginBottom: 24,
  },
  filterLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 8,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  dateButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    borderWidth: 1,
    borderColor: '#D1D5DB',
    borderRadius: 8,
    padding: 14,
    backgroundColor: '#F9FAFB',
  },
  dateButtonText: {
    fontSize: 16,
    color: '#374151',
    flex: 1,
  },
  pickerContainer: {
    borderWidth: 1,
    borderColor: '#D1D5DB',
    borderRadius: 8,
    overflow: 'hidden',
  },
  picker: {
    height: 50,
    width: '100%',
    backgroundColor: '#F9FAFB',
  },
  filterFooter: {
    flexDirection: 'row',
    padding: 20,
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
    gap: 12,
  },
  filterButton: {
    flex: 1,
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
  },
  clearButton: {
    backgroundColor: '#F3F4F6',
  },
  clearButtonText: {
    color: '#374151',
    fontSize: 16,
    fontWeight: '600',
  },
  applyButton: {
    backgroundColor: '#3B82F6',
  },
  applyButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
});

export default TravelScreen;