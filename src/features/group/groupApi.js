import axios from "axios";

export const fetchGroups = async (data) => {

  const payload = {
    viewer_id: data.viewer_id,
    organisation_id: data.organisation_id,
    base_url: data.baseURL,
  };

  try {
    const response = await axios.post(
      `${data.baseURL}/groups/get-groups`,
      payload,
      {
        headers: {
          Accept: "application/json, text/plain, */*",
        },
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
