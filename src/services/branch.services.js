// src/services/branch.services.js

import axios from "axios";
import { BASE_URL } from "../../src/utils/api_base_url_configration";

const token = localStorage.getItem("token");

const getConfig = () => ({
  headers: {
    "Content-Type": "application/json",
    Accept: "application/json",
    Authorization: `Bearer ${token}`,
  },
});

// ✅ List branches
export const getBranchListServ = async (formData) => {
  try {
    const response = await axios.post(BASE_URL + "branch/list", formData);
    return response;
  } catch (error) {
    console.error("Error fetching branch list:", error);
    throw error;
  }
};

// ✅ Create branch
export const addBranchServ = async (formData) => {
  try {
    const response = await axios.post(BASE_URL + "branch/create", formData);
    return response;
  } catch (error) {
    console.error("Error creating branch:", error);
    throw error;
  }
};

// ✅ Update branch
export const updateBranchServ = async (formData) => {
  try {
    const response = await axios.put(BASE_URL + "branch/update", formData);
    return response;
  } catch (error) {
    console.error("Error updating branch:", error);
    throw error;
  }
};

// ✅ Delete branch
export const deleteBranchServ = async (id) => {
  try {
    const response = await axios.delete(BASE_URL + "branch/delete/" + id);
    return response;
  } catch (error) {
    console.error("Error deleting branch:", error);
    throw error;
  }
};
