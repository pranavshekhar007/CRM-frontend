import axios from "axios";
import { BASE_URL } from "../../src/utils/api_base_url_configration";

const token = localStorage.getItem("token");

const getConfig = (isMultipart = false) => ({
  headers: {
    "Content-Type": isMultipart ? "multipart/form-data" : "application/json",
    Accept: "application/json",
    Authorization: `Bearer ${token}`,
  },
});

export const addLeaveApplicationServ = async (formData) => {
  try {
    const response = await axios.post(
      BASE_URL + "leave-application/create",
      formData,
    );
    return response;
  } catch (error) {
    console.error("Error creating leave application:", error);
    throw error;
  }
};

export const getLeaveApplicationListServ = async (formData) => {
  try {
    const response = await axios.post(
      BASE_URL + "leave-application/list",
      formData,
    );
    return response;
  } catch (error) {
    console.error("Error fetching leave application list:", error);
    throw error;
  }
};

export const updateLeaveApplicationServ = async (formData) => {
  try {
    const response = await axios.put(
      BASE_URL + "leave-application/update",
      formData,
    );
    return response;
  } catch (error) {
    console.error("Error updating leave application:", error);
    throw error;
  }
};

export const deleteLeaveApplicationServ = async (id) => {
  try {
    const response = await axios.delete(
      BASE_URL + "leave-application/delete/" + id,
    );
    return response;
  } catch (error) {
    console.error("Error deleting leave application:", error);
    throw error;
  }
};


export const updateLeaveApplicationStatusServ = async (id, status) => {
  try {
    const response = await axios.put(
      BASE_URL + `leave-application/update-status/${id}`,
      { status },
    );
    return response;
  } catch (error) {
    console.error("Error updating leave application status:", error);
    throw error;
  }
};
