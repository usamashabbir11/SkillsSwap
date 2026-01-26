import axios from "axios";

const API_BASE_URL = "http://localhost:5000/users";
const getToken = () => localStorage.getItem("token");

export const registerUserApi = async (data) => {
  const res = await axios.post(`${API_BASE_URL}/register`, data);
  return res.data;
};

export const loginUserApi = async (data) => {
  const res = await axios.post(`${API_BASE_URL}/login`, data);
  return res.data;
};

export const getProfileApi = async () => {
  const res = await axios.get(`${API_BASE_URL}/profile`, {
    headers: { Authorization: `Bearer ${getToken()}` }
  });
  return res.data;
};

export const updateProfileApi = async (data) => {
  const res = await axios.put(`${API_BASE_URL}/profile`, data, {
    headers: { Authorization: `Bearer ${getToken()}` }
  });
  return res.data;
};

export const getAllUsersApi = async () => {
  const res = await axios.get(`${API_BASE_URL}/all`, {
    headers: { Authorization: `Bearer ${getToken()}` }
  });
  return res.data;
};

export const getUserByIdApi = async (id) => {
  const res = await axios.get(`${API_BASE_URL}/${id}`, {
    headers: { Authorization: `Bearer ${getToken()}` }
  });
  return res.data;
};
