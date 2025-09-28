import axios from "../axiosConfig";

export const login = async (data) => {
  const res = await axios.post("/auth/login", data);
  return res.data;
};



export const fetchUsers = async (role) => {
  const response = await axios.get(`/auth/byrole/${role}` );
  return response.data;
};

export const createUser = async (userData) => {
  const response = await axios.post("/auth", userData);
  return response.data;
};

export const updateUser = async ({ id, userData }) => {
  const response = await axios.put(`/auth/${id}`, userData);
  return response.data;
};

export const deleteUser = async (id) => {
  await axios.delete(`/auth/${id}`);
  return id;
};