import axios from "axios";

export const fetchLayouts = async (data) => {

  try {
    const response = await axios.post(
      `${data.baseURL}/all-pitch-layout-names`,

      {
        is_active: 0,
        viewer_id: data.viewer_id
      },
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
