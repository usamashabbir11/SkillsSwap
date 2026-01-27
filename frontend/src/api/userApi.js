import axios from "axios";

const API_BASE_URL = "http://localhost:5000";
const getToken = () => localStorage.getItem("token");

const authHeader = () => ({
  headers: { Authorization: `Bearer ${getToken()}` }
});

export const registerUserApi = async (data) => {
  const res = await axios.post(`${API_BASE_URL}/users/register`, data);
  return res.data;
};

export const loginUserApi = async (data) => {
  const res = await axios.post(`${API_BASE_URL}/users/login`, data);
  return res.data;
};

export const getProfileApi = async () => {
  const res = await axios.get(`${API_BASE_URL}/users/profile`, authHeader());
  return res.data;
};

export const updateProfileApi = async (data) => {
  const res = await axios.put(`${API_BASE_URL}/users/profile`, data, authHeader());
  return res.data;
};

export const getAllUsersApi = async () => {
  const res = await axios.get(`${API_BASE_URL}/users/all`, authHeader());
  return res.data;
};

export const getUserByIdApi = async (id) => {
  const res = await axios.get(`${API_BASE_URL}/users/${id}`, authHeader());
  return res.data;
};

/* 🔁 SWAP REQUESTS */
export const sendSwapRequestApi = async (userId) => {
  const res = await axios.post(
    `${API_BASE_URL}/swaps/send`,
    { userId },
    authHeader()
  );
  return res.data;
};

export const getIncomingRequestsApi = async () => {
  const res = await axios.get(
    `${API_BASE_URL}/swaps/incoming`,
    authHeader()
  );
  return res.data;
};

export const respondToRequestApi = async (requestId, action) => {
  const res = await axios.post(
    `${API_BASE_URL}/swaps/respond`,
    { requestId, action },
    authHeader()
  );
  return res.data;
};

/* 🔔 NOTIFICATIONS */
export const getNotificationsApi = async () => {
  const res = await axios.get(
    `${API_BASE_URL}/notifications`,
    authHeader()
  );
  return res.data;
};
