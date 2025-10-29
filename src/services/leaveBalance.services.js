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

export const addLeaveBalanceServ = async (formData) => {
  try {
    const response = await axios.post(BASE_URL + "leave-balance/create", formData);
    return response;
  } catch (error) {
    console.error("Error creating leave balance:", error);
    throw error;
  }
};

export const getLeaveBalanceListServ = async (formData) => {
  try {
    const response = await axios.post(BASE_URL + "leave-balance/list", formData);
    return response;
  } catch (error) {
    console.error("Error fetching leave balance list:", error);
    throw error;
  }
};

export const updateLeaveBalanceServ = async (formData) => {
  try {
    const response = await axios.put(BASE_URL + "leave-balance/update", formData);
    return response;
  } catch (error) {
    console.error("Error updating leave balance:", error);
    throw error;
  }
};

export const deleteLeaveBalanceServ = async (id) => {
  try {
    const response = await axios.delete(BASE_URL + "leave-balance/delete/" + id);
    return response;
  } catch (error) {
    console.error("Error deleting leave balance:", error);
    throw error;
  }
};
