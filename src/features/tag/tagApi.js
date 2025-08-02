import axios from "axios";

export const fetchTags = async (data) => {
  try {
    const response = await axios.post(`${data.baseURL}/view-all-tags-sorted`, data,
    {
      withCredentials: true // Include credentials in the request if necessary
    });
    return response;
  } catch (error) {
    if (error.response && error.response.status === 401) {
      const { protocol, host } = window.location;
      const loginUrl = `${protocol}//${host}/login`;
      window.location.href = loginUrl;
    }
    return Promise.reject(error);
  }
};

export const fetchFilterTags = () => {
  const storedArrayString = localStorage.getItem('tagData');
  const data = {
    data: [],
    filterApplied: false,
  };
  const Data = JSON.stringify(data);
  localStorage.setItem('tagData', Data);
  if (storedArrayString) {
    return JSON.parse(storedArrayString);
  }
  return data; 
};
