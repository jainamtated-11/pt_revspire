import React, { useContext, useState, useRef, useEffect } from "react";
import { GlobalContext } from "../../../../context/GlobalState";
import { useDispatch, useSelector } from "react-redux";
import useAxiosInstance from "../../../../Services/useAxiosInstance";
import { useCookies } from "react-cookie";
import { useCanva } from "../../../../hooks/useCanva";
import toast from "react-hot-toast";
import { X } from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";
import CanvaDesign from "./CanvaDesign";
import UploadDesignModal from "./UploadDesignModel";
import { fetchContentsAsync } from "../../../../features/content/contentSlice";

export default function CanvaDesignsGallery() {
  const {
    canvaDesigns,
    setCanvaDesigns,
    viewer_id,
    selectedCanvaItemId,
    baseURL,
  } = useContext(GlobalContext);
  const dispatch = useDispatch();
  const modalRef = useRef(null);
  const { handleUploadDesignAsContent, handleUploadDesignAsVersion } =
    useCanva();

  const [isCreatingDesign, setIsCreatingDesign] = useState(false);
  const [cookies] = useCookies(["canvaAccessToken","userData"]);
  const breadcrumbs = useSelector((state) => state.contents.breadcrumbs);
  const axiosInstance = useAxiosInstance();
  const [selectedDesign, setSelectedDesign] = useState(null);
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
  const [uploadType, setUploadType] = useState("content");

  const handleHideDesign = () => setCanvaDesigns(null);

  const handleSelectedDesign = (design) => {
    if (!selectedDesign) {
      setSelectedDesign(design);
      return;
    }

    design?.id === selectedDesign?.id
      ? setSelectedDesign(null)
      : setSelectedDesign(design);
  };

  const handleUploadFormSubmit = async ({ name, description, type, size, quality }) => {
    let response;
    if (selectedDesign) {
      console.log("in here");
      if (uploadType === "content") {
        console.log("===> in content")
        response = await handleUploadDesignAsContent(
          selectedDesign.id,
          name,
          description,
          type,
          size,
          quality
        );
      } else {
        console.log("===> in versions")
        response = await handleUploadDesignAsVersion(
          selectedDesign.id,
          name,
          description,
          selectedCanvaItemId,
          type,
          size,
          quality
        );
      }

      if (response.status < 300) {
        setIsUploadModalOpen(false);
        setSelectedDesign(null);
        setCanvaDesigns(null);
        toast.success("Successfully Uploaded");
      
       
      }
      console.log("=====>caalong dipatch fethcncontentasyns <=====")
      dispatch(
        fetchContentsAsync({
          viewer_id,
          folder_id: breadcrumbs[breadcrumbs.length - 1].id,
          baseURL: baseURL,
          organisation_id: cookies.userData?.organisation?.id,
        })
      );
    }
  };

  const handleOpenModal = (type) => {
    setUploadType(type);
    setIsUploadModalOpen(true);
  };

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (modalRef.current && !modalRef.current.contains(event.target)) {
        handleHideDesign();
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const checkCanvaToken = () => {
    const canvaAccessToken = cookies.canvaAccessToken;
    if (!canvaAccessToken) {
      toast.error(
        "Canva access token not found. Please authenticate with Canva."
      );
      return null;
    }
    return canvaAccessToken;
  };

  const correlationState = (state) => {
    return btoa(JSON.stringify(state));
  };

  const getCanvaUserId = () => {
    const canvaUserID = cookies.canvaUserID;
    if (!canvaUserID) {
      return null;
    }

    return canvaUserID;
  };

  const getCurrentURL = () => {
    const currentUrl = window.location.href;
    const url = new URL(currentUrl);
    return `${url.protocol}//${url.hostname}${url.port ? ":" + url.port : ""}`;
  };

  const handleCreateCanvaDesign = async () => {
    const token = checkCanvaToken();
    if (!token) return;
    const canva_user_id = getCanvaUserId();
    if (!canva_user_id) return;

    try {
      setIsCreatingDesign(true);
      const currentUrl = getCurrentURL();
      const state = { baseURL: `${currentUrl}/canva-redirection`, breadcrumbs };
      const encodedState = correlationState(state);

      const response = await axiosInstance.post("/createCanvaDesign", {
        content_id: selectedCanvaItemId,
        access_token: token,
        title: "New Design",
        design_type: { type: "preset", name: "doc" },
        viewer_id,
        canva_user_id,
      });

      if (response.status === 200) {
        const url = new URL(response.data.design.urls.edit_url);
        const params = new URLSearchParams(url.search);
        params.append("correlation_state", encodedState);
        url.search = params.toString();
        window.open(url, "_self");
      }
    } catch (error) {
      toast.error("An error occurred while creating the Canva design.");
    } finally {
      setIsCreatingDesign(false);
    }
  };

  if (!canvaDesigns) return null;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-4"
    >
      <motion.div
        initial={{ scale: 0.9, opacity: 0, y: 20 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        exit={{ scale: 0.9, opacity: 0, y: 20 }}
        transition={{ type: "spring", duration: 0.4 }}
        className="bg-white rounded-lg shadow-xl w-full max-w-4xl max-h-[90vh] overflow-hidden"
      >
        <div className="flex justify-between items-center p-6 border-b">
          <h2 className="text-2xl font-bold text-neutral-700">
            Canva Designs Gallery
          </h2>
          <button
            onClick={handleHideDesign}
            className="text-gray-500 hover:text-gray-700 focus:outline-none"
            aria-label="Close"
          >
            <X className="h-6 w-6" />
          </button>
        </div>
        <AnimatePresence>
          {selectedDesign && (
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="my-3 flex mx-6 gap-2"
            >
              <button
                onClick={() => handleOpenModal("version")}
                className="text-white px-4 py-1 rounded-lg flex items-center gap-2 shadow-sm hover:shadow-md transition-all btn-secondary"
              >
                Upload as version
              </button>
              <button
                onClick={() => setIsUploadModalOpen("content")}
                className="text-white px-4 py-1 rounded-lg flex items-center gap-2 shadow-sm hover:shadow-md transition-all btn-secondary"
              >
                Upload as content
              </button>
            </motion.div>
          )}
           {!selectedDesign && <div className="min-h-[54px]" ></div>}
        </AnimatePresence>
        <div
          className="p-6 pt-2 overflow-y-auto"
          style={{ maxHeight: "calc(90vh - 80px)" }}
        >
          {console.log("Canva designs Here",canvaDesigns)}
          {canvaDesigns?.designs?.length > 0 ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
              {canvaDesigns.designs.map((design) => (
                <div key={design.id} className="flex flex-col">
                  <CanvaDesign
                    setSelectedDesign={setSelectedDesign}
                    handleSelectedDesign={handleSelectedDesign}
                    selectedDesign={selectedDesign}
                    design={design}
                    id={canvaDesigns.id}
                    className="w-full h-full object-cover transition-transform hover:scale-105"
                  />
                  <div className="pl-2 pt-1">
                    <h3 className="font-bold text-xl text-black opacity-[0.75]">{design.title}</h3> 
                    <div className="flex flex-col text-gray-800 text-xs">
                      <p className="font-semibold text-gray-500"><span>Created at:</span> {new Date(design.createdAt * 1000).toLocaleString() || ''}</p>
                      <p className="font-semibold text-gray-500"> <span className="tracking-tight">Updated at:</span> {new Date(design.updatedAt * 1000).toLocaleString() || ''}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center h-64 text-center">
              <p className="text-xl font-semibold text-gray-600 mb-4">
                No Canva designs available.
              </p>
              <div className="flex flex-col sm:flex-row gap-4">
                <button
                  onClick={handleCreateCanvaDesign}
                  disabled={isCreatingDesign}
                  className={`px-6 py-2 rounded-md text-white font-medium ${
                    isCreatingDesign
                      ? "bg-cyan-400 cursor-not-allowed"
                      : "bg-cyan-600 hover:bg-cyan-700 active:bg-cyan-800"
                  } transition-colors focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:ring-opacity-50`}
                >
                  {isCreatingDesign ? "Creating..." : "Create New Design"}
                </button>
              </div>
            </div>
          )}
        </div>
      </motion.div>

      <AnimatePresence>
        <UploadDesignModal
          isOpen={isUploadModalOpen}
          onClose={() => setIsUploadModalOpen(false)}
          onSubmit={handleUploadFormSubmit}
          selectedDesign={selectedDesign}
          assetId={selectedCanvaItemId}
        />
      </AnimatePresence>
    </motion.div>
  );
}
