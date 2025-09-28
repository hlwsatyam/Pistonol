import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import axios from '../axiosConfig';
import { toast } from 'react-hot-toast';

const API_URL = '/marquees';

// Fetch all marquees
export function useMarquees() {
  return useQuery({
    queryKey: ['marquees'],
    queryFn: async () => {
      const { data } = await axios.get(API_URL);
      return data;
    },
    onError: (error) => {
      toast.error(`Failed to fetch marquees: ${error?.response?.data?.message || error.message}`);
    },
  });
}

// Fetch active marquee
export function useActiveMarquee() {
  return useQuery({
    queryKey: ['activeMarquee'],
    queryFn: async () => {
      const { data } = await axios.get(`${API_URL}/active`);
      return data;
    },
    onError: (error) => {
      console.error('Failed to fetch active marquee:', error);
    },
  });
}

// Create new marquee
export function useCreateMarquee() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (marqueeData) => axios.post(API_URL, marqueeData),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['marquees'] });
      toast.success('Marquee created successfully!');
    },
    onError: (error) => {
      toast.error(`Failed to create marquee: ${error?.response?.data?.message || error.message}`);
    },
  });
}

// Update a marquee
export function useUpdateMarquee() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, marqueeData }) => axios.put(`${API_URL}/${id}`, marqueeData),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['marquees'] });
      toast.success('Marquee updated successfully!');
    },
    onError: (error) => {
      toast.error(`Failed to update marquee: ${error?.response?.data?.message || error.message}`);
    },
  });
}

// Delete a marquee
export function useDeleteMarquee() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id) => axios.delete(`${API_URL}/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['marquees'] });
      toast.success('Marquee deleted successfully!');
    },
    onError: (error) => {
      toast.error(`Failed to delete marquee: ${error?.response?.data?.message || error.message}`);
    },
  });
}