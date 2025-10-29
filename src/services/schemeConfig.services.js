import axios from "axios";
import { BASE_URL } from "../../src/utils/api_base_url_configration";

const token = localStorage.getItem("token");

const getConfig = () => {
  return {
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json",
      Authorization: `Bearer ${token}`,
    },
  };
};

export const setSchemeConfigServ = async (formData) => {
  try {
    const response = await axios.post(BASE_URL + "scheme/set", formData);
    return response;
  } catch (error) {
    console.error("Error setting scheme config:", error);
    throw error;
  }
};

export const getSchemeConfigServ = async () => {
  try {
    const response = await axios.get(BASE_URL + "scheme/get");
    return response;
  } catch (error) {
    console.error("Error fetching scheme config:", error);
    throw error;
  }
};

export const updateSchemeConfigServ = async (id, formData) => {
  try {
    const response = await axios.put(BASE_URL + `scheme/update/${id}`, formData);
    return response;
  } catch (error) {
    console.error("Error updating scheme config:", error);
    throw error;
  }
};

export const deleteSchemeConfigServ = async (id) => {
  try {
    const response = await axios.delete(BASE_URL + `scheme/delete/${id}`);
    return response;
  } catch (error) {
    console.error("Error deleting scheme config:", error);
    throw error;
  }
};
