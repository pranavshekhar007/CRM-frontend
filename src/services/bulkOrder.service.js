import axios from "axios";

import { BASE_URL } from "../../src/utils/api_base_url_configration";

const token = localStorage.getItem("token");

const getConfig = () => {
  return {
    headers: {
      "Content-Type": "multipart/form-data",
      Accept: "application/json",
      Authorization: `Bearer ${token}`,
    },
  };
};
export const getBulkOrderServ = async (formData) => {
  try {
    const response = await axios.post(BASE_URL + "bulk-order/list", formData);
    return response;
  } catch (error) {
    // Handle error (e.g., log or throw an error)
    console.error("Error fetching data:", error);
    throw error;
  }
};


export const addBulkOrderServ = async (formData) => {
  try {
    const response = await axios.post(BASE_URL + "bulk-order/create", formData, getConfig());
    return response;
  } catch (error) {
    // Handle error (e.g., log or throw an error)
    console.error("Error fetching data:", error);
    throw error;
  }
};

export const updateOrderServ = async (formData) => {
  try {
    const response = await axios.put(BASE_URL + "bulk-order/update", formData, getConfig());
    return response;
  } catch (error) {
    // Handle error (e.g., log or throw an error)
    console.error("Error fetching data:", error);
    throw error;
  }
};
export const deleteOrderServ = async (id) => {
  try {
    const response = await axios.delete(BASE_URL + "bulk-order/delete/"+id,  getConfig());
    return response;
  } catch (error) {
    // Handle error (e.g., log or throw an error)
    console.error("Error fetching data:", error);
    throw error;
  }
};
