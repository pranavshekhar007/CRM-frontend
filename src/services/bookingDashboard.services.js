import axios from "axios";

import { BASE_URL } from "../../src/utils/api_base_url_configration";

const token = localStorage.getItem("token");

const getConfig = () => {
  return {
    headers: {
      "Content-Type": "multipart/form-data",
      Accept: "application/json",
      Authorization: `Bearer ${JSON.parse(localStorage.getItem("token"))}`,
    },
  };
};
export const getBookingListServ = async (formData) => {
  try {
    const response = await axios.post(BASE_URL + "booking/list", formData);
    return response;
  } catch (error) {
    // Handle error (e.g., log or throw an error)
    console.error("Error fetching data:", error);
    throw error;
  }
};

export const updateBookingServ = async (formData) => {
  try {
    const response = await axios.put(BASE_URL + "booking/update", formData);
    return response;
  } catch (error) {
    // Handle error (e.g., log or throw an error)
    console.error("Error fetching data:", error);
    throw error;
  }
};


export const getProductServ = async (formData) => {
  try {
    const response = await axios.post(BASE_URL + "product/list", formData);
    return response;
  } catch (error) {
    // Handle error (e.g., log or throw an error)
    console.error("Error fetching data:", error);
    throw error;
  }
};

export const getUserListServ = async (formData) => {
  try {
    const response = await axios.post(
      BASE_URL + "user/list",
      formData,
      getConfig()
    );
    return response;
  } catch (error) {
    // Handle error (e.g., log or throw an error)
    console.error("Error fetching data:", error);
    throw error;
  }
};

export const getBookingDetailsServ = async (id) => {
  try {
    const response = await axios.get(
      BASE_URL + `booking/details/${id}`,
    );
    return response;
  } catch (error) {
    console.error("Error fetching booking details:", error);
    throw error;
  }
};

export const exportOrderServ = async (formData) => {
  try {
    const response = await axios.post(
      BASE_URL + "booking/export",
      formData,
      {
        responseType: "blob", // ensures Excel/CSV download works
      }
    );
    return response;
  } catch (error) {
    console.error("Error exporting orders:", error);
    throw error;
  }
};