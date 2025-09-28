 
import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Alert,
  ScrollView,
  ActivityIndicator,
  Modal,
  TextInput,
  FlatList,
  RefreshControl
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import Icon from "react-native-vector-icons/MaterialIcons";
import DateTimePicker from "@react-native-community/datetimepicker";
import axios from "axios";
 

// 📌 Helper functions (replace date-fns)
const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", 
                    "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

const format = (date) => {
  if (!(date instanceof Date)) return "";
  const day = String(date.getDate()).padStart(2, "0");
  const month = monthNames[date.getMonth()];
  const year = date.getFullYear();
  return `${month} ${day}, ${year}`;
};

const isAfter = (date1, date2) => {
  return date1.getTime() > date2.getTime();
};

const differenceInDays = (date1, date2) => {
  const oneDay = 1000 * 60 * 60 * 24;
  const diffTime = date1.setHours(0,0,0,0) - date2.setHours(0,0,0,0);
  return Math.round(diffTime / oneDay);
};





const LeaveScreen = ({ route, navigation }) => {
  const { user, stores } = route.params || {};
  const [leaves, setLeaves] = useState([]);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [showApplyModal, setShowApplyModal] = useState(false);
  const [showDatePicker, setShowDatePicker] = useState(null);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);

  // Form state
  const [formData, setFormData] = useState({
    startDate: new Date(),
    endDate: new Date(),
    reason: "",
    userId:user._id,
    type: "casual",
    storeId: stores && stores.length > 0 ? stores[0]._id : null
  });

  // Load leave history
  const loadLeaves = async (pageNum = 1, refreshing = false) => {
    try {
      if (refreshing) {
        setRefreshing(true);
      } else {
        setLoading(true);
      }

      const response = await axios.get(`/leave/history?userId=${user._id}&page=${pageNum}&limit=10`);
      
      if (pageNum === 1) {
        setLeaves(response.data.leaves);
      } else {
        setLeaves(prev => [...prev, ...response.data.leaves]);
      }
      
      setHasMore(pageNum < response.data.totalPages);
      setPage(pageNum);
    } catch (error) {
      Alert.alert("Error", "Failed to load leave history");
      console.error("Leave history error:", error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    loadLeaves(1);
  }, []);

  // Apply for leave
  const applyLeave = async () => {
    if (!formData.reason.trim()) {
      Alert.alert("Error", "Please provide a reason for leave");
      return;
    }

    if (isAfter(formData.startDate, formData.endDate)) {
      Alert.alert("Error", "End date cannot be before start date");
      return;
    }

    const days = differenceInDays(formData.endDate, formData.startDate) + 1;
    if (days <= 0) {
      Alert.alert("Error", "Please select valid dates");
      return;
    }

    try {
      setLoading(true);
      const response = await axios.post("/leave/apply", formData);
      
      Alert.alert("Success", "Leave application submitted successfully");
      setShowApplyModal(false);
      setFormData({
        startDate: new Date(),
        endDate: new Date(),
        reason: "",
        type: "casual",
        storeId: stores && stores.length > 0 ? stores[0]._id : null
      });
      
      // Refresh the list
      loadLeaves(1);
    } catch (error) {
      const message = error.response?.data?.message || "Failed to apply for leave";
      Alert.alert("Error", message);
    } finally {
      setLoading(false);
    }
  };

  // Cancel leave
  const cancelLeave = async (leaveId) => {
    Alert.alert(
      "Cancel Leave",
      "Are you sure you want to cancel this leave request?",
      [
        { text: "No", style: "cancel" },
        {
          text: "Yes",
          onPress: async () => {
            try {
              await axios.put(`/leave/cancel/${leaveId}` ,{id:user._id}    );
              Alert.alert("Success", "Leave request cancelled");
              loadLeaves(1); 
            } catch (error) {
              const message = error.response?.data?.message || "Failed to cancel leave";
              Alert.alert("Error", message);
            }
          }
        }
      ]
    );
  };

  // Date change handler
  const handleDateChange = (event, selectedDate) => {
    setShowDatePicker(null);
    if (selectedDate) {
      if (showDatePicker === "start") {
        setFormData({ ...formData, startDate: selectedDate });
      } else {
        setFormData({ ...formData, endDate: selectedDate });
      }
    }
  };

  // Render leave item
  const renderLeaveItem = ({ item }) => {
    const startDate = new Date(item.startDate);
    const endDate = new Date(item.endDate);
    const days = differenceInDays(endDate, startDate) + 1;
    
    const getStatusColor = () => {
      switch (item.status) {
        case "approved": return "#4CD964";
        case "rejected": return "#FF3B30";
        case "cancelled": return "#8E8E93";
        default: return "#FFCC00";
      }
    };

    const getStatusIcon = () => {
      switch (item.status) {
        case "approved": return "check-circle";
        case "rejected": return "cancel";
        case "cancelled": return "remove-circle";
        default: return "schedule";
      }
    };

    return (
      <View style={styles.leaveCard}>
        <View style={styles.leaveHeader}>
          <View style={styles.leaveDates}>
            <Text style={styles.dateText}>
              {format(startDate, "MMM dd, yyyy")} - {format(endDate, "MMM dd, yyyy")}
            </Text>
            <Text style={styles.daysText}>({days} day{days > 1 ? "s" : ""})</Text>
          </View>
          <View style={[styles.statusBadge, { backgroundColor: getStatusColor() }]}>
            <Icon name={getStatusIcon()} size={14} color="white" />
            <Text style={styles.statusText}>{item.status.toUpperCase()}</Text>
          </View>
        </View>
        
        <View style={styles.leaveDetails}>
          <Text style={styles.reasonText}>{item.reason}</Text>
          <Text style={styles.typeText}>Type: {item.type.replace("-", " ")}</Text>
          {item.store && (
            <Text style={styles.storeText}>Store: {item.store.name}</Text>
          )}
        </View>
        
        {item.status === "pending" && (
          <TouchableOpacity
            style={styles.cancelButton}
            onPress={() => cancelLeave(item._id)}
          >
            <Text style={styles.cancelButtonText}>Cancel Request</Text>
          </TouchableOpacity>
        )}
      </View>
    );
  };

  // Load more leaves
  const loadMore = () => {
    if (!loading && hasMore) {
      loadLeaves(page + 1);
    }
  };

  // Refresh leaves
  const onRefresh = () => {
    loadLeaves(1, true);
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Icon name="arrow-back" size={24} color="#fff" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Leave Management</Text>
        <View style={styles.headerRight} />
      </View>

      {/* Apply Button */}
      <TouchableOpacity
        style={styles.applyButton}
        onPress={() => setShowApplyModal(true)}
      >
        <Icon name="add" size={20} color="#fff" />
        <Text style={styles.applyButtonText}>Apply for Leave</Text>
      </TouchableOpacity>

      {/* Leave List */}
      {loading && page === 1 ? (
        <View style={styles.centerContainer}>
          <ActivityIndicator size="large" color="#007AFF" />
        </View>
      ) : leaves.length === 0 ? (
        <View style={styles.centerContainer}>
          <Icon name="event-busy" size={60} color="#ccc" />
          <Text style={styles.emptyText}>No leave records found</Text>
          <Text style={styles.emptySubtext}>
            Apply for your first leave using the button above
          </Text>
        </View>
      ) : (
        <FlatList
          data={leaves}
          renderItem={renderLeaveItem}
          keyExtractor={(item) => item._id}
          contentContainerStyle={styles.listContainer}
          onEndReached={loadMore}
          onEndReachedThreshold={0.5}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
          }
          ListFooterComponent={
            loading && page > 1 ? (
              <ActivityIndicator style={styles.footerLoader} color="#007AFF" />
            ) : null
          }
        />
      )}

      {/* Apply Leave Modal */}
      <Modal
        visible={showApplyModal}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setShowApplyModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Apply for Leave</Text>
              <TouchableOpacity onPress={() => setShowApplyModal(false)}>
                <Icon name="close" size={24} color="#333" />
              </TouchableOpacity>
            </View>

            <ScrollView style={styles.modalBody}>
              {/* Store Selection */}
              {stores && stores.length > 0 && (
                <View style={styles.inputGroup}>
                  <Text style={styles.inputLabel}>Store</Text>
                  <View style={styles.storePicker}>
                    {stores.map(store => (
                      <TouchableOpacity
                        key={store._id}
                        style={[
                          styles.storeOption,
                          formData.storeId === store._id && styles.storeOptionSelected
                        ]}
                        onPress={() => setFormData({...formData, storeId: store._id})}
                      >
                        <Text style={[
                          styles.storeOptionText,
                          formData.storeId === store._id && styles.storeOptionTextSelected
                        ]}>
                          {store.name}
                        </Text>
                      </TouchableOpacity>
                    ))}
                  </View>
                </View>
              )}

              {/* Leave Type */}
              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Leave Type</Text>
                <View style={styles.typePicker}>
                  {["casual", "sick", "earned", "without-pay"].map(type => (
                    <TouchableOpacity
                      key={type}
                      style={[
                        styles.typeOption,
                        formData.type === type && styles.typeOptionSelected
                      ]}
                      onPress={() => setFormData({...formData, type})}
                    >
                      <Text style={[
                        styles.typeOptionText,
                        formData.type === type && styles.typeOptionTextSelected
                      ]}>
                        {type.replace("-", " ")}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>

              {/* Dates */}
              <View style={styles.dateRow}>
                <View style={styles.dateInput}>
                  <Text style={styles.inputLabel}>Start Date</Text>
                  <TouchableOpacity 
                    style={styles.dateButton}
                    onPress={() => setShowDatePicker("start")}
                  >
                    <Text>{format(formData.startDate, "MMM dd, yyyy")}</Text>
                    <Icon name="calendar-today" size={20} color="#007AFF" />
                  </TouchableOpacity>
                </View>

                <View style={styles.dateInput}>
                  <Text style={styles.inputLabel}>End Date</Text>
                  <TouchableOpacity 
                    style={styles.dateButton}
                    onPress={() => setShowDatePicker("end")}
                  >
                    <Text>{format(formData.endDate, "MMM dd, yyyy")}</Text>
                    <Icon name="calendar-today" size={20} color="#007AFF" />
                  </TouchableOpacity>
                </View>
              </View>

              {/* Reason */}
              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Reason</Text>
                <TextInput
                  style={styles.reasonInput}
                  multiline
                  numberOfLines={4}
                  placeholder="Please provide a reason for your leave"
                  value={formData.reason}
                  onChangeText={(text) => setFormData({...formData, reason: text})}
                />
              </View>

              {/* Duration Info */}
              <View style={styles.durationInfo}>
                <Text style={styles.durationText}>
                  Duration: {differenceInDays(formData.endDate, formData.startDate) + 1} days
                </Text>
              </View>
            </ScrollView>

            {/* Modal Footer */}
            <View style={styles.modalFooter}>
              <TouchableOpacity
                style={styles.cancelModalButton}
                onPress={() => setShowApplyModal(false)}
              >
                <Text style={styles.cancelModalButtonText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.submitButton}
                onPress={applyLeave}
                disabled={loading}
              >
                {loading ? (
                  <ActivityIndicator color="white" />
                ) : (
                  <Text style={styles.submitButtonText}>Submit Application</Text>
                )}
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* Date Picker */}
      {showDatePicker && (
        <DateTimePicker
          value={showDatePicker === "start" ? formData.startDate : formData.endDate}
          mode="date"
          display="default"
          onChange={handleDateChange}
          minimumDate={new Date()}
        />
      )}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#f5f5f7',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#007AFF',
  },
  backButton: {
    padding: 4,
  },
  headerTitle: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '600',
  },
  headerRight: {
    width: 32,
  },
  applyButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#007AFF',
    padding: 16,
    margin: 16,
    borderRadius: 12,
  },
  applyButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  emptyText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#666',
    marginTop: 16,
  },
  emptySubtext: {
    fontSize: 14,
    color: '#888',
    textAlign: 'center',
    marginTop: 8,
  },
  listContainer: {
    padding: 16,
  },
  leaveCard: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  leaveHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  leaveDates: {
    flex: 1,
  },
  dateText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
  },
  daysText: {
    fontSize: 14,
    color: '#666',
    marginTop: 4,
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusText: {
    color: 'white',
    fontSize: 12,
    fontWeight: '600',
    marginLeft: 4,
  },
  leaveDetails: {
    marginBottom: 12,
  },
  reasonText: {
    fontSize: 14,
    color: '#333',
    marginBottom: 8,
  },
  typeText: {
    fontSize: 12,
    color: '#666',
  },
  storeText: {
    fontSize: 12,
    color: '#666',
    marginTop: 4,
  },
  cancelButton: {
    alignSelf: 'flex-end',
    padding: 8,
  },
  cancelButtonText: {
    color: '#FF3B30',
    fontSize: 14,
    fontWeight: '500',
  },
  footerLoader: {
    marginVertical: 16,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: 'white',
    borderRadius: 16,
    width: '90%',
    maxHeight: '80%',
    overflow: 'hidden',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
  },
  modalBody: {
    padding: 16,
  },
  modalFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: '#eee',
  },
  inputGroup: {
    marginBottom: 16,
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
    marginBottom: 8,
  },
  storePicker: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  storeOption: {
    padding: 8,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#ddd',
    marginRight: 8,
    marginBottom: 8,
  },
  storeOptionSelected: {
    backgroundColor: '#007AFF',
    borderColor: '#007AFF',
  },
  storeOptionText: {
    fontSize: 12,
    color: '#333',
  },
  storeOptionTextSelected: {
    color: 'white',
  },
  typePicker: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  typeOption: {
    padding: 8,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#ddd',
    marginRight: 8,
    marginBottom: 8,
  },
  typeOptionSelected: {
    backgroundColor: '#007AFF',
    borderColor: '#007AFF',
  },
  typeOptionText: {
    fontSize: 12,
    color: '#333',
  },
  typeOptionTextSelected: {
    color: 'white',
  },
  dateRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  dateInput: {
    width: '48%',
  },
  dateButton: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 12,
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
  },
  reasonInput: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 12,
    textAlignVertical: 'top',
    minHeight: 100,
  },
  durationInfo: {
    padding: 12,
    backgroundColor: '#f0f8ff',
    borderRadius: 8,
    alignItems: 'center',
  },
  durationText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#007AFF',
  },
  cancelModalButton: {
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#ddd',
    flex: 1,
    marginRight: 8,
    alignItems: 'center',
  },
  cancelModalButtonText: {
    color: '#333',
    fontWeight: '600',
  },
  submitButton: {
    backgroundColor: '#007AFF',
    padding: 12,
    borderRadius: 8,
    flex: 2,
    alignItems: 'center',
  },
  submitButtonText: {
    color: 'white',
    fontWeight: '600',
  },
});

export default LeaveScreen;