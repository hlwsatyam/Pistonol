// components/AdminTaskAssignment.jsx
import React, { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import axios from '../axiosConfig';

const AdminTaskAssignment = ({EmployeType='company-employee'}) => {
  const [formData, setFormData] = useState({
    employeeId: '',
    month: '',
    targetAmount: '',
    description: ''
  });
  const [successMessage, setSuccessMessage] = useState('');
  
  const queryClient = useQueryClient();

  // Employees fetch karenge
  const { data: employees, isLoading: employeesLoading } = useQuery({
    queryKey: ['employees'],
    queryFn: async () => {
      const response = await axios.get('/auth/byrole/company-employee');
      return response.data;
    }
  });
console.log(employees)
  // Current month set karenge
  useEffect(() => {
    const now = new Date();
    const currentMonth = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
    setFormData(prev => ({ ...prev, month: currentMonth }));
  }, []);

  // Target set karne ka mutation
  const setTargetMutation = useMutation({
    mutationFn: async (targetData) => {
      const response = await axios.post('/targets/set-target', targetData);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['employeesTargets']);
      setSuccessMessage('Target successfully assigned!');
      setFormData({
        employeeId: '',
        month: formData.month,
        targetAmount: '',
        description: ''
      });
      setTimeout(() => setSuccessMessage(''), 3000);
    }
  });

  // All employees targets dekhenge
  const { data: allTargets } = useQuery({
    queryKey: ['employeesTargets'],
    queryFn: async () => {
      const response = await axios.get('/targets/employee-targets');
      return response.data.targets;
    }
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.employeeId || !formData.targetAmount) {
      alert('Please select employee and enter target amount');
      return;
    }

    setTargetMutation.mutate({
      userId: formData.employeeId,
      month: formData.month,
      targetAmount: parseFloat(formData.targetAmount),
      description: formData.description
    });
  };

  const handleInputChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  if (employeesLoading) {
    return <div className="flex justify-center items-center h-64">Loading employees...</div>;
  }

  return (
    <div className="max-w-6xl mx-auto p-6">
      <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
        <h2 className="text-2xl font-bold text-gray-800 mb-2">Assign Monthly Targets</h2>
        <p className="text-gray-600 mb-6">Set sales targets for your employees</p>

        {successMessage && (
          <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded mb-6">
            {successMessage}
          </div>
        )}

        <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Employee Selection */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Select Employee *
            </label>
            <select
              value={formData.employeeId}
              onChange={(e) => handleInputChange('employeeId', e.target.value)}
              className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              required
            >
              <option value="">Choose Employee</option>
              {employees?.map(emp => (
                <option key={emp._id} value={emp._id}>
                  {emp.name} - {emp.username} ({emp.mobile})
                </option>
              ))}
            </select>
          </div>

          {/* Month Selection */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Target Month *
            </label>
            <input
              type="month"
              value={formData.month}
              onChange={(e) => handleInputChange('month', e.target.value)}
              className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              required
            />
          </div>

          {/* Target Amount */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Target Amount (₹) *
            </label>
            <input
              type="number"
              value={formData.targetAmount}
              onChange={(e) => handleInputChange('targetAmount', e.target.value)}
              placeholder="e.g., 1000000"
              className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              required
            />
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Description (Optional)
            </label>
            <input
              type="text"
              value={formData.description}
              onChange={(e) => handleInputChange('description', e.target.value)}
              placeholder="e.g., Quarterly sales target"
              className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>

          {/* Submit Button */}
          <div className="md:col-span-2">
            <button
              type="submit"
              disabled={setTargetMutation.isPending}
              className="w-full bg-blue-600 text-white py-3 px-6 rounded-lg hover:bg-blue-700 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 transition duration-200"
            >
              {setTargetMutation.isPending ? 'Assigning Target...' : 'Assign Target to Employee'}
            </button>
          </div>
        </form>
      </div>

      {/* Current Targets Overview */}
      <div className="bg-white rounded-lg shadow-lg p-6">
        <h3 className="text-xl font-bold text-gray-800 mb-4">Current Month Targets Overview</h3>
        
        {allTargets && allTargets.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full table-auto">
              <thead>
                <tr className="bg-gray-50">
                  <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">Employee</th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">Month</th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">Target</th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">Achieved</th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">Progress</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {allTargets.map(target => (
                  <tr key={target._id} className="hover:bg-gray-50">
                    <td className="px-4 py-3">
                      <div>
                        <p className="font-medium text-gray-900">{target.userId.name}</p>
                        <p className="text-sm text-gray-500">{target.userId.username}</p>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-gray-700">{target.month}</td>
                    <td className="px-4 py-3 font-semibold text-gray-900">
                      ₹{target.targetAmount?.toLocaleString()}
                    </td>
                    <td className="px-4 py-3 font-semibold text-green-600">
                      ₹{target.achievedAmount?.toLocaleString()}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center space-x-2">
                        <div className="w-24 bg-gray-200 rounded-full h-2">
                          <div
                            className="bg-green-600 h-2 rounded-full transition-all duration-300"
                            style={{
                              width: `${Math.min((target.achievedAmount / target.targetAmount) * 100, 100)}%`
                            }}
                          ></div>
                        </div>
                        <span className="text-sm text-gray-600">
                          {((target.achievedAmount / target.targetAmount) * 100).toFixed(1)}%
                        </span>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="text-center py-8 text-gray-500">
            No targets assigned yet. Start by assigning targets to your employees.
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminTaskAssignment;