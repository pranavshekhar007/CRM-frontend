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

export const getLeaveTypeListServ = async (formData) => {
  try {
    const response = await axios.post(
      BASE_URL + "leave-type/list",
      formData,
    );
    return response;
  } catch (error) {
    console.error("Error fetching leave type list:", error);
    throw error;
  }
};

export const addLeaveTypeServ = async (formData) => {
  try {
    const response = await axios.post(
      BASE_URL + "leave-type/create",
      formData,
    );
    return response;
  } catch (error) {
    console.error("Error creating leave type:", error);
    throw error;
  }
};

export const updateLeaveTypeServ = async (formData) => {
  try {
    const response = await axios.put(
      BASE_URL + "leave-type/update",
      formData,
    );
    return response;
  } catch (error) {
    console.error("Error updating leave type:", error);
    throw error;
  }
};

export const deleteLeaveTypeServ = async (id) => {
  try {
    const response = await axios.delete(
      BASE_URL + "leave-type/delete/" + id,
    );
    return response;
  } catch (error) {
    console.error("Error deleting leave type:", error);
    throw error;
  }
};
