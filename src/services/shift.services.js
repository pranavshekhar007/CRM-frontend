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

export const createShiftServ = async (formData) => {
  try {
    const response = await axios.post(`${BASE_URL}/shifts/create`, formData);
    return response.data;
  } catch (error) {
    console.error("Create Shift Error:", error);
    throw error.response?.data || error;
  }
};

export const getShiftListServ = async (bodyData) => {
  try {
    const response = await axios.post(`${BASE_URL}/shifts/list`, bodyData);
    return response.data;
  } catch (error) {
    console.error("Get Shift List Error:", error);
    throw error.response?.data || error;
  }
};

export const updateShiftServ = async (formData) => {
  try {
    const response = await axios.put(`${BASE_URL}/shifts/update`, formData);
    return response.data;
  } catch (error) {
    console.error("Update Shift Error:", error);
    throw error.response?.data || error;
  }
};

export const deleteShiftServ = async (id) => {
  try {
    const response = await axios.delete(`${BASE_URL}/shifts/delete/${id}`);
    return response.data;
  } catch (error) {
    console.error("Delete Shift Error:", error);
    throw error.response?.data || error;
  }
};
