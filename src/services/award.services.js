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

export const getAwardListServ = async (formData) => {
  try {
    const response = await axios.post(
      BASE_URL + "award/list",
      formData,
    );
    return response;
  } catch (error) {
    console.error("Error fetching award list:", error);
    throw error;
  }
};

export const addAwardServ = async (formData) => {
  try {
    const response = await axios.post(
      BASE_URL + "award/create",
      formData,
    );
    return response;
  } catch (error) {
    console.error("Error creating award:", error);
    throw error;
  }
};

export const updateAwardServ = async (formData) => {
  try {
    const response = await axios.put(
      BASE_URL + "award/update",
      formData,
    );
    return response;
  } catch (error) {
    console.error("Error updating award:", error);
    throw error;
  }
};

export const deleteAwardServ = async (id) => {
  try {
    const response = await axios.delete(
      BASE_URL + "award/delete/" + id,
    );
    return response;
  } catch (error) {
    console.error("Error deleting award:", error);
    throw error;
  }
};
