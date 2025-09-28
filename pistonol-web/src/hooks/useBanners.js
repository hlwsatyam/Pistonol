import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import axios from '../axiosConfig';
import { toast } from 'react-hot-toast';

const API_URL = '/banners';

// Fetch all banners
export function useBanners() {
  return useQuery({
    queryKey: ['banners'],
    queryFn: async () => {
      const { data } = await axios.get(API_URL);
      return data;
    },
    onError: (error) => {
      toast.error(`Failed to fetch banners: ${error?.response?.data?.message || error.message}`);
    },
  });
}

// Fetch active banners
export function useActiveBanners() {
  return useQuery({
    queryKey: ['activeBanners'],
    queryFn: async () => {
      const { data } = await axios.get(`${API_URL}/active`);
      return data;
    },
    onError: (error) => {
      console.error('Failed to fetch active banners:', error);
    },
  });
}

// Create new banner
export function useCreateBanner() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (bannerData) => axios.post(API_URL, bannerData),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['banners'] });
      toast.success('Banner created successfully!');
    },
    onError: (error) => {
      toast.error(`Failed to create banner: ${error?.response?.data?.message || error.message}`);
    },
  });
}

// Update a banner
export function useUpdateBanner() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, bannerData }) => axios.put(`${API_URL}/${id}`, bannerData),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['banners'] });
      toast.success('Banner updated successfully!');
    },
    onError: (error) => {
      toast.error(`Failed to update banner: ${error?.response?.data?.message || error.message}`);
    },
  });
}

// Delete a banner
export function useDeleteBanner() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id) => axios.delete(`${API_URL}/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['banners'] });
      toast.success('Banner deleted successfully!');
    },
    onError: (error) => {
      toast.error(`Failed to delete banner: ${error?.response?.data?.message || error.message}`);
    },
  });
}