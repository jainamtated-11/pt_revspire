import axios from "axios";

export const fetchContents = async (data) => {
  try {
    const modifiedData = {
      ...data,
      thumbnail: 1,
    };

     if(data.baseURL){
      const response = await axios.post(
        `${data.baseURL}/view-content-and-folders-sorted`,
        data,
        {
          withCredentials: true // Include credentials in the request
        }
      );
      return response;
     }
  } catch (error) {
    if (error.response && error.response.status === 401) {
      const { protocol, host } = window.location;
      const loginUrl = `${protocol}//${host}/login`;
      window.location.href = loginUrl;
    }
    return Promise.reject(error);
  }
};

export const fetchModalContents = async (data) => {
  
  try {

    const response = await axios.post(
      `${data.baseURL}/view-content-and-folders-sorted`,
      data,
      {
        withCredentials: true // Include credentials in the request
      }
    );
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


