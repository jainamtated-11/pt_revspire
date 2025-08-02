import axios from "axios";
// const ( viewer_id, organisaiton_id } = req. body;
// function for fetching the api token data
export const fetchApiTokens= async (data) => {
  console.log("data",data);
  try {
    const response = await axios.post(`${data.baseURL}/view-api-tokens`,
      {
        viewer_id : data.viewer_id,
        organisation_id : data.organisation_id,
      }, 
    {
      withCredentials: true, // Include credentials in the request
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

