import React, { useState, useEffect } from 'react';
import axios from '../axiosConfig';

const AdminStoreManager = () => {
  const [employees, setEmployees] = useState([]);
  const [availableStores, setAvailableStores] = useState([]);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [selectedEmployee, setSelectedEmployee] = useState(null);
  const [selectedStores, setSelectedStores] = useState([]);
  const [showAssignModal, setShowAssignModal] = useState(false);

 

  // सभी company employees fetch करें
  const fetchCompanyEmployees = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`/v1/update/stores/company-employees`);
      setEmployees(response.data.employees);
      setMessage('');
    } catch (error) {
      setMessage('Error fetching employees: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  // सभी available stores fetch करें
  const fetchAvailableStores = async () => {
    try {
      const response = await axios.get(`/v1/update/stores/available-stores`);
      setAvailableStores(response.data.stores);
    } catch (error) {
      console.error('Error fetching stores:', error);
    }
  };

  useEffect(() => {
    fetchCompanyEmployees();
    fetchAvailableStores();
  }, []);

  // Employee के stores update करें
  const updateEmployeeStores = async (action) => {
    if (!selectedEmployee || selectedStores.length === 0) {
      setMessage('Please select employee and stores');
      return;
    }

    try {
      setLoading(true);
      const storeIds = selectedStores.map(store => store._id);
      
      const response = await axios.put(
        `/v1/update/stores/employee/${selectedEmployee._id}/stores`,
        {
          storeIds,
          action: action
        }
      );

      setMessage(response.data.message);
      
      // Employees list refresh करें
      fetchCompanyEmployees();
      
      // Modal close करें
      setShowAssignModal(false);
      setSelectedStores([]);
      
      // Message 3 सेकंड बाद clear हो जाए
      setTimeout(() => setMessage(''), 3000);
    } catch (error) {
      setMessage('Error: ' + error.response?.data?.message || error.message);
    } finally {
      setLoading(false);
    }
  };

  // Add stores modal open करें
  const openAddStoresModal = (employee) => {
    setSelectedEmployee(employee);
    setSelectedStores([]);
    setShowAssignModal(true);
  };

  // Remove stores modal open करें (employee के current stores से select करने के लिए)
  const openRemoveStoresModal = (employee) => {
    setSelectedEmployee(employee);
    // Employee के current stores को selectedStores में डालें
    setSelectedStores(employee.stores || []);
    setShowAssignModal(true);
  };

  // Store select/unselect करें
  const toggleStoreSelection = (store) => {
    const isSelected = selectedStores.some(s => s._id === store._id);
    if (isSelected) {
      setSelectedStores(selectedStores.filter(s => s._id !== store._id));
    } else {
      setSelectedStores([...selectedStores, store]);
    }
  };

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-6">Company Employees Store Management</h1>

      {message && (
        <div className={`p-3 mb-4 rounded ${message.includes('Error') ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-700'}`}>
          {message}
        </div>
      )}

      <div className="mb-4">
        <button
          onClick={fetchCompanyEmployees}
          className="bg-blue-500 text-white px-4 py-2 rounded mr-2"
          disabled={loading}
        >
          {loading ? 'Refreshing...' : 'Refresh Employees'}
        </button>
        <button
          onClick={fetchAvailableStores}
          className="bg-gray-500 text-white px-4 py-2 rounded"
        >
          Refresh Stores
        </button>
      </div>

      {/* Employees Table */}
      <div className="overflow-x-auto bg-white rounded-lg shadow">
        <table className="min-w-full">
          <thead className="bg-gray-100">
            <tr>
              <th className="p-3 text-left">Name</th>
              <th className="p-3 text-left">Username</th>
              <th className="p-3 text-left">Email</th>
              <th className="p-3 text-left">Mobile</th>
              <th className="p-3 text-left">Stores Assigned</th>
              <th className="p-3 text-left">Actions</th>
            </tr>
          </thead>
          <tbody>
            {employees.length === 0 ? (
              <tr>
                <td colSpan="6" className="p-3 text-center">
                  {loading ? 'Loading...' : 'No company employees found'}
                </td>
              </tr>
            ) : (
              employees.map(employee => (
                <tr key={employee._id} className="border-b hover:bg-gray-50">
                  <td className="p-3">{employee.name || 'N/A'}</td>
                  <td className="p-3">{employee.username}</td>
                  <td className="p-3">{employee.email || 'N/A'}</td>
                  <td className="p-3">{employee.mobile || 'N/A'}</td>
                  <td className="p-3">
                    <div>
                      <span className="font-semibold">{employee.totalStores} stores</span>
                      {employee.stores && employee.stores.length > 0 && (
                        <div className="mt-1">
                          {employee.stores.map(store => (
                            <span key={store._id} className="inline-block bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded mr-1 mb-1">
                              {store.name}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                  </td>
                  <td className="p-3">
                    <div className="flex space-x-2">
                      <button
                        onClick={() => openAddStoresModal(employee)}
                        className="bg-green-500 text-white px-3 py-1 rounded text-sm"
                      >
                        Add Stores
                      </button>
                      {employee.totalStores > 0 && (
                        <button
                          onClick={() => openRemoveStoresModal(employee)}
                          className="bg-red-500 text-white px-3 py-1 rounded text-sm"
                        >
                          Remove Stores
                        </button>
                      )}
                      <button
                        onClick={() => {
                          setSelectedEmployee(employee);
                          // यहाँ आप employee के stores देखने का separate view show कर सकते हैं
                          alert(`Employee: ${employee.name}\nStore IDs: ${employee.storeIds.join(', ')}`);
                        }}
                        className="bg-blue-500 text-white px-3 py-1 rounded text-sm"
                      >
                        View Details
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Assign/Remove Stores Modal */}
      {showAssignModal && selectedEmployee && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl">
            <div className="p-6">
              <h2 className="text-xl font-bold mb-4">
                Manage Stores for {selectedEmployee.name}
              </h2>
              
              <div className="mb-4">
                <p className="mb-2">Select stores to {selectedStores.length > 0 ? 'remove' : 'add'}:</p>
                <div className="max-h-60 overflow-y-auto border rounded p-2">
                  {availableStores.length === 0 ? (
                    <p className="text-gray-500">No stores available</p>
                  ) : (
                    availableStores.map(store => {
                      const isAssigned = selectedEmployee.stores?.some(s => s._id === store._id);
                      const isSelected = selectedStores.some(s => s._id === store._id);
                      
                      return (
                        <div
                          key={store._id}
                          className={`p-2 mb-1 rounded cursor-pointer ${isSelected ? 'bg-blue-100 border-blue-300' : 'hover:bg-gray-100'}`}
                          onClick={() => toggleStoreSelection(store)}
                        >
                          <div className="flex justify-between items-center">
                            <div>
                              <span className="font-medium">{store.name}</span>
                              <span className="text-sm text-gray-600 ml-2">({store.location})</span>
                            </div>
                            <div className="flex items-center">
                              {isAssigned && (
                                <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded mr-2">
                                  Currently Assigned
                                </span>
                              )}
                              {isSelected ? (
                                <span className="text-blue-500">✓ Selected</span>
                              ) : (
                                <span className="text-gray-400">Click to select</span>
                              )}
                            </div>
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>
                <p className="text-sm text-gray-600 mt-2">
                  Selected: {selectedStores.length} store(s)
                </p>
              </div>

              <div className="flex justify-end space-x-3">
                <button
                  onClick={() => setShowAssignModal(false)}
                  className="px-4 py-2 border rounded"
                  disabled={loading}
                >
                  Cancel
                </button>
                
                {selectedStores.length > 0 ? (
                  <>
                    <button
                      onClick={() => updateEmployeeStores('add')}
                      className="px-4 py-2 bg-green-500 text-white rounded"
                      disabled={loading}
                    >
                      {loading ? 'Adding...' : 'Add Selected Stores'}
                    </button>
                    <button
                      onClick={() => updateEmployeeStores('remove')}
                      className="px-4 py-2 bg-red-500 text-white rounded"
                      disabled={loading}
                    >
                      {loading ? 'Removing...' : 'Remove Selected Stores'}
                    </button>
                  </>
                ) : (
                  <button
                    onClick={() => {
                      if (window.confirm('Clear all stores from this employee?')) {
                        updateEmployeeStores('remove');
                      }
                    }}
                    className="px-4 py-2 bg-yellow-500 text-white rounded"
                    disabled={loading}
                  >
                    Clear All Stores
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminStoreManager;