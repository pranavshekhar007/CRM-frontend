import axios from "axios";
import { BASE_URL } from "../../src/utils/api_base_url_configration";

// 🔐 Helper - Axios Config with Auth Header
const getAuthConfig = (isFormData = false) => {
  const token = localStorage.getItem("token");
  return {
    headers: {
      "Content-Type": isFormData ? "multipart/form-data" : "application/json",
      Accept: "application/json",
      Authorization: token ? `Bearer ${JSON.parse(token)}` : "",
    },
  };
};

export const registerUserServ = async (formData) => {
  try {
    const res = await axios.post(`${BASE_URL}user/register`, formData);
    return res.data;
  } catch (err) {
    console.error("Error registering user:", err);
    throw err.response?.data || err;
  }
};

// ✅ Login
export const loginUserServ = async (formData) => {
  try {
    const res = await axios.post(`${BASE_URL}user/login`, formData);
    return res.data;
  } catch (err) {
    console.error("Error logging in:", err);
    throw err.response?.data || err;
  }
};
export const resetPasswordServ = async (id, formData) => {
  try {
    const config = getAuthConfig();
    const res = await axios.post(`${BASE_URL}user/reset-password/${id}`, formData, config);
    return res.data;
  } catch (err) {
    console.error("Error resetting password:", err);
    throw err.response?.data || err;
  }
};


export const createUserServ = async (formData) => {
  try {
    const res = await axios.post(`${BASE_URL}user/create`, formData);
    return res.data;
  } catch (err) {
    console.error("Error creating user:", err);
    throw err.response?.data || err;
  }
};

export const getUsersServ = async (formData) => {
  try {
    const res = await axios.post(`${BASE_URL}user/list`, formData);
    return res.data;
  } catch (err) {
    console.error("Error fetching user list:", err);
    throw err.response?.data || err;
  }
};

export const updateUserServ = async (formData) => {
  try {
    // formData must include id
    const { id, ...rest } = formData;
    const res = await axios.put(`${BASE_URL}user/update/${id}`, rest);
    return res.data;
  } catch (err) {
    console.error("Error updating user:", err);
    throw err.response?.data || err;
  }
};
export const deleteUserServ = async (id) => {
  try {
    const res = await axios.delete(`${BASE_URL}user/delete/${id}`);
    return res.data;
  } catch (err) {
    console.error("Error deleting user:", err);
    throw err.response?.data || err;
  }
};

// ✅ Get User Details
export const getUserDetailsServ = async (id) => {
  try {
    const res = await axios.get(`${BASE_URL}user/details/${id}`);
    return res.data;
  } catch (err) {
    console.error("Error fetching user details:", err);
    throw err.response?.data || err;
  }
};

/* =====================================================
   🔸 DASHBOARD / ANALYTICS
===================================================== */

// ✅ Dashboard Overview
export const dashboardDetailsServ = async () => {
  try {
    const response = await axios.get(BASE_URL + "user/dashboard-details");
    return response;
  } catch (error) {
    // Handle error (e.g., log or throw an error)
    console.error("Error fetching data:", error);
    throw error;
  }
};

// ✅ Get User Cart (if used for e-commerce)
export const getUserCartServ = async (userId) => {
  try {
    const res = await axios.get(`${BASE_URL}user/cart/${userId}`);
    return res.data;
  } catch (err) {
    console.error("Error fetching user cart:", err);
    throw err.response?.data || err;
  }
};
