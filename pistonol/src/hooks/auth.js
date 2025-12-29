import AsyncStorage from '@react-native-async-storage/async-storage';
import {useMutation, useQuery} from '@tanstack/react-query';
import api from 'axios';
import { ToastAndroid } from 'react-native';

export const sendOtp = () => {
  return useMutation({
    mutationFn: async mobile => {
      const response = await api.post('/auth/otp/send-otp', {mobile});
      return response.data;
    },
  });
};

export const verifyOtp = () => {
  return useMutation({
    mutationFn: async ({mobile, otp, forwordId}) => {
      const response = await api.post('/auth/otp/verify', {
        mobile,
        otp,
        referralCode: forwordId || undefined,
      });
      return response.data;
    },
  });
};
export const verifyCode = (  ) => {
   
  return useMutation({
    mutationFn: async ({role,code , _id }) => {
      console.log(role,code , _id )
      const response = await api.post('/qrcodes/verification', {
        role,code , _id
      });
      return response.data;
    },



   onSuccess: async (data) => {
      ToastAndroid.show("✅ Code Verified Successfully!", ToastAndroid.SHORT);
      // console.log(data)
      await AsyncStorage.setItem('user', JSON.stringify(data?.data?.user));
      console.log("Verification Success:", data);
    },
    onError: (error) => {
      const message =
        error?.response?.data?.message || "❌ Verification Failed!";
      ToastAndroid.show(message, ToastAndroid.LONG);
      console.error("Verification Error:", error);
    },







  });
};

export function useProducts(page = 1, limit = 6) {
  return useQuery({
    queryKey: ['products', page],
    queryFn: async () => {
      const { data } = await api.get('/products', {
        params: { page, limit }
      });
      return data; // Returns the full response object
    },
    keepPreviousData: true, // Smooth pagination

  });
}



export function useMarquees() {
  return useQuery({
    queryKey: ['marquees'],
    queryFn: async () => {
      const { data } = await api.get('/marquees');
      return data;
    },
    onError: (error) => {
      ToastAndroid(`Failed to fetch marquees: ${error?.response?.data?.message || error.message}`);
    },
  });
}
export function useBanners() {
  return useQuery({
    queryKey: ['banners'],
    queryFn: async () => {
      const { data } = await api.get('/banners');
      return data;
    },
    onError: (error) => {
      ToastAndroid(`Failed to fetch marquees: ${error?.response?.data?.message || error.message}`);
    },
  });
}








export const uploadToCloudinary = async imageUri => {
  try {
    const formData = new FormData();
    formData.append('file', {
      uri: imageUri,
      type: 'image/jpeg', // or 'image/png'
      name: 'profile_' + Date.now() + '.jpg', // unique filename
    });
    formData.append('upload_preset', 'newsimgupload');
    formData.append('cloud_name', 'dikxwu8om');

    const response = await fetch(
      'https://api.cloudinary.com/v1_1/dikxwu8om/image/upload', // Fixed cloud name
      {
        method: 'POST',
        body: formData,
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      },
    );

    const data = await response.json();

    if (!response.ok) {
      console.log('Cloudinary upload error details:', data);
      throw new Error(data.error?.message || 'Image upload failed');
    }

    return data;
  } catch (error) {
    console.error('Full upload error:', error);
    throw new Error(`Upload failed: ${error.message}`);
  }
};
