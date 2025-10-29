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

export const createAttendancePolicyServ = async (formData) => {
  try {
    const response = await axios.post(`${BASE_URL}/attendance-policy/create`, formData);
    return response.data;
  } catch (error) {
    console.error("Create Attendance Policy Error:", error);
    throw error.response?.data || error;
  }
};

export const getAttendancePolicyListServ = async (bodyData) => {
  try {
    const response = await axios.post(`${BASE_URL}/attendance-policy/list`, bodyData);
    return response.data;
  } catch (error) {
    console.error("Get Attendance Policy List Error:", error);
    throw error.response?.data || error;
  }
};

export const updateAttendancePolicyServ = async (formData) => {
  try {
    const response = await axios.put(`${BASE_URL}/attendance-policy/update`, formData);
    return response.data;
  } catch (error) {
    console.error("Update Attendance Policy Error:", error);
    throw error.response?.data || error;
  }
};

export const deleteAttendancePolicyServ = async (id) => {
  try {
    const response = await axios.delete(`${BASE_URL}/attendance-policy/delete/${id}`);
    return response.data;
  } catch (error) {
    console.error("Delete Attendance Policy Error:", error);
    throw error.response?.data || error;
  }
};
