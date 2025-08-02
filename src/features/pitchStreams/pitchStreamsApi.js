import axios from "axios";

export const fetchPitchStreams = async (data) => {
  try {
    const response = await axios.post(
      `${data.baseURL}/view-all-pitches-streams-sorted`,
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
