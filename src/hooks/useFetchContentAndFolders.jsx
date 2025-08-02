import { useContext } from "react";
import { useQuery } from "react-query";
import { GlobalContext } from "../../src/context/GlobalState.jsx";
import useAxiosInstance from "../Services/useAxiosInstance.jsx";

const useContentAndFoldersSorted = ({ sortOption = "type", order = "ASC" }) => {
  const {
    viewer_id,
    folder_id,
    setContents,
    setFolder_id,
    setBreadcrumbs,
    setDialogBreadcrumbs,
  } = useContext(GlobalContext);
  const axiosInstance = useAxiosInstance();

  const queryInfo = useQuery(
    [
      "viewContentAndFoldersSorted",
      { viewer_id, folder_id, sortOption, order },
    ],
    async () => {
      try {
        const response = await axiosInstance.post(`view-content-and-folders-sorted`,{
            viewer_id,
            folder_id,
            sortOption,
            order,
          });

          console.log("from fetch");
          
        return response.data;
      } catch (error) {
        console.error("Error fetching content and folders:", error);
        throw error; // Rethrow the error to be caught by react-query
      }
    },
    {
      staleTime: 1000 * 60 * 5, // 5 minutes in milliseconds
      cacheTime: 1000 * 60 * 30, // 30 minutes in milliseconds
      refetchOnWindowFocus: true,
      onSuccess: (data) => {
        setContents(data.items); // Update contents state directly
        if (!folder_id) {
          setFolder_id(data.root_folder_id);
          setBreadcrumbs((prevState) => {
            // Update the id of the first breadcrumb item
            const updatedBreadcrumbs = [...prevState];
            updatedBreadcrumbs[0] = {
              ...updatedBreadcrumbs[0],
              id: data.root_folder_id,
            };
            return updatedBreadcrumbs;
          });
          setDialogBreadcrumbs((prevState) => {
            // Update the id of the first breadcrumb item
            const updatedBreadcrumbs = [...prevState];
            updatedBreadcrumbs[0] = {
              ...updatedBreadcrumbs[0],
              id: data.root_folder_id,
            };
            return updatedBreadcrumbs;
          });
        }
      },
      onError: (error) => {
        console.log("An error occurred:", error);
      },
      onSettled: (data, error) => {
        if (error) {
          console.log("Request finished with error:", error);
        }
      },
    }
  );

  return { ...queryInfo, refetch: queryInfo.refetch };
};

export default useContentAndFoldersSorted;
