import React, { useState } from 'react';
import axios from '../axiosConfig';
import { Toaster, toast } from 'react-hot-toast';

const SetCompanyPassword = () => {
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    if (!password) {
      toast.error('Password required');
      return;
    }

    try {
      setLoading(true);

      const res = await axios.put(
        '/auth/set-company-password',
        { newPassword: password }
      );

      toast.success(res.data.message || 'Password updated');

      setPassword('');
    } catch (err) {
      toast.error(
        err.response?.data?.message || 'Something went wrong'
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ maxWidth: 320, margin: '40px auto' }}>
      <Toaster position="top-right" />

      <h3>Set Pistonol Password</h3>

      <input
        type="text"
        placeholder="New Password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        style={{
          width: '100%',
          padding: '10px',
          marginBottom: '10px'
        }}
      />

      <button
        onClick={handleSubmit}
        disabled={loading}
        style={{
          width: '100%',
          padding: '10px',
          cursor: 'pointer'
        }}
      >
        {loading ? 'Updating...' : 'Update Password'}
      </button>
    </div>
  );
};

export default SetCompanyPassword;
