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

// ✅ Download Excel with params
export const downloadLoanExcelServ = async (options = {}) => {
  try {
    const response = await axios.get(
      BASE_URL + "loan/download/excel",
      {
        params: options.params,       // ← IMPORTANT
        responseType: "blob",
        headers: { Authorization: `Bearer ${token}` },
      }
    );
    return response;
  } catch (error) {
    console.error("Error downloading Excel:", error);
    throw error;
  }
};

// ✅ Download PDF with params
export const downloadLoanPDFServ = async (options = {}) => {
  try {
    const response = await axios.get(
      BASE_URL + "loan/download/pdf",
      {
        params: options.params,       // ← IMPORTANT
        responseType: "blob",
        headers: { Authorization: `Bearer ${token}` },
      }
    );
    return response;
  } catch (error) {
    console.error("Error downloading PDF:", error);
    throw error;
  }
};


  // ✅ Add New Loan for Existing User
export const addNewLoanForExistingServ = async (formData) => {
  try {
    const response = await axios.post(
      BASE_URL + "loan/addNewLoanForExisting",
      formData,
    );
    return response;
  } catch (error) {
    console.error("Error adding new loan for existing user:", error);
    throw error;
  }
};

// ✅ Get Loan Payment History by ID
export const getLoanHistoryServ = async (id) => {
  try {
    const response = await axios.get(BASE_URL + `loan/history/${id}`,);
    return response;
  } catch (error) {
    console.error("Error fetching loan payment history:", error);
    throw error;
  }
};
  
export const getProfitServ = async () => {
  try {
    const response = await axios.get(BASE_URL + "loan/profit",);
    return response;
  } catch (error) {
    console.error("Error fetching profit data:", error);
    throw error;
  }
};


export const getExpenseServ = async () => {
  try {
    const response = await axios.get(BASE_URL + "loan/expense",);
    return response;
  } catch (error) {
    console.error("Error fetching expense data:", error);
    throw error;
  }
};

export const downloadProfitExcelServ = async () => {
  try {
    const response = await axios.get(BASE_URL + "loan/download/profit/excel", {
      responseType: "blob",
      headers: { Authorization: `Bearer ${token}` },
    });
    return response;
  } catch (error) {
    console.error("Error downloading profit Excel:", error);
    throw error;
  }
};

export const downloadExpenseExcelServ = async () => {
  try {
    const response = await axios.get(BASE_URL + "loan/download/expense/excel", {
      responseType: "blob",
      headers: { Authorization: `Bearer ${token}` },
    });
    return response;
  } catch (error) {
    console.error("Error downloading expense Excel:", error);
    throw error;
  }
};


export const downloadProfitPDFServ = async () => {
  try {
    const response = await axios.get(BASE_URL + "loan/download/profit/pdf", {
      responseType: "blob",
      headers: { Authorization: `Bearer ${token}` },
    });
    return response;
  } catch (error) {
    console.error("Error downloading profit PDF:", error);
    throw error;
  }
};

export const downloadExpensePDFServ = async () => {
  try {
    const response = await axios.get(BASE_URL + "loan/download/expense/pdf", {
      responseType: "blob",
      headers: { Authorization: `Bearer ${token}` },
    });
    return response;
  } catch (error) {
    console.error("Error downloading expense PDF:", error);
    throw error;
  }
};