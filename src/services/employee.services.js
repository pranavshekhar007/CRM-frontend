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

export const addEmployeeServ = async (formData) => {
  try {
    const response = await axios.post(
      BASE_URL + "employee/create",
      formData,
    );
    return response;
  } catch (error) {
    console.error("Error creating employee:", error);
    throw error;
  }
};

export const getEmployeeListServ = async (formData) => {
  try {
    const response = await axios.post(
      BASE_URL + "employee/list",
      formData,
    );
    return response;
  } catch (error) {
    console.error("Error fetching employee list:", error);
    throw error;
  }
};


export const updateEmployeeServ = async (formData) => {
  try {
    const response = await axios.put(
      BASE_URL + "employee/update",
      formData,
    );
    return response;
  } catch (error) {
    console.error("Error updating employee:", error);
    throw error;
  }
};

export const deleteEmployeeServ = async (id) => {
  try {
    const response = await axios.delete(
      BASE_URL + "employee/delete/" + id,
    );
    return response;
  } catch (error) {
    console.error("Error deleting employee:", error);
    throw error;
  }
};

export const resetEmployeePasswordServ = async (formData) => {
  try {
    const response = await axios.put(
      BASE_URL + "employee/reset-password",
      formData,
    );
    return response;
  } catch (error) {
    console.error("Error resetting employee password:", error);
    throw error;
  }
};

export const getEmployeeDetailsServ = async (id) => {
  try {
    const response = await axios.get(
      `${BASE_URL}employee/details/${id}`,
    );
    return response;
  } catch (error) {
    console.error("Error fetching employee details:", error);
    throw error;
  }
};

export const deleteEmployeeDocumentServ = async (employeeId, documentTypeId) => {
  try {
    const response = await axios.delete(
      BASE_URL + `employee/delete-document/${employeeId}/${documentTypeId}`,
    );
    return response;
  } catch (error) {
    console.error("Error deleting employee document:", error);
    throw error;
  }
};
