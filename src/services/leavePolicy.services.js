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

export const getLeavePolicyListServ = async (formData) => {
  try {
    const response = await axios.post(
      BASE_URL + "leave-policy/list",
      formData,
    );
    return response;
  } catch (error) {
    console.error("Error fetching leave policy list:", error);
    throw error;
  }
};

export const addLeavePolicyServ = async (formData) => {
  try {
    const response = await axios.post(
      BASE_URL + "leave-policy/create",
      formData,
    );
    return response;
  } catch (error) {
    console.error("Error creating leave policy:", error);
    throw error;
  }
};

export const updateLeavePolicyServ = async (formData) => {
  try {
    const response = await axios.put(
      BASE_URL + "leave-policy/update",
      formData,
    );
    return response;
  } catch (error) {
    console.error("Error updating leave policy:", error);
    throw error;
  }
};

export const deleteLeavePolicyServ = async (id) => {
  try {
    const response = await axios.delete(
      BASE_URL + "leave-policy/delete/" + id,
    );
    return response;
  } catch (error) {
    console.error("Error deleting leave policy:", error);
    throw error;
  }
};
