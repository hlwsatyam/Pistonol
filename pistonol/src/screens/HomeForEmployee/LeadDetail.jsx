 
import React, {useState, useEffect} from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Modal,
  ActivityIndicator,
  Alert,
  SafeAreaView,
} from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import {useMutation, useQuery, useQueryClient} from '@tanstack/react-query';
import axios from 'axios';
import moment from 'moment';
import {
  themeColor,
  startDirectionTheme,
  endDirectionTheme,
} from '../../locale/Locale';
import LinearGradient from 'react-native-linear-gradient';
import ThemeWithBg from '../../Skeleton/ThemeWithBg';

const LeadDetailScreen = ({route, navigation}) => {
  const {leadId} = route.params;
  const queryClient = useQueryClient();
  const [feedbackText, setFeedbackText] = useState('');
  const [editingFeedbackId, setEditingFeedbackId] = useState(null);
  const [editFeedbackText, setEditFeedbackText] = useState('');
  const [isEditModalVisible, setIsEditModalVisible] = useState(false);

  const {data: lead, isLoading} = useQuery({
    queryKey: ['lead', leadId],
    queryFn: async () => {
      const response = await axios.get(`/leads/${leadId}`);
      return response.data;
    },
  });

  const addFeedbackMutation = useMutation({
    mutationFn: async message => {
      const response = await axios.post(`/leads/${leadId}/feedbacks`, {
        message,
      });
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['lead', leadId]);
      setFeedbackText('');
    },
    onError: error => {
      Alert.alert(
        'Error',
        error.response?.data?.message || 'Failed to add feedback',
      );
    },
  });

  const updateFeedbackMutation = useMutation({
    mutationFn: async ({leadId, feedbackId, message}) => {
      const response = await axios.put(
        `/leads/${leadId}/feedbacks/${feedbackId}`,
        {message},
      );
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['lead', leadId]);
      setIsEditModalVisible(false);
    },
    onError: error => {
      Alert.alert(
        'Error',
        error.response?.data?.message || 'Failed to update feedback',
      );
    },
  });

  const handleAddFeedback = () => {
    if (!feedbackText.trim()) return;
    addFeedbackMutation.mutate(feedbackText);
  };

  const handleEditFeedback = feedback => {
    setEditingFeedbackId(feedback._id);
    setEditFeedbackText(feedback.message);
    setIsEditModalVisible(true);
  };

  const handleUpdateFeedback = () => {
    if (!editFeedbackText.trim()) return;
    updateFeedbackMutation.mutate({
      leadId,
      feedbackId: editingFeedbackId,
      message: editFeedbackText,
    });
  };

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={themeColor[0]} />
      </View>
    );
  }

  if (!lead) {
    return (
      <View style={styles.container}>
        <Text>Lead not found</Text>
      </View>
    );
  }

  return (
    <ThemeWithBg>
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.header}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => navigation.goBack()}>
            <Ionicons name="arrow-back" size={24} color="white" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Lead Details</Text>
          <View style={styles.headerRight} />
        </View>

        <ScrollView style={styles.container}>
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Lead Information</Text>

            <View style={styles.infoRow}>
              <Text style={styles.label}>Garage Name:</Text>
              <Text style={styles.value}>{lead.garageName}</Text>
            </View>

            <View style={styles.infoRow}>
              <Text style={styles.label}>Contact Person:</Text>
              <Text style={styles.value}>{lead.contactName}</Text>
            </View>

            <View style={styles.infoRow}>
              <Text style={styles.label}>Mobile:</Text>
              <Text style={styles.value}>{lead.mobile}</Text>
            </View>

            <View style={styles.infoRow}>
              <Text style={styles.label}>Address:</Text>
              <Text style={styles.value}>{lead.address}</Text>
            </View>

            <View style={styles.infoRow}>
              <Text style={styles.label}>City:</Text>
              <Text style={styles.value}>{lead.city}</Text>
            </View>

            <View style={styles.infoRow}>
              <Text style={styles.label}>State:</Text>
              <Text style={styles.value}>{lead.state}</Text>
            </View>

            <View style={styles.infoRow}>
              <Text style={styles.label}>Pincode:</Text>
              <Text style={styles.value}>{lead.pincode}</Text>
            </View>

            <View style={styles.infoRow}>
              <Text style={styles.label}>Services:</Text>
              <Text style={styles.value}>{lead.servicesOffered}</Text>
            </View>

            <View style={styles.infoRow}>
              <Text style={styles.label}>Status:</Text>
              <Text style={[styles.value, styles.status(lead.status)]}>
                {lead.status}
              </Text>
            </View>
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Add Feedback</Text>
            <TextInput
              style={styles.feedbackInput}
              value={feedbackText}
              onChangeText={setFeedbackText}
              placeholder="Enter your feedback"
              multiline
              editable={!addFeedbackMutation.isLoading}
            />
            <LinearGradient
              colors={themeColor}
              start={startDirectionTheme}
              end={endDirectionTheme}
              style={styles.gradientButton}>
              <TouchableOpacity
                style={styles.addButton}
                onPress={handleAddFeedback}
                disabled={addFeedbackMutation.isLoading || !feedbackText.trim()}>
                {addFeedbackMutation.isPending ? (
                  <ActivityIndicator color="white" />
                ) : (
                  <Text style={styles.buttonText}>Add Feedback</Text>
                )}
              </TouchableOpacity>
            </LinearGradient>
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Feedback History</Text>
            {addFeedbackMutation.isLoading && (
              <ActivityIndicator
                size="small"
                color={themeColor[0]}
                style={styles.loadingIndicator}
              />
            )}
            {lead.feedbacks?.length === 0 ? (
              <Text style={styles.noFeedbackText}>No feedback yet</Text>
            ) : (
              lead.feedbacks?.map(feedback => (
                <View key={feedback._id} style={styles.feedbackItem}>
                  <Text style={styles.feedbackText}>{feedback.message}</Text>
                  <View style={styles.feedbackMeta}>
                    <Text style={styles.feedbackDate}>
                      {moment(feedback.createdAt).format('DD MMM YYYY, hh:mm A')}
                    </Text>
                    {feedback.updatedAt !== feedback.createdAt && (
                      <Text style={styles.feedbackUpdated}>
                        (updated {moment(feedback.updatedAt).fromNow()})
                      </Text>
                    )}
                  </View>
                  <TouchableOpacity
                    style={styles.editButton}
                    onPress={() => handleEditFeedback(feedback)}
                    disabled={updateFeedbackMutation.isLoading}>
                    <Ionicons
                      name="create-outline"
                      size={18}
                      color="#2F80ED"
                    />
                  </TouchableOpacity>
                </View>
              ))
            )}
          </View>
        </ScrollView>

        {/* Edit Feedback Modal */}
        <Modal visible={isEditModalVisible} transparent={true}>
          <View style={styles.modalOverlay}>
            <View style={styles.modalContent}>
              <Text style={styles.modalTitle}>Edit Feedback</Text>
              <TextInput
                style={styles.modalInput}
                value={editFeedbackText}
                onChangeText={setEditFeedbackText}
                multiline
                editable={!updateFeedbackMutation.isLoading}
              />
              <View style={styles.modalButtons}>
                <TouchableOpacity
                  style={styles.cancelButton}
                  onPress={() => setIsEditModalVisible(false)}
                  disabled={updateFeedbackMutation.isLoading}>
                  <Text style={styles.cancelButtonText}>Cancel</Text>
                </TouchableOpacity>
                <LinearGradient
                  colors={themeColor}
                  start={startDirectionTheme}
                  end={endDirectionTheme}
                  style={styles.gradientButton}>
                  <TouchableOpacity
                    style={styles.saveButton}
                    onPress={handleUpdateFeedback}
                    disabled={
                      updateFeedbackMutation.isLoading || !editFeedbackText.trim()
                    }>
                    {updateFeedbackMutation.isPending ? (
                      <ActivityIndicator color="white" />
                    ) : (
                      <Text style={styles.buttonText}>Save</Text>
                    )}
                  </TouchableOpacity>
                </LinearGradient>
              </View>
            </View>
          </View>
        </Modal>
      </SafeAreaView>
    </ThemeWithBg>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: themeColor[0],
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 1,
    backgroundColor: themeColor[0],
  },
  backButton: {
    padding: 8,
  },
  headerTitle: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
  },
  headerRight: {
    width: 24,
  },
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: '#f5f5f5',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f5f5f5',
  },
  section: {
    backgroundColor: 'white',
    borderRadius: 8,
    padding: 16,
    marginBottom: 16,
    elevation: 2,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 12,
    color: '#333',
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  label: {
    fontWeight: '600',
    color: '#555',
    flex: 1,
  },
  value: {
    color: '#333',
    flex: 1,
    textAlign: 'right',
  },
  status: status => ({
    color:
      status === 'New'
        ? '#2F80ED'
        : status === 'In Progress'
        ? '#F2994A'
        : status === 'Converted'
        ? '#27AE60'
        : '#EB5757',
    fontWeight: 'bold',
  }),
  feedbackInput: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 4,
    padding: 12,
    minHeight: 100,
    marginBottom: 12,
    textAlignVertical: 'top',
  },
  gradientButton: {
    borderRadius: 4,
    overflow: 'hidden',
  },
  addButton: {
    paddingVertical: 12,
    alignItems: 'center',
  },
  buttonText: {
    color: 'white',
    fontWeight: 'bold',
  },
  feedbackItem: {
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
    paddingVertical: 12,
    paddingRight: 30,
    position: 'relative',
  },
  feedbackText: {
    marginBottom: 4,
    color: '#333',
  },
  feedbackMeta: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  feedbackDate: {
    fontSize: 12,
    color: '#888',
  },
  feedbackUpdated: {
    fontSize: 12,
    color: '#888',
    marginLeft: 8,
  },
  editButton: {
    position: 'absolute',
    right: 0,
    top: 12,
  },
  noFeedbackText: {
    color: '#888',
    textAlign: 'center',
    paddingVertical: 16,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: 'white',
    width: '90%',
    borderRadius: 8,
    padding: 16,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 16,
  },
  modalInput: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 4,
    padding: 12,
    minHeight: 100,
    marginBottom: 16,
    textAlignVertical: 'top',
  },
  modalButtons: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
  },
  cancelButton: {
    padding: 12,
    marginRight: 8,
  },
  cancelButtonText: {
    color: '#2F80ED',
  },
  saveButton: {
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 4,
  },
  loadingIndicator: {
    marginVertical: 8,
  },
});

export default LeadDetailScreen;