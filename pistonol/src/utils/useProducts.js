// utils/useProducts.js
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
 
import axios from '../axiosConfig';
import toast from 'react-hot-toast';

// Fetch all products
const fetchProducts = async () => {
  const { data } = await axios.get('/products');
  return data;
};

// Create a new product
const createProduct = async (productData) => {
  const { data } = await axios.post('/products', productData);
  return data;
};

// Update a product
const updateProduct = async ({ id, productData }) => {
  const { data } = await axios.put(`/products/${id}`, productData);
  return data;
};

// Delete a product
const deleteProduct = async (id) => {
  const { data } = await axios.delete(`/products/${id}`);
  return data;
};

// Query: Get all products
export const useProducts = (filters = {}) => {
  const { 
    page, 
    limit, 
    search, 
    category, 
    minPrice, 
    maxPrice, 
    minStock, 
    maxStock, 
    status, 
    sortBy, 
    sortOrder 
  } = filters;
  
  return useQuery({
    queryKey: ['products', filters],
    queryFn: async () => {
      const params = new URLSearchParams();
      
      if (page) params.append('page', page);
      if (limit) params.append('limit', limit);
      if (search) params.append('search', search);
      if (category) params.append('category', category);
      if (minPrice > 0) params.append('minPrice', minPrice);
      if (maxPrice < 100000) params.append('maxPrice', maxPrice);
      if (minStock > 0) params.append('minStock', minStock);
      if (maxStock < 1000) params.append('maxStock', maxStock);
      if (status) params.append('status', status);
      if (sortBy) params.append('sortBy', sortBy);
      if (sortOrder) params.append('sortOrder', sortOrder);
      
      const { data } = await axios.get(`/products?${params.toString()}`);
      return data;
    },
    keepPreviousData: true,
    retry: 2,
    staleTime: 1 * 60 * 1000, // 1 minute
  });
};


// Mutation: Create product
export function useCreateProduct() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: createProduct,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['products'] });
      toast.success('Product created successfully');
    },
    onError: () => {
      toast.error('Failed to create product');
    },
  });
}

// Mutation: Update product
export function useUpdateProduct() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: updateProduct,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['products'] });
      toast.success('Product updated successfully');
    },
    onError: () => {
      toast.error('Failed to update product');
    },
  });
}

// Mutation: Delete product
export function useDeleteProduct() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: deleteProduct,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['products'] });
      toast.success('Product deleted successfully');
    },
    onError: () => {
      toast.error('Failed to delete product');
    },
  });
}
