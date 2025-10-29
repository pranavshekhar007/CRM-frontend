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

// State
export const getStateServ = async (formData) => {
  try {
    const response = await axios.post(BASE_URL + "state/list", formData);
    return response;
  } catch (error) {
    // Handle error (e.g., log or throw an error)
    console.error("Error fetching data:", error);
    throw error;
  }
};

export const addStateServ = async (formData) => {
  try {
    const response = await axios.post(BASE_URL + "state/create", formData);
    return response;
  } catch (error) {
    // Handle error (e.g., log or throw an error)
    console.error("Error fetching data:", error);
    throw error;
  }
};

export const updateStateServ = async (formData) => {
  try {
    const response = await axios.put(BASE_URL + "state/update", formData);
    return response;
  } catch (error) {
    // Handle error (e.g., log or throw an error)
    console.error("Error fetching data:", error);
    throw error;
  }
};
export const deleteStateServ = async (id) => {
  try {
    const response = await axios.delete(BASE_URL + "state/delete/"+id);
    return response;
  } catch (error) {
    // Handle error (e.g., log or throw an error)
    console.error("Error fetching data:", error);
    throw error;
  }
};

export const bulkDeleteStateServ = async (ids) => {
  try {
    const response = await axios.post(`${BASE_URL}state/bulk-delete`, {
      ids,
    });
    return response;
  } catch (error) {
    console.error("Bulk delete error:", error);
    throw error;
  }
};

// City
export const getCityServ = async (formData) => {
    try {
      const response = await axios.post(BASE_URL + "city/list", formData);
      return response;
    } catch (error) {
      // Handle error (e.g., log or throw an error)
      console.error("Error fetching data:", error);
      throw error;
    }
  };
  
  export const addCityServ = async (formData) => {
    try {
      const response = await axios.post(BASE_URL + "city/create", formData);
      return response;
    } catch (error) {
      // Handle error (e.g., log or throw an error)
      console.error("Error fetching data:", error);
      throw error;
    }
  };
  
  export const updateCityServ = async (formData) => {
    try {
      const response = await axios.put(BASE_URL + "city/update", formData);
      return response;
    } catch (error) {
      // Handle error (e.g., log or throw an error)
      console.error("Error fetching data:", error);
      throw error;
    }
  };
  export const deleteCityServ = async (id) => {
    try {
      const response = await axios.delete(BASE_URL + "city/delete/"+id);
      return response;
    } catch (error) {
      // Handle error (e.g., log or throw an error)
      console.error("Error fetching data:", error);
      throw error;
    }
  };

  export const bulkDeleteCityServ = async (ids) => {
    try {
      const response = await axios.post(`${BASE_URL}city/bulk-delete`, {
        ids,
      });
      return response;
    } catch (error) {
      console.error("Bulk delete error:", error);
      throw error;
    }
  };

  export const getCityByStateServ = async (stateId) => {
    try {
      const response = await axios.get(BASE_URL + `city?stateId=${stateId}`);
      return response;
    } catch (error) {
      console.error("Error fetching cities by state:", error);
      throw error;
    }
  };

  // Pincode

export const getPincodeServ = async (formData) => {
  try {
    const response = await axios.post(BASE_URL + "pin-code/list", formData);
    return response;
  } catch (error) {
    console.error("Error fetching pincode list:", error);
    throw error;
  }
};

export const addPincodeServ = async (formData) => {
  try {
    const response = await axios.post(BASE_URL + "pin-code/create", formData);
    return response;
  } catch (error) {
    console.error("Error adding pincode:", error);
    throw error;
  }
};

export const updatePincodeServ = async (formData) => {
  try {
    const response = await axios.put(BASE_URL + "pin-code/update", formData);
    return response;
  } catch (error) {
    console.error("Error updating pincode:", error);
    throw error;
  }
};

export const deletePincodeServ = async (id) => {
  try {
    const response = await axios.delete(BASE_URL + "pin-code/delete/" + id);
    return response;
  } catch (error) {
    console.error("Error deleting pincode:", error);
    throw error;
  }
};

export const getPincodeByCityServ = async (cityId) => {
  try {
    const response = await axios.post(BASE_URL + "pin-code/get-by-city", {
      cityId,
    });
    return response;
  } catch (error) {
    console.error("Error fetching pincodes by city:", error);
    throw error;
  }
};


// Get Area List
export const getAreaServ = async (formData) => {
  try {
    const response = await axios.post(BASE_URL + "area/list", formData);
    return response;
  } catch (error) {
    console.error("Error fetching area list:", error);
    throw error;
  }
};

// Add Area
export const addAreaServ = async (formData) => {
  try {
    const response = await axios.post(BASE_URL + "area/create", formData);
    return response;
  } catch (error) {
    console.error("Error adding area:", error);
    throw error;
  }
};

// Update Area
export const updateAreaServ = async (formData) => {
  try {
    const response = await axios.put(BASE_URL + "area/update", formData);
    return response;
  } catch (error) {
    console.error("Error updating area:", error);
    throw error;
  }
};

// Delete Area
export const deleteAreaServ = async (id) => {
  try {
    const response = await axios.delete(BASE_URL + "area/delete/" + id);
    return response;
  } catch (error) {
    console.error("Error deleting area:", error);
    throw error;
  }
};

export const getAreaByPincodeServ = async (pincodeId) => {
  try {
    const response = await axios.post(BASE_URL + "area/get-by-pincode", {
      pincodeId,
    });
    return response;
  } catch (error) {
    console.error("Error fetching areas by pincodeId:", error);
    throw error;
  }
};


// Bulk Location Upload 
export const bulkUploadLocationServ = async (formData) => {
  try {
    const response = await axios.post(
      `${BASE_URL}bulk-location/bulk-upload`,
      formData,
      getConfig()
    );
    return response.data;
  } catch (error) {
    console.error("Bulk Upload Error:", error);
    throw error;
  }
};

export const bulkDownloadLocationServ = async (payload) => {
  try {
    const response = await axios.post(
      `${BASE_URL}bulk-location/bulk-download`,
      payload,
      {
        responseType: "blob",
      }
    );
    return response;
  } catch (error) {
    console.error("Bulk download failed:", error);
    throw error;
  }
};