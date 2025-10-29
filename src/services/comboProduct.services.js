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

export const getComboProductServ = async (formData) => {
  try {
    const response = await axios.post(
      BASE_URL + "combo-product/list",
      formData
    );
    return response;
  } catch (error) {
    // Handle error (e.g., log or throw an error)
    console.error("Error fetching data:", error);
    throw error;
  }
};

export const addComboProductServ = async (formData) => {
  try {
    const response = await axios.post(
      BASE_URL + "combo-product/create",
      formData
    );
    return response;
  } catch (error) {
    // Handle error (e.g., log or throw an error)
    console.error("Error fetching data:", error);
    throw error;
  }
};

export const updateComboProductServ = async (formData) => {
  try {
    const response = await axios.put(
      BASE_URL + "combo-product/update",
      formData
    );
    return response;
  } catch (error) {
    // Handle error (e.g., log or throw an error)
    console.error("Error fetching data:", error);
    throw error;
  }
};
export const deleteComboProductServ = async (id) => {
  try {
    const response = await axios.delete(
      BASE_URL + "combo-product/delete/" + id
    );
    return response;
  } catch (error) {
    // Handle error (e.g., log or throw an error)
    console.error("Error fetching data:", error);
    throw error;
  }
};

export const getComboProductDetailsServ = async (id) => {
  try {
    const response = await axios.get(BASE_URL+"combo-product/details/"+id);
    return response;
  } catch (error) {
    // Handle error (e.g., log or throw an error)
    console.error("Error fetching data:", error);
    throw error;
  }
};
export const updateComboProductHeroImage = async (formData) => {
  try {
    const response = await axios.put(
      BASE_URL + "combo-product/update/hero-image",
      formData
    );
    return response;
  } catch (error) {
    // Handle error (e.g., log or throw an error)
    console.error("Error fetching data:", error);
    throw error;
  }
};

export const updateComboProductGalleryServ = async (formData) => {
  try {
    const response = await axios.put(
      BASE_URL + "combo-product/update/add-product-gallery",
      formData
    );
    return response;
  } catch (error) {
    // Handle error (e.g., log or throw an error)
    console.error("Error fetching data:", error);
    throw error;
  }
};
export const deleteComboProductGalleryServ = async (formData) => {
  try {
    const response = await axios.post(
      BASE_URL + "combo-product/delete/product-gallery",
      formData
    );
    return response;
  } catch (error) {
    // Handle error (e.g., log or throw an error)
    console.error("Error fetching data:", error);
    throw error;
  }
};

export const updateComboProductVideoServ = async (formData) => {
  try {
    const response = await axios.put(
      BASE_URL + "combo-product/update-video",
      formData
    );
    return response;
  } catch (error) {
    // Handle error (e.g., log or throw an error)
    console.error("Error fetching data:", error);
    throw error;
  }
};

export const exportComboProductServ = async (formData) => {
  try {
    const response = await axios.post(
      BASE_URL + "combo-product/export",
      formData,
      {
        responseType: "blob",
      }
    );
    return response;
  } catch (error) {
    console.error("Error exporting combo product:", error);
    throw error;
  }
};