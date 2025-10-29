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

export const createAttendanceRegularizationServ = async (formData) => {
  try {
    const response = await axios.post(`${BASE_URL}/attendance-regularization/create`, formData);
    return response.data;
  } catch (error) {
    console.error("Create Attendance Regularization Error:", error);
    throw error.response?.data || error;
  }
};

export const getAttendanceRegularizationListServ = async (bodyData) => {
  try {
    const response = await axios.post(`${BASE_URL}/attendance-regularization/list`, bodyData);
    return response.data;
  } catch (error) {
    console.error("Get Attendance Regularization List Error:", error);
    throw error.response?.data || error;
  }
};

export const updateAttendanceRegularizationServ = async (formData) => {
  try {
    const response = await axios.put(`${BASE_URL}/attendance-regularization/update`, formData);
    return response.data;
  } catch (error) {
    console.error("Update Attendance Regularization Error:", error);
    throw error.response?.data || error;
  }
};

export const deleteAttendanceRegularizationServ = async (id) => {
  try {
    const response = await axios.delete(`${BASE_URL}/attendance-regularization/delete/${id}`);
    return response.data;
  } catch (error) {
    console.error("Delete Attendance Regularization Error:", error);
    throw error.response?.data || error;
  }
};

export const updateAttendanceRegularizationStatusServ = async (id, status) => {
  try {
    const response = await axios.put(`${BASE_URL}/attendance-regularization/update-status/${id}`, { status });
    return response.data;
  } catch (error) {
    console.error("Update Attendance Regularization Status Error:", error);
    throw error.response?.data || error;
  }
};

export const getEmployeeAttendanceRecordsServ = async (employeeId) => {
  try {
    const response = await axios.get(`${BASE_URL}/attendance-regularization/employee/${employeeId}`);
    return response.data;
  } catch (error) {
    console.error("Get Employee Attendance Records Error:", error);
    throw error.response?.data || error;
  }
};
