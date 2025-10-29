import axios from "axios";
import { BASE_URL } from "../../src/utils/api_base_url_configration";

const token = localStorage.getItem("token");

const getConfig = () => {
  return {
    headers: {
      "Content-Type": "multipart/form-data",
      Accept: "application/json",
      Authorization: `Bearer ${token}`,
    },
  };
};

// Create Subscription Chit
export const addSubscriptionChitServ = async (formData) => {
  try {
    const response = await axios.post(BASE_URL + "subscription/create", formData);
    return response;
  } catch (error) {
    console.error("Error creating subscription chit:", error);
    throw error;
  }
};

// List Subscription Chits
export const getSubscriptionChitListServ = async (formData) => {
  try {
    const response = await axios.post(BASE_URL + "subscription/list", formData);
    return response;
  } catch (error) {
    console.error("Error fetching subscription chit list:", error);
    throw error;
  }
};

// Get Subscription Chit Details
export const getSubscriptionChitDetailsServ = async (id) => {
  try {
    const response = await axios.get(BASE_URL + "subscription/details/" + id);
    return response;
  } catch (error) {
    console.error("Error fetching subscription chit details:", error);
    throw error;
  }
};

// Update Subscription Chit
export const updateSubscriptionChitServ = async (formData) => {
  try {
    const response = await axios.put(BASE_URL + "subscription/update", formData);
    return response;
  } catch (error) {
    console.error("Error updating subscription chit:", error);
    throw error;
  }
};

// Delete Subscription Chit
export const deleteSubscriptionChitServ = async (id) => {
  try {
    const response = await axios.delete(BASE_URL + "subscription/delete/" + id);
    return response;
  } catch (error) {
    console.error("Error deleting subscription chit:", error);
    throw error;
  }
};


// Update Subscription Chit Payment Status
export const updateSubscriptionChitPaymentStatusServ = async (formData) => {
  try {
    const response = await axios.put(
      BASE_URL + "subscription/update/payment-status",
      formData
    );
    return response;
  } catch (error) {
    console.error("Error updating subscription chit payment status:", error);
    throw error;
  }
};


// List Subscription Chit Users with status filter
export const getSubscriptionChitUsersListServ = async (formData) => {
  try {
    const response = await axios.post(
      BASE_URL + "subscription/subscription-users/list",
      formData
    );
    return response;
  } catch (error) {
    console.error("Error fetching subscription chit users list:", error);
    throw error;
  }
};

// Approve Subscription Chit User
export const approveSubscriptionChitUserServ = async (id) => {
  try {
    const response = await axios.put(BASE_URL + "subscription/approve/" + id);
    return response;
  } catch (error) {
    console.error("Error approving subscription chit user:", error);
    throw error;
  }
};


// Cancel Subscription Chit User
export const cancelSubscriptionChitUserServ = async (id) => {
  try {
    const response = await axios.put(BASE_URL + "subscription/cancel/" + id);
    return response;
  } catch (error) {
    console.error("Error cancelling subscription chit user:", error);
    throw error;
  }
};

// Close (Complete) Subscription Chit User
export const closeSubscriptionChitUserServ = async (id) => {
  try {
    const response = await axios.put(BASE_URL + "subscription/close/" + id);
    return response;
  } catch (error) {
    console.error("Error closing subscription chit user:", error);
    throw error;
  }
};

export const exportSubscriptionChitUserServ = async (formData) => {
  try {
    const response = await axios.post(
      BASE_URL + "subscription/export",
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