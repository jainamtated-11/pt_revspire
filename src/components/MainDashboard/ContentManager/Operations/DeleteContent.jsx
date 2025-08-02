import React, { useContext, useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faTrash } from "@fortawesome/free-solid-svg-icons";
import { GlobalContext } from "../../../../context/GlobalState.jsx";
import { useSelector, useDispatch } from "react-redux";
import {
  fetchContentsAsync,
  UnSelectAllItems,
} from "../../../../features/content/contentSlice.js";
import useAxiosInstance from "../../../../Services/useAxiosInstance.jsx";
import toast from "react-hot-toast";
import WarningDialog from "../../../../utility/WarningDialog.jsx";
import useOutsideClick from "../../../../hooks/useOutsideClick.js";
import { useCookies } from "react-cookie";

const DeleteContent = ({ inDialog = false }) => {
  const { viewer_id, baseURL } = useContext(GlobalContext);
  const axiosInstance = useAxiosInstance();

  const dispatch = useDispatch();
  const [cookies] = useCookies(["userData"]);
  const organisation_id = cookies.userData?.organisation?.id;

  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const breadcrumbs = useSelector((state) => state.contents.breadcrumbs);
  const selectedItems = useSelector((state) => state.contents.selectedItems);

  const handleOperation = async (operationType) => {
    const ids = selectedItems.map((item) => item.id);

    try {
      setIsLoading(true);
      const response = await axiosInstance.post(
        `${operationType}-for-deletion`,
        {
          ids: ids,
          updated_by: viewer_id,
        }
      );

      if (response.data.success) {
        const toastMessage =
          operationType === "flag"
            ? "Files deleted successfully."
            : "Refresh to view restored files.";
        toast.success(toastMessage, {
          position: "top-right",
          autoClose: 5000,
          hideProgressBar: true,
          closeOnClick: false,
          pauseOnHover: false,
          draggable: false,
          progress: undefined,
          onClick: () => handleOperation("unflag"),
        });
        dispatch(UnSelectAllItems());
        dispatch(
          fetchContentsAsync({
            viewer_id,
            folder_id: breadcrumbs[breadcrumbs.length - 1].id,
            baseURL: baseURL,
            organisation_id,
            thumbnail:1,
          })
        );
      } else {
        toast.error("An error occurred while performing the operation.");
      }
    } catch (error) {
      console.error(`Error occurred while ${operationType}ing:`, error.message);
      toast.error("An error occurred while performing the operation.");
    } finally {
      setIsOpen(false);
      setIsLoading(false);
    }
  };

  const handleDeleteClick = (e) => {
    handleOperation("flag");
  };

  const handleOpenDialog = () => {
    setIsOpen(true);
  };

  const actions = () => {
    setIsOpen(false);
  };
  const modalRef = useOutsideClick([actions]);

  return (
    <>
      {isOpen && (
        <WarningDialog
          title="Are you sure?"
          content="Deleting a content or a folder deletes all the tags or pitch contents affiliated with the contents ."
          onConfirm={handleDeleteClick}
          onCancel={() => setIsOpen(false)}
          onEnter={handleDeleteClick}
          modalRef={modalRef}
          isLoading={isLoading}
        />
      )}
      <button
        type="button"
        className=" flex items-center text-secondary text-[14px] py-1 px-2 my-1 rounded-md border-solid hover:bg-gray-200 dark:text-gray-200 dark:hover:bg-gray-700 dark:border-gray-500"
        onClick={handleOpenDialog}
      >
        <FontAwesomeIcon icon={faTrash} className="mr-2" />
        Delete
      </button>
    </>
  );
};

export default DeleteContent;
