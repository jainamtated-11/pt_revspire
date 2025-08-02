import React, { useContext, useEffect, useState } from "react";
import PropTypes from "prop-types";
import { useDispatch, useSelector } from "react-redux";
import { GlobalContext } from "../../../../context/GlobalState";
import useAxiosInstance from "../../../../Services/useAxiosInstance";
import FileNotFound from "../../../../assets/versions-fileNotFound.png";
import { fetchContentsAsync } from "../../../../features/content/contentSlice";
import { toast } from "react-hot-toast";
import VersionUploadModal from "./VersionUploadModal";
import { useCookies } from "react-cookie";
import { 
  FiRotateCcw, 
  FiUpload, 
  FiX, 
  FiPlus, 
  FiClock,
  FiUser,
  FiEdit2,
  FiAlertCircle,
  FiCheck,
  FiRefreshCw
} from "react-icons/fi";
import { 
  HiOutlineArrowUpTray,
  HiOutlineArrowsRightLeft
} from "react-icons/hi2";
import { TbVersions } from "react-icons/tb";
import { Tooltip } from 'react-tooltip';
import 'react-tooltip/dist/react-tooltip.css';
import { motion, AnimatePresence } from "framer-motion";

const VersionModal = ({ onClose }) => {
  const [versions, setVersions] = useState([]);
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [versionToRevert, setVersionToRevert] = useState(null);
  const [activeDropdownId, setActiveDropdownId] = useState(null);
  const [isPushing, setIsPushing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [showUploadModal, setShowUploadModal] = useState(false);

  const selectedItems = useSelector((state) => state.contents.selectedItems);
  const [cookies] = useCookies(["userData"]);
  const organisation_id = cookies.userData?.organisation?.id;
  const { viewer_id, folder_id, baseURL, setNextVersionNumber, setContentId, contentId } =
    useContext(GlobalContext);
  const dispatch = useDispatch();
  const axiosInstance = useAxiosInstance();

  const toggleDropdown = (versionId) => {
    setActiveDropdownId(activeDropdownId === versionId ? null : versionId);
  };

  const handleShowVersions = async () => {
    try {
      setLoading(true);
      const response = await axiosInstance.post("/retrieve-content-versions", {
        content_id: contentId,
        viewer_id: viewer_id,
      });
      if (response.data.success) {
        setVersions(response.data.content);
        setNextVersionNumber(response.data.content.length);
      }
    } catch (error) {
      console.error("Error fetching versions:", error);
      toast.error("Failed to load versions");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    setContentId(selectedItems[0]?.id ?? 0);
  }, []);

  useEffect(() => {
    if (selectedItems[0]?.id === contentId) {
      handleShowVersions();
    }
  }, [showUploadModal, contentId, selectedItems]);

  const handleRevertClick = (version) => {
    setVersionToRevert(version);
    setShowConfirmation(true);
  };

  const handleRevert = async () => {
    if (versionToRevert) {
      try {
        const response = await axiosInstance.post("/revert-content-version", {
          content_id: contentId,
          revert_content_id: versionToRevert.id,
          viewer_id: viewer_id,
        });

        if (response) {
          toast.success("Successfully reverted version");
          setShowConfirmation(false);
          onClose();
          handleShowVersions();
        } else {
          toast.error("Failed to revert version");
        }
      } catch (error) {
        console.error("Error reverting version:", error);
        toast.error("Error reverting version");
      }
    } else {
      toast.error("Please select a version to revert to");
    }
    
    dispatch(
      fetchContentsAsync({ viewer_id, folder_id: folder_id, baseURL: baseURL, organisation_id })
    );
  };

  const handlePushVersion = async (contentId, filterType) => {
    try {
      setIsPushing(true);
      const payload = {
        viewer_id,
        organisation_id,
        content_id: contentId
      };

      if (filterType !== "both") {
        payload.pitch_stream_filter = filterType === "streams" ? 1 : 0;
      }

      const response = await axiosInstance.post(
        "https://api.revspire.io/push-latest-content",
        payload
      );

      if (response.data.success) {
        toast.success(`Version pushed to ${filterType === "both" ? "Pitches & Streams" : filterType}`);
      } else {
        toast.error("Failed to push version");
      }
    } catch (error) {
      console.error("Error pushing version:", error);
      toast.error("Error pushing version");
    } finally {
      setIsPushing(false);
      setActiveDropdownId(null);
    }
  };

  const sortedVersions = versions.length > 1
    ? [...versions]
        .sort((a, b) => new Date(b.updated_at) - new Date(a.updated_at))
        .slice(1)
    : versions;

  return (
    <div className="fixed inset-0 flex items-center justify-center z-50 p-4">
      {/* Backdrop with animation */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 0.5 }}
        exit={{ opacity: 0 }}
        className="absolute inset-0 bg-black"
        onClick={onClose}
      />
      
      {/* Modal content with animation */}
      <motion.div
        initial={{ scale: 0.95, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.95, opacity: 0 }}
        className="relative bg-white rounded-xl shadow-2xl z-10 w-full max-w-4xl max-h-[90vh] flex flex-col overflow-hidden"
      >
        {/* Modal header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-100">
          <div className="flex items-center space-x-3">
            <TbVersions className="w-6 h-6 text-indigo-600" />
            <h2 className="text-xl font-bold text-gray-800">Version History</h2>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-full hover:bg-gray-100 transition-colors"
            data-tooltip-id="tooltip"
            data-tooltip-content="Close"
          >
            <FiX className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        {/* File info */}
        <div className="px-6 pt-4">
          <div className="inline-flex items-center bg-blue-50 text-blue-800 px-3 py-1.5 rounded-lg text-sm font-medium">
            <span className="truncate max-w-xs">{selectedItems[0]?.name}</span>
          </div>
        </div>

        {/* Loading state */}
        {loading ? (
          <div className="flex flex-col items-center justify-center flex-grow p-6 min-h-[400px]">
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ repeat: Infinity, duration: 1, ease: "linear" }}
              className="w-10 h-10 border-4 border-indigo-500 border-t-transparent rounded-full mb-4"
            />
            <p className="text-gray-600 font-medium">Loading versions...</p>
          </div>
        ) : (
          /* Content area */
          <div className="flex flex-col flex-grow overflow-hidden">
            {/* Versions list */}
            <div className="flex-grow overflow-y-auto p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-800 flex items-center">
                  <FiClock className="mr-2 text-indigo-500" />
                  Available Versions
                </h3>
                <button
                  onClick={handleShowVersions}
                  className="text-sm text-indigo-600 hover:text-indigo-800 flex items-center"
                  data-tooltip-id="tooltip"
                  data-tooltip-content="Refresh versions"
                >
                  <FiRefreshCw className="mr-1" />
                  Refresh
                </button>
              </div>

                {versions.length <= 1 ? (
                  <div className="flex flex-col items-center justify-center py-12 text-center min-h-[400px]">
                    <img
                      src={FileNotFound}
                      alt="No versions"
                      className="w-64 h-64 object-contain opacity-80"
                    />
                    <h4 className="text-lg font-medium text-gray-500 mt-6">
                      No versions available
                    </h4>
                    <p className="text-gray-400 mt-2 max-w-md">
                      Upload a new version to track changes to this file.
                    </p>
                  </div>
                ) : (
                <div className="space-y-4">
                  {sortedVersions.map((version, index) => (
                    <motion.div
                      key={version.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.05 }}
                      className="bg-white rounded-lg border border-gray-200 p-4 hover:shadow-sm transition-shadow"
                    >
                      <div className="flex justify-between items-start">
                        {/* Version info */}
                        <div className="space-y-2">
                          <div className="flex items-center">
                            <span className="bg-indigo-100 text-indigo-800 text-xs font-medium px-2.5 py-0.5 rounded-full">
                              V1.{sortedVersions.length - index}
                            </span>
                            {index === 0 && (
                              <span className="ml-2 bg-green-100 text-green-800 text-xs font-medium px-2 py-0.5 rounded-full flex items-center">
                                <FiCheck className="mr-1 w-3 h-3" />
                                Latest
                              </span>
                            )}
                          </div>
                          
                          <div className="text-sm text-gray-600 flex items-center">
                            <FiClock className="mr-1.5 opacity-70" />
                            {new Date(version.updated_at).toLocaleString()}
                          </div>
                          
                          <div className="text-sm text-gray-600 flex items-center">
                            <FiUser className="mr-1.5 opacity-70" />
                            {version.updated_by_name || version.created_by_name}
                          </div>
                          
                          {version.description && (
                            <div className="text-sm text-gray-600 flex">
                              <FiEdit2 className="mr-1.5 mt-0.5 opacity-70" />
                              <span className="text-gray-700">{version.description}</span>
                            </div>
                          )}
                        </div>

                        {/* Action buttons */}
                        <div className="flex items-center space-x-2">
                          <button
                            onClick={() => handleRevertClick(version)}
                            className="p-2 text-gray-600 hover:text-indigo-600 hover:bg-indigo-50 rounded-full transition-colors"
                            data-tooltip-id="tooltip"
                            data-tooltip-content="Revert to this version"
                          >
                            <HiOutlineArrowsRightLeft className="w-5 h-5" />
                          </button>

                          <div className="relative">
                            <button
                              onClick={() => toggleDropdown(version.id)}
                              className="p-2 text-gray-600 hover:text-indigo-600 hover:bg-indigo-50 rounded-full transition-colors"
                              disabled={isPushing}
                              data-tooltip-id="tooltip"
                              data-tooltip-content="Push version to..."
                            >
                              <HiOutlineArrowUpTray className="w-5 h-5" />
                            </button>

                            <AnimatePresence>
                              {activeDropdownId === version.id && (
                                <motion.div
                                  initial={{ opacity: 0, y: 10 }}
                                  animate={{ opacity: 1, y: 0 }}
                                  exit={{ opacity: 0, y: 10 }}
                                  className="absolute right-0 mt-1 w-48 bg-white rounded-md shadow-lg z-10 border border-gray-200"
                                >
                                  <div className="py-1">
                                    <button
                                      onClick={() => handlePushVersion(version.id, "pitches")}
                                      className="flex items-center w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
                                      disabled={isPushing}
                                    >
                                      <FiUpload className="mr-2 w-4 h-4" />
                                      Push to Pitches
                                    </button>
                                    <button
                                      onClick={() => handlePushVersion(version.id, "streams")}
                                      className="flex items-center w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
                                      disabled={isPushing}
                                    >
                                      <FiUpload className="mr-2 w-4 h-4" />
                                      Push to Streams
                                    </button>
                                    <button
                                      onClick={() => handlePushVersion(version.id, "both")}
                                      className="flex items-center w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
                                      disabled={isPushing}
                                    >
                                      <FiUpload className="mr-2 w-4 h-4" />
                                      Push to Both
                                    </button>
                                  </div>
                                </motion.div>
                              )}
                            </AnimatePresence>
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              )}
            </div>

            {/* Footer actions */}
            <div className="border-t border-gray-200 p-4 bg-gray-50">
              <div className="flex justify-between space-x-3">
                <button
                  onClick={onClose}
                  className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors flex-1"
                >
                  Close
                </button>
                <button
                  onClick={() => setShowUploadModal(true)}
                  className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 rounded-lg hover:bg-indigo-700 transition-colors flex items-center justify-center flex-1"
                >
                  <FiPlus className="mr-2 w-4 h-4" />
                  Add Version
                </button>
              </div>
            </div>
          </div>
        )}
      </motion.div>

      {/* Upload modal */}
      <AnimatePresence>
        {showUploadModal && (
          <VersionUploadModal
            onClose={() => setShowUploadModal(false)}
            onClick={handleShowVersions}
          />
        )}
      </AnimatePresence>

      {/* Confirmation modal */}
      <AnimatePresence>
        {showConfirmation && (
          <ConfirmationModal
            onClose={() => setShowConfirmation(false)}
            onConfirm={handleRevert}
            version={versionToRevert}
          />
        )}
      </AnimatePresence>

      {/* Tooltip */}
      <Tooltip id="tooltip" place="top" effect="solid" />
    </div>
  );
};

VersionModal.propTypes = {
  onClose: PropTypes.func.isRequired,
};

const ConfirmationModal = ({ onClose, onConfirm }) => {
  return (
    <div className="fixed inset-0 flex items-center justify-center z-50 p-4">
      <div className="absolute inset-0 bg-black opacity-50" onClick={onClose} />
      
      <motion.div
        initial={{ scale: 0.95, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.95, opacity: 0 }}
        className="relative bg-white rounded-xl shadow-xl z-10 max-w-md w-full p-6"
      >
        <div className="flex items-start mb-4">
          <div className="flex-shrink-0 mt-0.5">
            <FiAlertCircle className="w-6 h-6 text-yellow-500" />
          </div>
          <div className="ml-3">
            <h3 className="text-lg font-medium text-gray-900">Confirm Revert</h3>
            <div className="mt-2 text-sm text-gray-500">
              <p>Are you sure you want to revert to this version? This action cannot be undone.</p>
            </div>
          </div>
        </div>
        
        <div className="mt-6 flex justify-end space-x-3">
          <button
            onClick={onClose}
            className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 rounded-lg hover:bg-indigo-700 flex items-center"
          >
            <FiRotateCcw className="mr-2 w-4 h-4" />
            Revert Version
          </button>
        </div>
      </motion.div>
    </div>
  );
};

ConfirmationModal.propTypes = {
  onClose: PropTypes.func.isRequired,
  onConfirm: PropTypes.func.isRequired,
  version: PropTypes.object.isRequired,
};

export { ConfirmationModal };
export default VersionModal;