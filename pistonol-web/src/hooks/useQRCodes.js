 
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import axios from '../axiosConfig';
import { toast } from 'react-hot-toast';

const API_URL = '/qrcodes';

// Fetch all QR codes
export function useQRCodes(filters = {}) {
  const { page, limit, search, status, batch } = filters;
  
  return useQuery({
    queryKey: ['qrcodes', filters],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (page) params.append('page', page);
      if (limit) params.append('limit', limit);
      if (search) params.append('search', search);
      if (status) params.append('status', status);
      if (batch) params.append('batch', batch);
      
      const { data } = await axios.get(`${API_URL}?${params.toString()}`);
      return data;
    },
    onError: (error) => {
      toast.error(`Failed to fetch QR codes: ${error?.response?.data?.message || error.message}`);
    },
    retry:false,
    keepPreviousData: true, // Keep previous data while fetching new data
  });
}

// Generate new QR codes
export function useGenerateQRCodes() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (qrData) => axios.post(API_URL, qrData),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['qrcodes'] });
      toast.success('QR Code generated successfully!');
    },
    onError: (error) => {
      toast.error(`Failed to generate QR code: ${error?.response?.data?.message || error.message}`);
    },
  });
}

// Update a QR code
export function useUpdateQRCode() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, qrData }) => axios.put(`${API_URL}/${id}`, qrData),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['qrcodes'] });
      toast.success('QR Code updated successfully!');
    },
    onError: (error) => {
      toast.error(`Failed to update QR code: ${error?.response?.data?.message || error.message}`);
    },
  });
}

// Delete a QR code
export function useDeleteQRCode() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id) => axios.delete(`${API_URL}/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['qrcodes'] });
      toast.success('QR Code deleted successfully!');
    },
    onError: (error) => {
      toast.error(`Failed to delete QR code: ${error?.response?.data?.message || error.message}`);
    },
  });
}
