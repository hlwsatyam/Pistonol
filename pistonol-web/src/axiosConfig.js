import axios from "axios";
console.log(import.meta.env.VITE_BackendURL)
const axiosInstance = axios.create({
  baseURL:`${import.meta.env.VITE_BackendURL}/api`,
 
  withCredentials: false, 
});

export default axiosInstance;
