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

/* ----------------------------- EXPENSE SERVICES ----------------------------- */

export const createExpenseServ = async (formData) => {
  try {
    const response = await axios.post(BASE_URL + "expense/create", formData);
    return response;
  } catch (error) {
    console.error("Error creating expense:", error);
    throw error;
  }
};

export const getExpenseListServ = async (formData) => {
  try {
    const response = await axios.post(BASE_URL + "expense/list", formData);
    return response;
  } catch (error) {
    console.error("Error fetching expense list:", error);
    throw error;
  }
};

export const getExpenseSummaryServ = async () => {
  try {
    const response = await axios.get(BASE_URL + "expense/summary");
    return response;
  } catch (error) {
    console.error("Error fetching expense summary:", error);
    throw error;
  }
};

export const deleteExpenseServ = async (id) => {
  try {
    const response = await axios.delete(BASE_URL + `expense/${id}`);
    return response;
  } catch (error) {
    console.error("Error deleting expense:", error);
    throw error;
  }
};

export const downloadExpenseExcelServ = async (params = {}) => {
  try {
    const response = await axios.get(BASE_URL + "expense/download/excel", {
      params,
      responseType: "blob",
    });
    return response;
  } catch (error) {
    console.error("Error downloading expense Excel:", error);
    throw error;
  }
};

export const downloadExpensePdfServ = async (params = {}) => {
  try {
    const response = await axios.get(BASE_URL + "expense/download/pdf", {
      params,
      responseType: "blob",
    });
    return response;
  } catch (error) {
    console.error("Error downloading expense PDF:", error);
    throw error;
  }
};


/* ---------------------------- INVESTMENT SERVICES --------------------------- */

export const createInvestmentServ = async (formData) => {
  try {
    const response = await axios.post(BASE_URL + "investment/create", formData);
    return response;
  } catch (error) {
    console.error("Error creating investment:", error);
    throw error;
  }
};

export const getInvestmentListServ = async (formData) => {
  try {
    const response = await axios.post(BASE_URL + "investment/list", formData);
    return response;
  } catch (error) {
    console.error("Error fetching investment list:", error);
    throw error;
  }
};

export const getInvestmentSummaryServ = async () => {
  try {
    const response = await axios.get(BASE_URL + "investment/summary");
    return response;
  } catch (error) {
    console.error("Error fetching investment summary:", error);
    throw error;
  }
};

export const deleteInvestmentServ = async (id) => {
  try {
    const response = await axios.delete(BASE_URL + `investment/${id}`);
    return response;
  } catch (error) {
    console.error("Error deleting investment:", error);
    throw error;
  }
};

export const downloadInvestmentExcelServ = async () => {
  try {
    const response = await axios.get(BASE_URL + "investment/download/excel", {

      responseType: "blob",
    });
    return response;
  } catch (error) {
    console.error("Error downloading investment Excel:", error);
    throw error;
  }
};

export const downloadInvestmentPdfServ = async () => {
  try {
    const response = await axios.get(BASE_URL + "investment/download/pdf", {
      responseType: "blob",
    });
    return response;
  } catch (error) {
    console.error("Error downloading investment PDF:", error);
    throw error;
  }
};


/* ------------------------------- PROFIT SERVICES ---------------------------- */

export const createProfitServ = async (formData) => {
  try {
    const response = await axios.post(BASE_URL + "profit/create", formData);
    return response;
  } catch (error) {
    console.error("Error creating profit:", error);
    throw error;
  }
};

export const getProfitListServ = async (formData = {}) => {
  try {
    const response = await axios.post(BASE_URL + "profit/list", formData);
    return response;
  } catch (error) {
    console.error("Error fetching profit list:", error);
    throw error;
  }
};

export const getProfitSummaryServ = async () => {
  try {
    const response = await axios.get(BASE_URL + "profit/summary");
    return response;
  } catch (error) {
    console.error("Error fetching profit summary:", error);
    throw error;
  }
};

export const downloadProfitExcelServ = async () => {
  try {
    const response = await axios.get(BASE_URL + "loan/download/profit/excel", {
      responseType: "blob",
    });
    return response;
  } catch (error) {
    console.error("Error downloading profit Excel:", error);
    throw error;
  }
};

export const downloadProfitPdfServ = async () => {
  try {
    const response = await axios.get(BASE_URL + "loan/download/profit/pdf", {
      responseType: "blob",
    });
    return response;
  } catch (error) {
    console.error("Error downloading profit PDF:", error);
    throw error;
  }
};


export const createReserverFund = async (formData) => {
  try {
    const response = await axios.post(BASE_URL + "reserve-fund/create", formData);
    return response;
  } catch (error) {
    console.error("Error creating profit:", error);
    throw error;
  }
};



export const getCombinedFinanceListServ = async (formData = {}) => {
  try {
    const response = await axios.post(
      BASE_URL + "finance/list",
      formData,
    );
    return response;
  } catch (error) {
    console.error("Error fetching combined finance list:", error);
    throw error;
  }
};

export const downloadCombinedFinanceExcelServ = async (params = {}) => {
  try {
    const response = await axios.get(BASE_URL + "finance/download/excel", {
      params,
      responseType: "blob",
    });
    return response;
  } catch (error) {
    console.error("Error downloading combined finance Excel:", error);
    throw error;
  }
};

export const downloadCombinedFinancePdfServ = async (params = {}) => {
  try {
    const response = await axios.get(BASE_URL + "finance/download/pdf", {
      params,
      responseType: "blob",
    });
    return response;
  } catch (error) {
    console.error("Error downloading combined finance PDF:", error);
    throw error;
  }
};
