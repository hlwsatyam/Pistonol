import React, { useState, useEffect } from 'react';
import axios from '../axiosConfig';
import { toast, Toaster } from 'react-hot-toast';
import { format } from 'date-fns';

const NotificationCreate = () => {
  const [formData, setFormData] = useState({
    userId: '',
    title: '',
    message: '',
    type: 'info'
  });
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [filteredEmployees, setFilteredEmployees] = useState([]);
  const [showDropdown, setShowDropdown] = useState(false);
  const [fetchingEmployees, setFetchingEmployees] = useState(true);
  
  // New state for notifications
  const [notifications, setNotifications] = useState([]);
  const [loadingNotifications, setLoadingNotifications] = useState(true);
  const [selectedNotification, setSelectedNotification] = useState(null);
  const [showNotificationModal, setShowNotificationModal] = useState(false);
  const [deletingNotification, setDeletingNotification] = useState(false);

  // Fetch company employees
  useEffect(() => {
    fetchCompanyEmployees();
    fetchRecentNotifications();
  }, []);

  // Filter employees based on search
  useEffect(() => {
    if (searchTerm.trim() === '') {
      setFilteredEmployees(employees);
    } else {
      const filtered = employees.filter(emp =>
        emp.username?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        emp.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        emp.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        emp.mobile?.includes(searchTerm) ||
        emp._id.includes(searchTerm)
      );
      setFilteredEmployees(filtered);
    }
  }, [searchTerm, employees]);

  const fetchCompanyEmployees = async () => {
    try {
      setFetchingEmployees(true);
      const response = await axios.get('/auth/byrole/company-employee');
      
      if (Array.isArray(response.data)) {
        setEmployees(response.data);
        setFilteredEmployees(response.data);
      } else {
        setEmployees(response.data.data || []);
        setFilteredEmployees(response.data.data || []);
      }
    } catch (error) {
      console.error('Error fetching employees:', error);
      toast.error('Failed to load employees');
      setEmployees([]);
      setFilteredEmployees([]);
    } finally {
      setFetchingEmployees(false);
    }
  };

  const fetchRecentNotifications = async () => {
    try {
      setLoadingNotifications(true);
      const response = await axios.get('/notifications/recent');
      
      if (response.data.success) {
        setNotifications(response.data.data || []);
      }
    } catch (error) {
      console.error('Error fetching notifications:', error);
      toast.error('Failed to load recent notifications');
    } finally {
      setLoadingNotifications(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSelectEmployee = (employee) => {
    setFormData(prev => ({
      ...prev,
      userId: employee._id
    }));
    setSearchTerm(employee.username || employee.name || '');
    setShowDropdown(false);
  };

  const handleClearSelection = () => {
    setFormData(prev => ({
      ...prev,
      userId: ''
    }));
    setSearchTerm('');
    setShowDropdown(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.userId || !formData.title || !formData.message) {
      toast.error('Please fill all required fields');
      return;
    }

    setLoading(true);
    try {
      const response = await axios.post('/notifications/create', formData);
      
      if (response.data.success) {
        toast.success('Notification created successfully');
        
        // Reset form
        setFormData({
          userId: '',
          title: '',
          message: '',
          type: 'info'
        });
        setSearchTerm('');
        
        // Refresh notifications list
        fetchRecentNotifications();
      }
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to create notification');
    } finally {
      setLoading(false);
    }
  };

  const handleSearchFocus = () => {
    setShowDropdown(true);
  };

  const handleSearchBlur = () => {
    setTimeout(() => setShowDropdown(false), 200);
  };

  const handleViewNotification = (notification) => {
    setSelectedNotification(notification);
    setShowNotificationModal(true);
  };

  const handleDeleteNotification = async (notificationId) => {
    if (!window.confirm('Are you sure you want to delete this notification?')) {
      return;
    }

    setDeletingNotification(true);
    try {
      const response = await axios.delete(`/notifications/${notificationId}`);
      
      if (response.data.success) {
        toast.success('Notification deleted successfully');
        
        // Remove from local state
        setNotifications(prev => prev.filter(notif => notif._id !== notificationId));
        
        // Close modal if open
        if (selectedNotification && selectedNotification._id === notificationId) {
          setShowNotificationModal(false);
          setSelectedNotification(null);
        }
      }
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to delete notification');
    } finally {
      setDeletingNotification(false);
    }
  };

  const formatDate = (dateString) => {
    try {
      const date = new Date(dateString);
      return format(date, 'dd MMM yyyy, hh:mm a');
    } catch (error) {
      return dateString;
    }
  };

  const getTypeColor = (type) => {
    const colors = {
      info: { bg: 'bg-blue-100', text: 'text-blue-800', border: 'border-blue-200' },
      warning: { bg: 'bg-yellow-100', text: 'text-yellow-800', border: 'border-yellow-200' },
      success: { bg: 'bg-green-100', text: 'text-green-800', border: 'border-green-200' },
      error: { bg: 'bg-red-100', text: 'text-red-800', border: 'border-red-200' }
    };
    return colors[type] || colors.info;
  };

  const getEmployeeDisplayName = (userId) => {
    console.log(userId)
    console.log(employees)
    const employee = employees.find(e => e._id === userId._id);
    if (!employee) return 'Unknown Employee';
    
    if (employee.username) return employee.username;
    if (employee.name) return employee.name;
    return 'Employee';
  };

  const getEmployeeInfo = (userId) => {
    const employee = employees.find(e => e._id === userId);
    if (!employee) return { email: '', mobile: '' };
    
    return {
      email: employee.email || 'No email',
      mobile: employee.mobile || 'No mobile'
    };
  };

  const getTypeIcon = (type) => {
    const icons = {
      info: 'ℹ️',
      warning: '⚠️',
      success: '✅',
      error: '❌'
    };
    return icons[type] || 'ℹ️';
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4 sm:px-6 lg:px-8">
      <Toaster 
        position="top-right"
        toastOptions={{
          duration: 3000,
          style: {
            background: '#363636',
            color: '#fff',
          },
          success: {
            duration: 3000,
            theme: {
              primary: 'green',
              secondary: 'black',
            },
          },
        }}
      />
      
      {/* Notification Detail Modal */}
      {showNotificationModal && selectedNotification && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl shadow-xl max-w-lg w-full max-h-[90vh] overflow-hidden">
            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-xl font-bold text-gray-800">Notification Details</h3>
                <button
                  onClick={() => {
                    setShowNotificationModal(false);
                    setSelectedNotification(null);
                  }}
                  className="text-gray-400 hover:text-gray-600 transition"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
              
              <div className="space-y-4">
                <div>
                  <label className="text-sm font-medium text-gray-500">Title</label>
                  <p className="text-lg font-semibold text-gray-800 mt-1">{selectedNotification.title}</p>
                </div>
                
                <div>
                  <label className="text-sm font-medium text-gray-500">Message</label>
                  <p className="text-gray-700 mt-1 whitespace-pre-wrap">{selectedNotification.message}</p>
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium text-gray-500">Type</label>
                    <div className="flex items-center mt-1">
                      <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${getTypeColor(selectedNotification.type).bg} ${getTypeColor(selectedNotification.type).text}`}>
                        <span className="mr-2">{getTypeIcon(selectedNotification.type)}</span>
                        {selectedNotification.type.charAt(0).toUpperCase() + selectedNotification.type.slice(1)}
                      </span>
                    </div>
                  </div>
                  
                  <div>
                    <label className="text-sm font-medium text-gray-500">Status</label>
                    <div className="mt-1">
                      <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${selectedNotification.isRead ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}`}>
                        {selectedNotification.isRead ? 'Read by User' : 'Unread'}
                      </span>
                    </div>
                  </div>
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium text-gray-500">Sent To</label>
                    <p className="text-gray-700 mt-1 font-medium">
                      {getEmployeeDisplayName(selectedNotification.userId)}
                    </p>
                    <p className="text-sm text-gray-500 mt-1">
                      {getEmployeeInfo(selectedNotification.userId).email}
                    </p>
                  </div>
                  
                  <div>
                    <label className="text-sm font-medium text-gray-500">Sent On</label>
                    <p className="text-gray-700 mt-1">{formatDate(selectedNotification.createdAt)}</p>
                  </div>
                </div>
                
                {selectedNotification.isRead && selectedNotification.readAt && (
                  <div>
                    <label className="text-sm font-medium text-gray-500">Read On</label>
                    <p className="text-gray-700 mt-1">{formatDate(selectedNotification.readAt)}</p>
                  </div>
                )}
              </div>
              
              <div className="flex justify-end space-x-3 mt-6 pt-6 border-t">
                <button
                  onClick={() => {
                    setShowNotificationModal(false);
                    setSelectedNotification(null);
                  }}
                  className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition"
                >
                  Close
                </button>
                <button
                  onClick={() => handleDeleteNotification(selectedNotification._id)}
                  disabled={deletingNotification}
                  className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {deletingNotification ? 'Deleting...' : 'Delete Notification'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
      
      <div className="max-w-7xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column - Create Notification Form */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-xl shadow-lg p-6">
              <div className="mb-6">
                <h2 className="text-2xl font-bold text-gray-800">Create Notification</h2>
                <p className="text-gray-600 mt-2">Send notifications to company employees</p>
              </div>

              <form onSubmit={handleSubmit}>
                {/* Employee Selection */}
                <div className="mb-6">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Select Employee *
                  </label>
                  <div className="relative">
                    <div className="flex items-center">
                      <input
                        type="text"
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition"
                        placeholder="Search employee by name, username, email or mobile..."
                        value={searchTerm}
                        onChange={(e) => {
                          setSearchTerm(e.target.value);
                          setShowDropdown(true);
                        }}
                        onFocus={handleSearchFocus}
                        onBlur={handleSearchBlur}
                      />
                      {fetchingEmployees && (
                        <div className="ml-3">
                          <svg className="animate-spin h-5 w-5 text-blue-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                          </svg>
                        </div>
                      )}
                    </div>
                    
                    {formData.userId && (
                      <div className="mt-3 flex items-center justify-between bg-blue-50 border border-blue-200 rounded-lg p-3">
                        <div className="flex items-center">
                          <div className="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center mr-3">
                            <span className="text-white font-bold text-lg">
                              {employees.find(e => e._id === formData.userId)?.username?.charAt(0)?.toUpperCase() || 
                               employees.find(e => e._id === formData.userId)?.name?.charAt(0)?.toUpperCase() || 'U'}
                            </span>
                          </div>
                          <div>
                            <span className="font-medium text-gray-800">
                              {employees.find(e => e._id === formData.userId)?.username || 
                               employees.find(e => e._id === formData.userId)?.name || 'Unknown User'}
                            </span>
                            <p className="text-sm text-gray-600">
                              {employees.find(e => e._id === formData.userId)?.email || 
                               employees.find(e => e._id === formData.userId)?.mobile || 
                               'No contact info'}
                            </p>
                          </div>
                        </div>
                        <button 
                          type="button" 
                          className="text-red-500 hover:text-red-700 p-1 rounded-full hover:bg-red-50 transition"
                          onClick={handleClearSelection}
                        >
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                          </svg>
                        </button>
                      </div>
                    )}

                    {showDropdown && searchTerm && !formData.userId && (
                      <div className="absolute z-10 w-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg max-h-64 overflow-y-auto">
                        {filteredEmployees.length > 0 ? (
                          <div>
                            {filteredEmployees.map(employee => (
                              <div
                                key={employee._id}
                                className="px-4 py-3 hover:bg-gray-50 cursor-pointer border-b border-gray-100 last:border-b-0 transition"
                                onClick={() => handleSelectEmployee(employee)}
                              >
                                <div className="flex items-center justify-between">
                                  <div className="flex items-center">
                                    <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center mr-3">
                                      <span className="text-blue-600 font-bold text-lg">
                                        {employee.username?.charAt(0)?.toUpperCase() || 
                                         employee.name?.charAt(0)?.toUpperCase() || 'U'}
                                      </span>
                                    </div>
                                    <div>
                                      <div className="font-medium text-gray-800">
                                        {employee.username || employee.name || 'Unknown'}
                                      </div>
                                      <div className="text-sm text-gray-600">
                                        {employee.email && <span>{employee.email}</span>}
                                        {employee.mobile && <span>{employee.email ? ' • ' : ''}{employee.mobile}</span>}
                                        {!employee.email && !employee.mobile && <span className="text-gray-400">No contact info</span>}
                                      </div>
                                    </div>
                                  </div>
                                  <div className="flex flex-col items-end">
                                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800 mb-1">
                                      {employee.role || 'company-employee'}
                                    </span>
                                  </div>
                                </div>
                              </div>
                            ))}
                          </div>
                        ) : fetchingEmployees ? (
                          <div className="px-4 py-8 text-center text-gray-500">
                            <svg className="animate-spin h-8 w-8 mx-auto text-blue-500 mb-3" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                            </svg>
                            Loading employees...
                          </div>
                        ) : (
                          <div className="px-4 py-8 text-center text-gray-500">
                            <svg className="w-12 h-12 mx-auto text-gray-300 mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                            No employees found
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                </div>

                {/* Title */}
                <div className="mb-6">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Title *
                  </label>
                  <input
                    type="text"
                    name="title"
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition"
                    value={formData.title}
                    onChange={handleChange}
                    placeholder="Enter notification title"
                    maxLength="100"
                  />
                  <div className="mt-1 text-right text-sm text-gray-500">
                    {formData.title.length}/100
                  </div>
                </div>

                {/* Message */}
                <div className="mb-6">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Message *
                  </label>
                  <textarea
                    name="message"
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition resize-none"
                    value={formData.message}
                    onChange={handleChange}
                    placeholder="Enter notification message"
                    rows="4"
                    maxLength="500"
                  />
                  <div className="mt-1 flex justify-between text-sm text-gray-500">
                    <span>Maximum 500 characters</span>
                    <span>{formData.message.length}/500</span>
                  </div>
                </div>

                {/* Type Selection */}
                <div className="mb-6">
                  <label className="block text-sm font-medium text-gray-700 mb-3">
                    Notification Type
                  </label>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                    {[
                      { value: 'info', label: 'Information', color: 'bg-blue-500', textColor: 'text-blue-600' },
                      { value: 'warning', label: 'Warning', color: 'bg-yellow-500', textColor: 'text-yellow-600' },
                      { value: 'success', label: 'Success', color: 'bg-green-500', textColor: 'text-green-600' },
                      { value: 'error', label: 'Error', color: 'bg-red-500', textColor: 'text-red-600' }
                    ].map(type => (
                      <label
                        key={type.value}
                        className={`
                          flex items-center p-3 border-2 rounded-lg cursor-pointer transition-all
                          ${formData.type === type.value 
                            ? 'border-blue-500 bg-blue-50' 
                            : 'border-gray-200 hover:border-gray-300'
                          }
                        `}
                      >
                        <input
                          type="radio"
                          name="type"
                          value={type.value}
                          checked={formData.type === type.value}
                          onChange={handleChange}
                          className="sr-only"
                        />
                        <div className={`w-5 h-5 rounded-full border mr-3 flex items-center justify-center
                          ${formData.type === type.value ? 'border-blue-500' : 'border-gray-300'}
                        `}>
                          {formData.type === type.value && (
                            <div className={`w-3 h-3 rounded-full ${type.color}`}></div>
                          )}
                        </div>
                        <span className={`font-medium ${formData.type === type.value ? type.textColor : 'text-gray-700'}`}>
                          {type.label}
                        </span>
                      </label>
                    ))}
                  </div>
                </div>

                {/* Submit Button */}
                <div className="pt-4">
                  <button
                    type="submit"
                    disabled={loading || !formData.userId}
                    className={`
                      w-full py-3 px-4 rounded-lg font-medium text-white transition
                      ${loading || !formData.userId
                        ? 'bg-blue-400 cursor-not-allowed' 
                        : 'bg-blue-600 hover:bg-blue-700 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2'
                      }
                    `}
                  >
                    {loading ? (
                      <div className="flex items-center justify-center">
                        <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        Creating Notification...
                      </div>
                    ) : (
                      <div className="flex items-center justify-center">
                        <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                        </svg>
                        {!formData.userId ? 'Select an Employee First' : 'Create Notification'}
                      </div>
                    )}
                  </button>
                </div>
              </form>
            </div>
          </div>

          {/* Right Column - Recent Notifications */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-xl shadow-lg p-6 h-full">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h3 className="text-xl font-bold text-gray-800">Recent Notifications</h3>
                  <p className="text-sm text-gray-500 mt-1">Sent by you</p>
                </div>
                <button 
                  className="text-blue-600 hover:text-blue-800 font-medium text-sm flex items-center transition"
                  onClick={fetchRecentNotifications}
                  disabled={loadingNotifications}
                >
                  <svg className={`w-4 h-4 mr-1 ${loadingNotifications ? 'animate-spin' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                  </svg>
                  Refresh
                </button>
              </div>
              
              <div className="space-y-4">
                {loadingNotifications ? (
                  <div className="text-center py-8">
                    <svg className="animate-spin h-8 w-8 mx-auto text-blue-500 mb-3" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    <p className="text-gray-500">Loading notifications...</p>
                  </div>
                ) : notifications.length === 0 ? (
                  <div className="text-center py-8 text-gray-400">
                    <div className="w-16 h-16 mx-auto mb-4 bg-gray-100 rounded-full flex items-center justify-center">
                      <svg className="w-8 h-8 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                      </svg>
                    </div>
                    <p className="text-gray-500">No notifications sent yet</p>
                    <p className="text-sm text-gray-400 mt-1">Create your first notification above</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {notifications.map(notification => (
                      <div
                        key={notification._id}
                        className={`p-4 border rounded-lg transition hover:shadow-md cursor-pointer ${getTypeColor(notification.type).border}`}
                        onClick={() => handleViewNotification(notification)}
                      >
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="flex items-center justify-between mb-2">
                              <span className={`inline-flex items-center px-2 py-1 rounded text-xs font-medium ${getTypeColor(notification.type).bg} ${getTypeColor(notification.type).text}`}>
                                <span className="mr-1">{getTypeIcon(notification.type)}</span>
                                {notification.type}
                              </span>
                              <span className={`text-xs px-2 py-1 rounded ${notification.isRead ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}`}>
                                {notification.isRead ? 'Read' : 'Unread'}
                              </span>
                            </div>
                            
                            <h4 className="font-semibold text-gray-800 mb-1 line-clamp-1">{notification.title}</h4>
                            <p className="text-sm text-gray-600 mb-2 line-clamp-2">{notification.message}</p>
                            
                            <div className="flex items-center justify-between text-xs text-gray-500">
                              <span>To: {getEmployeeDisplayName(notification.userId)}</span>
                              <span>{formatDate(notification.createdAt)}</span>
                            </div>
                          </div>
                          
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleDeleteNotification(notification._id);
                            }}
                            className="ml-2 text-gray-400 hover:text-red-500 transition"
                            title="Delete notification"
                          >
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                            </svg>
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
              
              {notifications.length > 0 && (
                <div className="mt-6 pt-6 border-t">
                  <div className="flex items-center justify-between text-sm text-gray-600">
                    <span>Total: {notifications.length} notifications</span>
                    <div className="flex items-center">
                      <div className="flex items-center mr-4">
                        <div className="w-3 h-3 bg-green-100 border border-green-300 rounded mr-1"></div>
                        <span>Read: {notifications.filter(n => n.isRead).length}</span>
                      </div>
                      <div className="flex items-center">
                        <div className="w-3 h-3 bg-yellow-100 border border-yellow-300 rounded mr-1"></div>
                        <span>Unread: {notifications.filter(n => !n.isRead).length}</span>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default NotificationCreate;