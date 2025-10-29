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

// ✅ Get Award Type List
export const getAwardTypeListServ = async (formData) => {
  try {
    const response = await axios.post(
      BASE_URL + "award-type/list",
      formData,
    );
    return response;
  } catch (error) {
    console.error("Error fetching award type list:", error);
    throw error;
  }
};

// ✅ Add new Award Type
export const addAwardTypeServ = async (formData) => {
  try {
    const response = await axios.post(
      BASE_URL + "award-type/create",
      formData,
    );
    return response;
  } catch (error) {
    console.error("Error creating award type:", error);
    throw error;
  }
};

// ✅ Update existing Award Type
export const updateAwardTypeServ = async (formData) => {
  try {
    const response = await axios.put(
      BASE_URL + "award-type/update",
      formData,
    );
    return response;
  } catch (error) {
    console.error("Error updating award type:", error);
    throw error;
  }
};

// ✅ Delete Award Type by ID
export const deleteAwardTypeServ = async (id) => {
  try {
    const response = await axios.delete(
      BASE_URL + "award-type/delete/" + id,
    );
    return response;
  } catch (error) {
    console.error("Error deleting award type:", error);
    throw error;
  }
};
