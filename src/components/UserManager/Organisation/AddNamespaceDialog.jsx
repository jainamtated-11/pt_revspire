import React, { useState, useContext, useRef, useEffect } from "react";
import axios from "axios";
import { GlobalContext } from "../../../context/GlobalState";
import toast from "react-hot-toast";
import useAxiosInstance from "../../../Services/useAxiosInstance";
import { LuLoaderCircle } from "react-icons/lu";

const AddNamespaceDialog = ({ onClose, onSuccess }) => {
  const [name, setName] = useState("");
  const [loading, setLoading] = useState(false);
  const {
    selectedOrganisationId,
    setSelectedOrganisationId,
    baseURL,
    viewer_id,
  } = useContext(GlobalContext);
  const axiosInstance = useAxiosInstance();
  const dialogRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dialogRef.current && !dialogRef.current.contains(event.target)) {
        onClose();
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [onClose]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    const url = `/insert-authorised-namespace`;

    try {
      const response = await axiosInstance.post(
        url,
        {
          name,
          viewer_id,
          organisation: selectedOrganisationId,
        },
        {
          withCredentials: true,
        }
      );
      if (response.status === 200) {
        onSuccess();
        toast.success("Added new namespace");
        onClose();
      } else {
        throw new Error("Failed to submit data");
      }
    } catch (error) {
      toast.error("Error submitting data");
      console.error("Error submitting data:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 flex items-center justify-center z-50">
      <div className="absolute inset-0 bg-gray-800 bg-opacity-50"></div>
      <div
        ref={dialogRef}
        className="bg-white p-8 rounded-lg shadow-xl w-full max-w-lg relative"
      >
        <h3 className="text-2xl font-semibold text-center text-neutral-800 mb-6">
          Add Namespace
        </h3>
        <div className="space-y-4">
          <div className="flex flex-col">
            <label
              htmlFor="name"
              className="text-sm font-medium text-gray-700 mb-1"
            >
              Name
            </label>
            <input
              id="name"
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="p-2 outline-none bg-neutral-100 border border-neutral-300 hover:border-blue-400 hover:bg-neutral-100 transition-all rounded-lg placeholder:text-neutral-400 text-neutral-800 focus:border-blue-500"
              placeholder="Enter namespace name"
            />
          </div>
        </div>
        <div className="flex justify-between items-center mt-6">
          <button
            className="px-6 py-2 text-sm text-red-600 bg-red-100 rounded-lg hover:bg-red-200 transition-colors border border-red-200"
            onClick={onClose}
          >
            Cancel
          </button>
          <button
            className={`px-6 py-2 flex items-center justify-center text-sm text-white btn-secondary w-[96px] h-[38px] ${
              !name.trim() && "opacity-80 cursor-not-allowed"
            }`}
            onClick={handleSubmit}
            disabled={!name.trim() || loading}
          >
            {loading ? <LuLoaderCircle className="text-lg animate-spin" /> : "Save"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default AddNamespaceDialog;
