import React, { useContext, useState } from "react";
import axios from "axios";
import toast from "react-hot-toast";
import { GlobalContext } from "../../../context/GlobalState";
import { MdDeleteOutline } from "react-icons/md";

const DeleteSso = ({ selectedProvider, onDeleteSuccess }) => {
  const { baseURL, viewer_id } = useContext(GlobalContext);
  const [isDeleting, setIsDeleting] = useState(false);

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
      setIsDeleting(false);
    }
  };

  return (
    <>
      <button
        onClick={handleDelete}
        className={`hover:bg-neutral-200 p-1 px-2 text-neutral-800 hover:text-cyan-800 rounded-md transition-all flex items-center gap-1 justify-center}`}
      >
        {" "}
        <MdDeleteOutline className="text-lg" /> Delete SSO
      </button>
    </>
  );
};

export default DeleteSso;
