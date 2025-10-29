// src/services/adminService.js
import axios from "axios";
import { BASE_URL } from "../utils/api_base_url_configration";

const token = localStorage.getItem("token");

const getConfig = () => {
  return {
    headers: {
      "Content-Type": "multipart/form-data",
      Accept: "application/json",
      Authorization: `Bearer ${JSON.parse(localStorage.getItem("token"))}`,
    },
  };
};

export const loginServ = async (formData) => {
  try {
    const response = await axios.post(BASE_URL + "admin/login", formData);
    return response;
  } catch (error) {
    // Handle error (e.g., log or throw an error)
    console.error("Error fetching data:", error);
    throw error;
  }
};

export const createAdmin = async (formData) => {
  try {
    const response = await axios.post(`${BASE_URL}admin/create`, formData);
    return response.data;
  } catch (error) {
    console.error("Create Admin error:", error.response?.data || error.message);
    throw error;
  }
};

export const updateAdmin = async (id, updateData) => {
  try {
    const response = await axios.put(`${BASE_URL}admin/update/${id}`, updateData);
    return response.data;
  } catch (error) {
    console.error("Update Admin error:", error.response?.data || error.message);
    throw error;
  }
};

export const deleteAdmin = async (id) => {
  try {
    const response = await axios.delete(`${BASE_URL}admin/delete/${id}`);
    return response.data;
  } catch (error) {
    console.error("Delete Admin error:", error.response?.data || error.message);
    throw error;
  }
};

export const getAdminList = async (formData) => {
  try {
    const response = await axios.post(`${BASE_URL}admin/list`, formData);
    return response.data;
  } catch (error) {
    console.error("Get Admin List error:", error.response?.data || error.message);
    throw error;
  }
};

export const resetAdminPassword = async (formData) => {
  try {
    const response = await axios.post(`${BASE_URL}admin/reset-password`, formData);
    return response.data;
  } catch (error) {
    console.error("Reset Password error:", error.response?.data || error.message);
    throw error;
  }
};

export const getDashboardDetails = async () => {
  try {
    const response = await axios.get(`${BASE_URL}admin/dashboard-details`);
    return response.data;
  } catch (error) {
    console.error("Dashboard Details error:", error.response?.data || error.message);
    throw error;
  }
};
