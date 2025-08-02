import axios from "axios";

export const fetchConnections = async ({
  viewerId,
  baseURL,
}) => {
  try {
    const response = await axios.post(
      `${baseURL}/view-all-crm-connections`,
      {
        viewer_id: viewerId,
      },
      {
        withCredentials: true,
      }
    );
    return response.data.connections;
  } catch (error) {
    console.error("Error fetching connections:", error);
    return [];
  }
};
