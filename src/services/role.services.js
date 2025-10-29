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

// ✅ List roles
export const getRoleListServ = async (formData) => {
  try {
    const response = await axios.post(BASE_URL + "role/list", formData);
    return response;
  } catch (error) {
    console.error("Error fetching role list:", error);
    throw error;
  }
};

// ✅ Create role
export const addRoleServ = async (formData) => {
  try {
    const response = await axios.post(BASE_URL + "role/create", formData);
    return response;
  } catch (error) {
    console.error("Error creating role:", error);
    throw error;
  }
};

// ✅ Update role
export const updateRoleServ = async (id, formData) => {
  try {
    const response = await axios.put(BASE_URL + `role/update/${id}`, formData);
    return response;
  } catch (error) {
    console.error("Error updating role:", error);
    throw error;
  }
};


// ✅ Delete role
export const deleteRoleServ = async (id) => {
  try {
    const response = await axios.delete(BASE_URL + "role/delete/" + id);
    return response;
  } catch (error) {
    console.error("Error deleting role:", error);
    throw error;
  }
};

export const getRoleDetailsServ = async (id) => {
  try {
    const response = await axios.get(BASE_URL + `role/details/${id}`);
    return response;
  } catch (error) {
    console.error(`Error fetching role details for ID ${id}:`, error);
    throw error;
  }
};
