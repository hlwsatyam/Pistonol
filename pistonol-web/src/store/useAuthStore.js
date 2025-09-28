import { create } from 'zustand';
import axiosInstance from '../axiosConfig';

const useAuthStore = create((set) => ({
  user: JSON.parse(localStorage.getItem('user')) || null,
  isAuthenticated: !!JSON.parse(localStorage.getItem('user')),
  login: (userData) => {
    localStorage.setItem('user', JSON.stringify(userData));
    set({ user: userData, isAuthenticated: true });
  },
  logout: () => {
    localStorage.removeItem('user');
    set({ user: null, isAuthenticated: false });
  },


 checkAuth: async () => {
    const token = localStorage.getItem("user");
    if (!token) {
      set({ user: null, isAuthenticated: false, loading: false });
      return;
    }

    try {
      const res = await axiosInstance.post(
        `/auth/page-verify`, 
        {user: localStorage.getItem("user")}
      );

      set({ user: res.data.user, isAuthenticated: true, loading: false });
    } catch (err) {
      console.error("Auth check failed", err);
      // localStorage.removeItem("user");
      // set({ user: null, isAuthenticated: false, loading: false });
    }
  },










}));

export default useAuthStore;