import axios from "axios";
import { BASE_URL } from "../utils/api_base_url_configration";

const token = localStorage.getItem("token");

const getConfig = () => ({
  headers: {
    "Content-Type": "application/json",
    Accept: "application/json",
    Authorization: `Bearer ${token}`,
  },
});

// ✅ Get Document Type List
export const getDocumentTypeListServ = async (formData) => {
  try {
    const response = await axios.post(
      BASE_URL + "document-type/list",
      formData,
    );
    return response;
  } catch (error) {
    console.error("Error fetching document type list:", error);
    throw error;
  }
};

// ✅ Add Document Type
export const addDocumentTypeServ = async (formData) => {
  try {
    const response = await axios.post(
      BASE_URL + "document-type/create",
      formData,
    );
    return response;
  } catch (error) {
    console.error("Error creating document type:", error);
    throw error;
  }
};

// ✅ Update Document Type
export const updateDocumentTypeServ = async (formData) => {
  try {
    const response = await axios.put(
      BASE_URL + "document-type/update",
      formData,
    );
    return response;
  } catch (error) {
    console.error("Error updating document type:", error);
    throw error;
  }
};

// ✅ Delete Document Type
export const deleteDocumentTypeServ = async (id) => {
  try {
    const response = await axios.delete(
      BASE_URL + "document-type/delete/" + id,
    );
    return response;
  } catch (error) {
    console.error("Error deleting document type:", error);
    throw error;
  }
};
