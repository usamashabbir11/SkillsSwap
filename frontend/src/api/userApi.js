import axios from "axios";

const API_BASE_URL = "http://localhost:5000/users";

const getToken = () => localStorage.getItem("token");

export const registerUserApi = async (userData) => {
  const response = await axios.post(`${API_BASE_URL}/register`, userData);
  return response.data;
};

export const loginUserApi = async (loginData) => {
  const response = await axios.post(`${API_BASE_URL}/login`, loginData);
  return response.data;
};

export const getProfileApi = async () => {
  const response = await axios.get(`${API_BASE_URL}/profile`, {
    headers: { Authorization: `Bearer ${getToken()}` }
  });
  return response.data;
};

export const getAllUsersApi = async () => {
  const response = await axios.get(`${API_BASE_URL}/all`, {
    headers: { Authorization: `Bearer ${getToken()}` }
  });
  return response.data;
};

export const getUserByIdApi = async (id) => {
  const response = await axios.get(`${API_BASE_URL}/${id}`, {
    headers: { Authorization: `Bearer ${getToken()}` }
  });
  return response.data;
};
