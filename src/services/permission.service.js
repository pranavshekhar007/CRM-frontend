// src/services/permissionService.js
import axios from "axios";
import { BASE_URL } from "../utils/api_base_url_configration";

// 🔹 Axios config with token
const getConfig = () => {
  const token = localStorage.getItem("token");
  return {
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
  };
};

// 🔹 Create Permission
export const createPermissionServ = async (formData) => {
  try {
    const response = await axios.post(`${BASE_URL}permission/create`, formData);
    return response.data;
  } catch (error) {
    console.error("Create Permission error:", error.response?.data || error.message);
    throw error;
  }
};

// 🔹 Get Permission List
export const getPermissionListServ = async (formData) => {
  try {
    const response = await axios.post(`${BASE_URL}permission/list`, formData);
    return response.data;
  } catch (error) {
    console.error("Get Permission List error:", error.response?.data || error.message);
    throw error;
  }
};

// 🔹 Update Permission
export const updatePermissionServ = async (formData) => {
  try {
    const response = await axios.put(`${BASE_URL}permission/update`, formData);
    return response.data;
  } catch (error) {
    console.error("Update Permission error:", error.response?.data || error.message);
    throw error;
  }
};

// 🔹 Delete Permission
export const deletePermissionServ = async (id) => {
  try {
    const response = await axios.delete(`${BASE_URL}permission/delete/${id}`);
    return response.data;
  } catch (error) {
    console.error("Delete Permission error:", error.response?.data || error.message);
    throw error;
  }
};
