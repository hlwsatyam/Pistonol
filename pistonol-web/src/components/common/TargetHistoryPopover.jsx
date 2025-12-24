import React, { useState, useEffect, useRef } from 'react';
import axios from '../../axiosConfig';

const TargetHistoryPopover = ({ userId, month, userName, targetAmount }) => {
  const [showPopover, setShowPopover] = useState(false);
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const popoverRef = useRef(null);

  // Fetch history when popover opens
  useEffect(() => {
    if (showPopover && userId) {
      fetchHistory();
    }
  }, [showPopover, userId, month]);

  // Close popover when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (popoverRef.current && !popoverRef.current.contains(event.target)) {
        setShowPopover(false);
      }
    };

    if (showPopover) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showPopover]);

  const fetchHistory = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const params = { month };
      const response = await axios.get(`/targets/history/${userId}`, { params });
      
      if (response.data.success) {
        setHistory(response.data.history || []);
      }
    } catch (err) {
      console.error('Error fetching target history:', err);
      setError('Failed to load history');
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-IN', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const calculateProgress = (currentTarget, history) => {
    if (!history || history.length === 0) return '0%';
    
    const latestHistory = history[0]; // Latest change
    if (currentTarget === latestHistory.targetAmount) return '100%';
    
    const percentage = (currentTarget / latestHistory.targetAmount) * 100;
    return `${Math.min(percentage, 100).toFixed(1)}%`;
  };

  const handleTogglePopover = (e) => {
    e.stopPropagation();
    setShowPopover(!showPopover);
  };

  return (
    <div className="relative inline-block" ref={popoverRef}>
      {/* Click trigger area */}
      <div
        className="relative"
        onClick={handleTogglePopover}
      >
        {/* Main content that triggers popover */}
        <div className="cursor-pointer inline-flex items-center space-x-1 text-blue-600 hover:text-blue-800">
          <span className="font-semibold">₹{targetAmount?.toLocaleString()}</span>
          <svg 
            className={`w-4 h-4 transition-transform ${showPopover ? 'rotate-180' : ''}`}
            fill="none" 
            stroke="currentColor" 
            viewBox="0 0 24 24"
          >
            <path 
              strokeLinecap="round" 
              strokeLinejoin="round" 
              strokeWidth={2} 
              d="M19 9l-7 7-7-7" 
            />
          </svg>
        </div>

        {/* Popover */}
        {showPopover && (
          <div 
            className="fixed z-50 w-96 bg-white rounded-lg shadow-xl border border-gray-200"
            style={{
              // Position popover relative to the trigger element
              top: '50%',
              left: '50%',
              transform: 'translate(-50%, -50%)',
              maxHeight: '80vh',
              maxWidth: '90vw'
            }}
          >
            <div className="p-4">
              {/* Header with close button */}
              <div className="flex items-center justify-between mb-4 pb-3 border-b border-gray-100">
                <div>
                  <h4 className="font-bold text-gray-800">Target History</h4>
                  <p className="text-sm text-gray-600">
                    {userName} - {month}
                  </p>
                </div>
                <button
                  onClick={() => setShowPopover(false)}
                  className="text-gray-400 hover:text-gray-600 p-1 rounded-full hover:bg-gray-100"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              <div className="mt-2 flex items-center justify-between bg-blue-50 p-3 rounded-lg mb-4">
                <div>
                  <span className="text-sm text-gray-600">Current Target:</span>
                  <p className="font-semibold text-blue-700 text-lg">
                    ₹{targetAmount?.toLocaleString()}
                  </p>
                </div>
                <div className="text-right">
                  <span className="text-sm text-gray-600">Total Updates:</span>
                  <p className="font-semibold text-gray-800">{history.length}</p>
                </div>
              </div>

              {/* Loading State */}
              {loading && (
                <div className="py-8 text-center">
                  <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-600 mx-auto"></div>
                  <p className="text-gray-500 mt-3">Loading history...</p>
                </div>
              )}

              {/* Error State */}
              {error && !loading && (
                <div className="py-6 text-center">
                  <svg 
                    className="w-12 h-12 text-red-400 mx-auto mb-3" 
                    fill="none" 
                    stroke="currentColor" 
                    viewBox="0 0 24 24"
                  >
                    <path 
                      strokeLinecap="round" 
                      strokeLinejoin="round" 
                      strokeWidth={2} 
                      d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" 
                    />
                  </svg>
                  <p className="text-red-500 mb-3">{error}</p>
                  <button
                    onClick={fetchHistory}
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
                  >
                    Try Again
                  </button>
                </div>
              )}

              {/* History List */}
              {!loading && !error && (
                <div className="space-y-3 max-h-96 overflow-y-auto pr-2">
                  {history.length > 0 ? (
                    <div className="space-y-3">
                      {history.map((record, index) => (
                        <div 
                          key={record._id || index}
                          className={`p-4 rounded-lg transition-all duration-200 ${
                            index === 0 
                              ? 'bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 shadow-sm' 
                              : 'bg-gray-50 border border-gray-100 hover:bg-gray-100'
                          }`}
                        >
                          <div className="flex justify-between items-start mb-2">
                            <div className="flex-1">
                              <div className="flex items-center justify-between mb-2">
                                <div className="flex items-center space-x-3">
                                  <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                                    index === 0 ? 'bg-blue-100' : 'bg-gray-200'
                                  }`}>
                                    <span className={`font-bold ${index === 0 ? 'text-blue-700' : 'text-gray-700'}`}>
                                      ₹
                                    </span>
                                  </div>
                                  <div>
                                    <p className="text-lg font-bold text-gray-900">
                                      ₹{record.targetAmount?.toLocaleString()}
                                    </p>
                                    <p className="text-xs text-gray-500">
                                      {formatDate(record.changedAt)}
                                    </p>
                                  </div>
                                </div>
                                {index === 0 && (
                                  <span className="text-xs font-semibold bg-blue-600 text-white px-3 py-1 rounded-full">
                                    CURRENT
                                  </span>
                                )}
                              </div>
                            </div>
                          </div>

                          {/* Change indicator and progress */}
                          <div className="mt-3 pt-3 border-t border-gray-200">
                            {index < history.length - 1 ? (
                              <div className="flex items-center justify-between">
                                <div className="flex items-center">
                                  <svg 
                                    className={`w-4 h-4 mr-2 ${
                                      record.targetAmount > history[index + 1]?.targetAmount 
                                        ? 'text-green-500' 
                                        : 'text-red-500'
                                    }`}
                                    fill="none" 
                                    stroke="currentColor" 
                                    viewBox="0 0 24 24"
                                  >
                                    <path 
                                      strokeLinecap="round" 
                                      strokeLinejoin="round" 
                                      strokeWidth={2} 
                                      d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" 
                                    />
                                  </svg>
                                  <span className="text-sm font-medium">
                                    {record.targetAmount > history[index + 1]?.targetAmount 
                                      ? 'Increased' 
                                      : 'Decreased'} by 
                                    <span className="ml-1 font-bold">
                                      ₹{Math.abs(record.targetAmount - history[index + 1]?.targetAmount).toLocaleString()}
                                    </span>
                                  </span>
                                </div>
                                <div className="text-sm text-gray-500">
                                  From ₹{history[index + 1]?.targetAmount?.toLocaleString()}
                                </div>
                              </div>
                            ) : (
                              <div className="text-center text-sm text-gray-500 italic">
                                Initial target assignment
                              </div>
                            )}
                          </div>

                          {/* Progress bar for current vs this record */}
                          {index === 0 && targetAmount && history.length > 1 && (
                            <div className="mt-4">
                              <div className="flex justify-between text-xs text-gray-600 mb-1">
                                <span>Progress from previous target</span>
                                <span className="font-semibold">
                                  {calculateProgress(targetAmount, history)}
                                </span>
                              </div>
                              <div className="w-full bg-gray-200 rounded-full h-2">
                                <div 
                                  className="bg-gradient-to-r from-green-400 to-green-600 h-2 rounded-full transition-all duration-500"
                                  style={{
                                    width: calculateProgress(targetAmount, history)
                                  }}
                                ></div>
                              </div>
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="py-10 text-center">
                      <svg 
                        className="w-20 h-20 text-gray-300 mx-auto mb-4" 
                        fill="none" 
                        stroke="currentColor" 
                        viewBox="0 0 24 24"
                      >
                        <path 
                          strokeLinecap="round" 
                          strokeLinejoin="round" 
                          strokeWidth={2} 
                          d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" 
                        />
                      </svg>
                      <h4 className="text-lg font-semibold text-gray-500 mb-2">No History Found</h4>
                      <p className="text-gray-400 max-w-xs mx-auto">
                        This target has not been modified yet. All changes will be tracked here.
                      </p>
                    </div>
                  )}
                </div>
              )}

              {/* Footer with summary */}
              {history.length > 0 && (
                <div className="mt-6 pt-4 border-t border-gray-200">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="text-center">
                      <div className="text-sm text-gray-600">Highest Target</div>
                      <div className="text-lg font-bold text-green-600">
                        ₹{Math.max(...history.map(h => h.targetAmount)).toLocaleString()}
                      </div>
                    </div>
                    <div className="text-center">
                      <div className="text-sm text-gray-600">Lowest Target</div>
                      <div className="text-lg font-bold text-red-600">
                        ₹{Math.min(...history.map(h => h.targetAmount)).toLocaleString()}
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Backdrop overlay */}
      {showPopover && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-40"
          onClick={() => setShowPopover(false)}
        />
      )}
    </div>
  );
};

export default TargetHistoryPopover;