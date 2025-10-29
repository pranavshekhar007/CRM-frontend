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

export const addLoanServ = async (formData) => {
  try {
    const response = await axios.post(BASE_URL + "loan/create", formData);
    return response;
  } catch (error) {
    console.error("Error creating loan:", error);
    throw error;
  }
};

export const getLoanListServ = async (formData) => {
  try {
    const response = await axios.post(BASE_URL + "loan/list", formData);
    return response;
  } catch (error) {
    console.error("Error fetching loan list:", error);
    throw error;
  }
};

export const getLoanDetailsServ = async (id) => {
  try {
    const response = await axios.get(BASE_URL + "loan/details/" + id);
    return response;
  } catch (error) {
    console.error("Error fetching loan details:", error);
    throw error;
  }
};

export const updateLoanServ = async (formData) => {
  try {
    const response = await axios.put(BASE_URL + "loan/update", formData);
    return response;
  } catch (error) {
    console.error("Error updating loan:", error);
    throw error;
  }
};

export const deleteLoanServ = async (id) => {
  try {
    const response = await axios.delete(BASE_URL + "loan/delete/" + id);
    return response;
  } catch (error) {
    console.error("Error deleting loan:", error);
    throw error;
  }
};

export const addInstallmentServ = async (id, formData) => {
  try {
    const response = await axios.post(BASE_URL + `loan/addInstallment/${id}`, formData);
    return response;
  } catch (error) {
    console.error("Error adding installment:", error);
    throw error;
  }
};

// ✅ Download Excel
export const downloadLoanExcelServ = async () => {
    try {
      const response = await axios.get(BASE_URL + "loan/download/excel", {
        responseType: "blob",
        headers: { Authorization: `Bearer ${token}` },
      });
      return response;
    } catch (error) {
      console.error("Error downloading Excel:", error);
      throw error;
    }
  };
  
  // ✅ Download PDF
  export const downloadLoanPDFServ = async () => {
    try {
      const response = await axios.get(BASE_URL + "loan/download/pdf", {
        responseType: "blob",
        headers: { Authorization: `Bearer ${token}` },
      });
      return response;
    } catch (error) {
      console.error("Error downloading PDF:", error);
      throw error;
    }
  };
  