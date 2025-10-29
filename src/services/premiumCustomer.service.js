import axios from "axios";
import { BASE_URL } from "../../src/utils/api_base_url_configration";

const getConfig = () => {
  return {
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json",
      Authorization: `Bearer ${JSON.parse(localStorage.getItem("token"))}`,
    },
  };
};

// Create Premium Customer
export const createPremiumCustomerServ = async (formData) => {
  try {
    const response = await axios.post(
      BASE_URL + "premium-user/create",
      formData,
      getConfig()
    );
    return response;
  } catch (error) {
    console.error("Error creating premium customer:", error);
    throw error;
  }
};

// Get Premium Customer List
export const getPremiumCustomerListServ = async (formData) => {
  try {
    const response = await axios.post(
      BASE_URL + "premium-user/list",
      formData,
    );
    return response;
  } catch (error) {
    console.error("Error fetching premium customer list:", error);
    throw error;
  }
};

// Get Premium Customer Details by ID
export const getPremiumCustomerDetailsServ = async (id) => {
  try {
    const response = await axios.get(
      BASE_URL + `premium-user/details/${id}`,
      getConfig()
    );
    return response;
  } catch (error) {
    console.error("Error fetching premium customer details:", error);
    throw error;
  }
};

// Delete Premium Customer by ID
export const deletePremiumCustomerServ = async (id) => {
  try {
    const response = await axios.delete(
      BASE_URL + `premium-user/delete/${id}`,
      getConfig()
    );
    return response;
  } catch (error) {
    console.error("Error deleting premium customer:", error);
    throw error;
  }
};

// Export Premium Customers (Excel/CSV/TXT)
export const exportPremiumCustomerServ = async (formData) => {
  try {
    const response = await axios.post(
      BASE_URL + "premium-user/export",
      formData,
      {
        responseType: "blob",
      }
    );
    return response;
  } catch (error) {
    console.error("Error exporting premium customers:", error);
    throw error;
  }
};
