import { useContext } from "react";
import { useQuery } from "react-query";
import axios from "axios";
import { GlobalContext } from "../../src/context/GlobalState.jsx";
import useAxiosInstance from "../Services/useAxiosInstance.jsx";
const useTagContent = () => {
  const { viewer_id } = useContext(GlobalContext);
  const axiosInstance = useAxiosInstance();

  return useQuery(
    ["viewAllTagsSorted", { viewer_id }],
    async () => {
      try {
        const res = await axiosInstance.post(`/view-all-tags-sorted`, {
          viewer_id,
        });
        return res.data.tags;
      } catch (error) {
        throw new Error(error.response.data.message || error.message);
      }
    },
    {
      staleTime: 1000 * 60 * 5, // 5 minutes in milliseconds
      cacheTime: 1000 * 60 * 30, // 30 minutes in milliseconds
      refetchOnWindowFocus: true, // Refetch the data when the window gains focus
      onError: (error) => {
        console.log("An error occurred:", error);
      },
      onSuccess: (data) => {
        // console.log("Data successfully fetched:", data);
      },
      onSettled: (data, error) => {
        if (error) {
          console.log("Request finished with error:", error);
        } else {
          // console.log("Request finished successfully:", data);
        }
      },
    }
  );
};

export default useTagContent;
