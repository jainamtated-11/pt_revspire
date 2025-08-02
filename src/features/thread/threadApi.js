import axios from "axios";

export const fetchThreads = async (data) => {
  try {
    const response = await axios.post(
      `${data.baseURL}/threads/get-pitch-with-threads`,
      data,
      {
        withCredentials: true,
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
