// src/features/dataEnrichment/dataEnrichmentApi.js
import axios from "axios";

// Fetch all providers
export const fetchProviders = async (data) => {
  try {
    const { baseURL, ...payload } = data; // Remove baseURL from payload
    const response = await axios.post(
      `${baseURL}/data-enrichment/get-enrichment-providers`,
      payload,
      { withCredentials: true }
    );
    return response.data.providers;
  } catch (error) {
    if (error.response && error.response.status === 401) {
      const { protocol, host } = window.location;
      window.location.href = `${protocol}//${host}/login`;
    }
    return Promise.reject(error);
  }
};

// Create a new provider
export const createProvider = async (data) => {
  try {
    const { baseURL, ...payload } = data;
    const response = await axios.post(
      `${baseURL}/create-data-enrichment`,
      payload,
      { withCredentials: true }
    );
    return response.data;
  } catch (error) {
    return Promise.reject(error);
  }
};

// Activate provider(s)
export const activateProvider = async (data) => {
  try {
    const { baseURL, ...payload } = data;
    const response = await axios.post(
      `${baseURL}/data-enrichment/activate`,
      payload,
      { withCredentials: true }
    );
    return response.data;
  } catch (error) {
    return Promise.reject(error);
  }
};

// Deactivate provider(s)
export const deactivateProvider = async (data) => {
  try {
    const { baseURL, ...payload } = data;
    const response = await axios.post(
      `${baseURL}/data-enrichment/deactivate`,
      payload,
      { withCredentials: true }
    );
    return response.data;
  } catch (error) {
    return Promise.reject(error);
  }
};

// Make provider primary
export const makePrimaryProvider = async (data) => {
  try {
    const { baseURL, ...payload } = data;
    const response = await axios.post(
      `${baseURL}/data-enrichment/make-primary`,
      payload,
      { withCredentials: true }
    );
    return response.data;
  } catch (error) {
    return Promise.reject(error);
  }
};