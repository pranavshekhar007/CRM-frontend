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

export const createAttendanceRecordServ = async (formData) => {
  try {
    const response = await axios.post(`${BASE_URL}/attendance-record/create`, formData);
    return response.data;
  } catch (error) {
    console.error("Create Attendance Record Error:", error);
    throw error.response?.data || error;
  }
};

export const getAttendanceRecordListServ = async (bodyData) => {
  try {
    const response = await axios.post(`${BASE_URL}/attendance-record/list`, bodyData);
    return response.data;
  } catch (error) {
    console.error("Get Attendance Record List Error:", error);
    throw error.response?.data || error;
  }
};

export const updateAttendanceRecordServ = async (formData) => {
  try {
    const response = await axios.put(`${BASE_URL}/attendance-record/update`, formData);
    return response.data;
  } catch (error) {
    console.error("Update Attendance Record Error:", error);
    throw error.response?.data || error;
  }
};

export const deleteAttendanceRecordServ = async (id) => {
  try {
    const response = await axios.delete(`${BASE_URL}/attendance-record/delete/${id}`);
    return response.data;
  } catch (error) {
    console.error("Delete Attendance Record Error:", error);
    throw error.response?.data || error;
  }
};
