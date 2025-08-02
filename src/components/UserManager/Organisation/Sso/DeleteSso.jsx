import React, { useContext, useState } from "react";
import axios from "axios";
import { GlobalContext } from "../../../../context/GlobalState";
import DeleteSsoIcon from "./DeleteSsoIcon";
import toast from "react-hot-toast";
import { MdOutlineDeleteOutline } from "react-icons/md";
import WarningDialog from "../../../../utility/WarningDialog.jsx";

const DeleteSso = ({ selectedProvider, onDeleteSuccess }) => {
  const { baseURL, viewer_id } = useContext(GlobalContext);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const handleDelete = async () => {
    if (!selectedProvider) return;

    setIsDeleting(true);

    try {
      const response = await axios.delete(
        `${baseURL}/delete-organisation_sso`,
        {
          data: {
            id: selectedProvider,
            viewer_id,
            organisation_id: selectedProvider,
          },
          withCredentials: true, // Include credentials if necessary
        }
      );
      if (response.status === 200) {
        onDeleteSuccess();
        toast.success("Row Deleted Successfully");
      } else {
        console.error("Failed to delete SSO:", response.data.message);
      }
    } catch (error) {
      console.error("Error deleting SSO:", error);
    } finally {
      setIsDialogOpen(false);
      setIsDeleting(false);
    }
  };

  const handleDeleteClick = () => {
    setIsDialogOpen(true); // Open the dialog when delete button is clicked
  };

  const handleCancel = () => {
    setIsDialogOpen(false); // Close the dialog when cancel is clicked
  };

  return (
    <>
      <button
        type="button"
        className="hover:bg-neutral-200 p-1 px-2 text-neutral-800 hover:text-cyan-800 rounded-md transition-all flex items-center justify-center"
        onClick={handleDeleteClick} // Open dialog instead of directly deleting
      >
        <MdOutlineDeleteOutline className="text-lg" /> Delete
      </button>
      {isDialogOpen && (
        <WarningDialog
          title="Are you sure?"
          content="Deleting a content or a folder deletes all the tags or pitche contents affiliated with the contents."
          onConfirm={handleDelete} // Proceed with deletion on confirm
          onCancel={handleCancel} // Close dialog on cancel
          onEnter={handleDelete}
          isLoading={isDeleting}
        />
      )}
    </>
  );
};

export default DeleteSso;
