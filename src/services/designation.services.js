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

export const getDesignationListServ = async (formData) => {
  try {
    const response = await axios.post(
      BASE_URL + "designation/list",
      formData,
    );
    return response;
  } catch (error) {
    console.error("Error fetching designation list:", error);
    throw error;
  }
};

// ✅ Add new designation
export const addDesignationServ = async (formData) => {
  try {
    const response = await axios.post(
      BASE_URL + "designation/create",
      formData,
    );
    return response;
  } catch (error) {
    console.error("Error creating designation:", error);
    throw error;
  }
};

// ✅ Update existing designation
export const updateDesignationServ = async (formData) => {
  try {
    const response = await axios.put(
      BASE_URL + "designation/update",
      formData,
    );
    return response;
  } catch (error) {
    console.error("Error updating designation:", error);
    throw error;
  }
};

// ✅ Delete designation by ID
export const deleteDesignationServ = async (id) => {
  try {
    const response = await axios.delete(
      BASE_URL + "designation/delete/" + id,
    );
    return response;
  } catch (error) {
    console.error("Error deleting designation:", error);
    throw error;
  }
};

export const getDesignationsByDepartmentServ = async (departmentId) => {
  try {
    const response = await axios.get(BASE_URL + "designation/by-department/" + departmentId);
    return response;
  } catch (error) {
    console.error("Error fetching designations by department:", error);
    throw error;
  }
};