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
export const getDepartmentListServ = async (formData) => {
  try {
    const response = await axios.post(BASE_URL + "department/list", formData);
    return response;
  } catch (error) {
    console.error("Error fetching department list:", error);
    throw error;
  }
};

export const addDepartmentServ = async (formData) => {
  try {
    const response = await axios.post(BASE_URL + "department/create", formData);
    return response;
  } catch (error) {
    console.error("Error creating department:", error);
    throw error;
  }
};

export const updateDepartmentServ = async (formData) => {
  try {
    const response = await axios.put(BASE_URL + "department/update", formData);
    return response;
  } catch (error) {
    console.error("Error updating department:", error);
    throw error;
  }
};

export const deleteDepartmentServ = async (id) => {
  try {
    const response = await axios.delete(BASE_URL + "department/delete/" + id);
    return response;
  } catch (error) {
    console.error("Error deleting department:", error);
    throw error;
  }
};


export const getDepartmentsByBranchServ = async (branchId) => {
  try {
    const response = await axios.get(BASE_URL + "department/by-branch/" + branchId);
    return response;
  } catch (error) {
    console.error("Error fetching departments by branch:", error);
    throw error;
  }
};