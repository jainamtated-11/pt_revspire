// Remove axios import since we'll use the passed instance

export const fetchObjects = async (axiosInstance, data) => {
  try {
    const response = await axiosInstance.post(`/retrieve-filter-object`, data, {
      withCredentials: true,
    });
    return response;
  } catch (error) {
    if (error.response?.status === 401) {
      const { protocol, host } = window.location;
      window.location.href = `${protocol}//${host}/login`;
    }
    return Promise.reject(error);
  }
};

export const fetchConditions = async (axiosInstance, data) => {
  try {
    const response = await axiosInstance.post(
      `/retrieve-condition-types`,
      data,
      {
        withCredentials: true,
      }
    );
    return response.data;
  } catch (error) {
    if (error.response?.status === 401) {
      const { protocol, host } = window.location;
      window.location.href = `${protocol}//${host}/login`;
    }
    return Promise.reject(error);
  }
};

export const fetchValueTypes = async (axiosInstance, data) => {
  try {
    const response = await axiosInstance.post(
      `/retrieve-condition-value-types`,
      data,
      { withCredentials: true }
    );
    return response.data;
  } catch (error) {
    if (error.response?.status === 401) {
      const { protocol, host } = window.location;
      window.location.href = `${protocol}//${host}/login`;
    }
    return Promise.reject(error);
  }
};

export const fetchValues = async (axiosInstance, data) => {
  try {
    const response = await axiosInstance.post(
      `/retrieve-relative-values`,
      data,
      {
        withCredentials: true,
      }
    );
    return response.data;
  } catch (error) {
    if (error.response?.status === 401) {
      const { protocol, host } = window.location;
      window.location.href = `${protocol}//${host}/login`;
    }
    return Promise.reject(error);
  }
};

export const fetchFields = async (axiosInstance, data) => {
  try {
    const response = await axiosInstance.post(`/retrieve-field-values`, data, {
      withCredentials: true,
    });
    return response.data;
  } catch (error) {
    if (error.response?.status === 401) {
      const { protocol, host } = window.location;
      window.location.href = `${protocol}//${host}/login`;
    }
    return Promise.reject(error);
  }
};

export const fetchFilterData = async (axiosInstance, data) => {
  try {
    const response = await axiosInstance.post(`/filter`, data, {
      withCredentials: true,
    });
    return response.data;
  } catch (error) {
    if (error.response?.status === 401) {
      const { protocol, host } = window.location;
      window.location.href = `${protocol}//${host}/login`;
    }
    return Promise.reject(error);
  }
};
