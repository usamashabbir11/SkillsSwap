import axios from "axios";

const API_BASE_URL = "http://localhost:5000";
const getToken = () => localStorage.getItem("token");

const authHeader = () => ({
  headers: { Authorization: `Bearer ${getToken()}` }
});

/* ================= AUTH ================= */

export const registerUserApi = async (data) => {
  const res = await axios.post(`${API_BASE_URL}/users/register`, data);
  return res.data;
};

export const loginUserApi = async (data) => {
  const res = await axios.post(`${API_BASE_URL}/users/login`, data);
  return res.data;
};

/* ================= USER ================= */

export const getProfileApi = async () => {
  const res = await axios.get(`${API_BASE_URL}/users/profile`, authHeader());
  return res.data;
};

export const updateProfileApi = async (data) => {
  const res = await axios.put(
    `${API_BASE_URL}/users/profile`,
    data,
    authHeader()
  );
  return res.data;
};

export const getAllUsersApi = async () => {
  const token = getToken();
  const config = token ? authHeader() : {};
  const res = await axios.get(`${API_BASE_URL}/users/all`, config);
  return res.data;
};

export const getUserByIdApi = async (id) => {
  const res = await axios.get(`${API_BASE_URL}/users/${id}`, authHeader());
  return res.data;
};

/* ================= SWAP REQUESTS (PHASE 6) ================= */

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

/* ================= PHASE 7.2 ================= */

export const getSwapDealWithUserApi = async (userId) => {
  const res = await axios.get(
    `${API_BASE_URL}/swaps/deal-with/${userId}`,
    authHeader()
  );
  return res.data;
};

export const selectCourseForSwapApi = async (dealId, courseIndex) => {
  const res = await axios.post(
    `${API_BASE_URL}/swaps/select-course`,
    { dealId, courseIndex },
    authHeader()
  );
  return res.data;
};

export const hasPendingSwapRequestApi = async (userId) => {
  const res = await axios.get(
    `${API_BASE_URL}/swaps/pending-with/${userId}`,
    authHeader()
  );
  return res.data;
};

/* ================= PHASE 8 ================= */

export const canAccessCourseApi = async (ownerId, courseIndex) => {
  const res = await axios.get(
    `${API_BASE_URL}/swaps/can-access/${ownerId}/${courseIndex}`,
    authHeader()
  );
  return res.data;
};

/* ================= PHASE 9 ================= */

export const deleteOwnProfileApi = async () => {
  const res = await axios.delete(`${API_BASE_URL}/users/profile`, authHeader());
  return res.data;
};

export const adminDeleteUserApi = async (id) => {
  const res = await axios.delete(`${API_BASE_URL}/users/${id}`, authHeader());
  return res.data;
};

/* ================= PHASE 12 — REVIEWS ================= */

export const submitReviewApi = async (dealId, rating, comment) => {
  const res = await axios.post(
    `${API_BASE_URL}/reviews`,
    { dealId, rating, comment },
    authHeader()
  );
  return res.data;
};

export const submitPurchaseReviewApi = async (revieweeId, rating, comment) => {
  const res = await axios.post(
    `${API_BASE_URL}/reviews`,
    { revieweeId, rating, comment },
    authHeader()
  );
  return res.data;
};

export const submitCourseReviewApi = async (revieweeId, courseIndex, rating, comment) => {
  const res = await axios.post(
    `${API_BASE_URL}/reviews`,
    { revieweeId, courseIndex, rating, comment },
    authHeader()
  );
  return res.data;
};

export const getReviewsForUserApi = async (userId) => {
  const res = await axios.get(`${API_BASE_URL}/reviews/user/${userId}`, authHeader());
  return res.data;
};

/* ================= PHASE 13 — ADMIN ================= */

export const getAdminStatsApi = async () => {
  const res = await axios.get(`${API_BASE_URL}/admin/stats`, authHeader());
  return res.data;
};

/* ================= PHASE 10 — PAYMENTS ================= */

export const createCheckoutSessionApi = async (ownerId, courseIndex) => {
  const res = await axios.post(
    `${API_BASE_URL}/payments/create-checkout-session`,
    { ownerId, courseIndex },
    authHeader()
  );
  return res.data;
};

export const verifyPaymentApi = async (sessionId) => {
  const res = await axios.get(
    `${API_BASE_URL}/payments/verify/${sessionId}`,
    authHeader()
  );
  return res.data;
};

export const getMyPurchasesApi = async () => {
  const res = await axios.get(`${API_BASE_URL}/payments/my-purchases`, authHeader());
  return res.data;
};

/* ================= NOTIFICATIONS ================= */

export const getNotificationsApi = async () => {
  const res = await axios.get(
    `${API_BASE_URL}/notifications`,
    authHeader()
  );
  return res.data;
};

/* PHASE 14A - AI MATCHING */

export const getMatchScoreApi = async (userId) => {
  const res = await axios.get(`${API_BASE_URL}/match/score/${userId}`, authHeader());
  return res.data;
};

/* PHASE 14B - GEO LOCATION */

export const getNearbyUsersApi = async () => {
  const res = await axios.get(`${API_BASE_URL}/geo/nearby`, authHeader());
  return res.data;
};

/* PHASE 14C - AI SUGGESTIONS */

export const getSuggestionsApi = async () => {
  const res = await axios.get(`${API_BASE_URL}/suggestions`, authHeader());
  return res.data;
};