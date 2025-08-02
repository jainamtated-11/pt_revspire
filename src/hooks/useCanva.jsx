import { useState, useContext, useRef } from "react";
import { useCookies } from "react-cookie";
import toast from "react-hot-toast";
import { GlobalContext } from "../context/GlobalState.jsx";
import useAxiosInstance from "../Services/useAxiosInstance.jsx";
import { useSelector } from "react-redux";
import CanvaDesignsGallery from "../components/MainDashboard/ContentManager/Canva/CanvaDesignGallery.jsx";

export const useCanva = (item, setActiveContent) => {
  const [isOpen, setIsOpen] = useState(false);
  const [uploadStatus, setUploadStatus] = useState("not-uploaded");
  const [canvaId, setCanvaId] = useState(item?.canva_id ?? item?.id);
  const [isCreatingDesign, setIsCreatingDesign] = useState(false);
  const [isViewDesign, setIsViewDesign] = useState(false);
  const [isUploadAndCreateDesign, setIsUploadAndCreateDesign] = useState(false);
  const [cookies] = useCookies(["canvaAccessToken"]);
  const { viewer_id, setCanvaDesigns, setSelectedCanvaItemId } =
    useContext(GlobalContext);
  const axiosInstance = useAxiosInstance();
  const dialogRef = useRef(null);
  const buttonRef = useRef(null);
  const breadcrumbs = useSelector((state) => state.contents.breadcrumbs);
  const [checkAsset, setCheckAsset] = useState(false);
  const [assetDetails, setAssetDetails] = useState(null);
  const folder_id = breadcrumbs[breadcrumbs.length - 1].id;

  const getCurrentURL = () => {
    const currentUrl = window.location.href; // Get the full URL
    console.log({ currentUrl }); // Log the full URL
    return currentUrl; // Return the full URL
  };



  const correlationState = (state) => {
    const correlationState = btoa(JSON.stringify(state));
    return correlationState;
  };

  const showCanvaButton = (mimeType) => mimeType?.includes("image/");

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

  const getCanvaUserId = () => {
    const canvaUserID = cookies.canvaUserID;
    if (!canvaUserID) {
      return null;
    }

    return canvaUserID;
  };

  const handleCanvaSync = async () => {
    setUploadStatus("uploading");
    const token = checkCanvaToken();
    if (!token) return;

    const canva_user_id = getCanvaUserId();
    if (!canva_user_id) return;
    try {
      const response = await axiosInstance.post("/uploadToCanva", {
        contentId: item.id,
        accessToken: token,
        viewer_id,
        canva_user_id,
      });

      if (response.status === 200) {
        setUploadStatus("uploaded");
        setCanvaId(response.data.canvaId);
        toast.success(
          response.data.message ?? "Content uploaded to Canva successfully"
        );
        setAssetDetails({});
      } else {
        setUploadStatus("failed");
        toast.error("Failed to upload content to Canva.");
      }
    } catch (error) {
      setUploadStatus("failed");
      toast.error("An error occurred while uploading to Canva.");
    }
  };

  const handleCreateCanvaDesign = async () => {
    const token = checkCanvaToken();
    if (!token) return;
    const canva_user_id = getCanvaUserId();
    if (!canva_user_id) return;
    try {
      setIsCreatingDesign(true);
      const currentUrl = getCurrentURL();
      const state = {
        baseURL: `${currentUrl}/canva-redirection`,
        breadcrumbs: breadcrumbs ?? null,
      };
      const encodedState = correlationState(state);
      const response = await axiosInstance.post("/createCanvaDesign", {
        content_id: item.id,
        access_token: token,
        title: item.name,
        design_type: { type: "preset", name: "doc" },
        viewer_id,
        canva_user_id,
      });

      if (response.status === 200) {
        const state = correlationState();
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

  const handleViewCanvaDesign = async (id) => {
    setIsViewDesign(true);
    try {
      const token = checkCanvaToken();
      if (!token) return;
      const canva_user_id = getCanvaUserId();
      if (!canva_user_id) return;
      const response = await axiosInstance.post("/createCanvaDesign", {
        content_id: item.id,
        access_token: token,
        title: item.name ?? item.title,
        design_type: { type: "preset", name: "doc" },
        viewer_id,
        canva_user_id,
      });

      if (response.status === 200) {
        window.open(response.data.design.urls.view_url, "_self");
      }
    } catch (error) {
      toast.error("An error occurred");
    } finally {
      setIsViewDesign(false);
    }
  };

  const handleUploadAndCreateCanvaDesign = async () => {
    const token = checkCanvaToken();
    if (!token) return;
    const canva_user_id = getCanvaUserId();
    if (!canva_user_id) return;
    const currentUrl = window.location.href;
    const state = {
      baseURL: `${currentUrl}/canva-redirection`,
      breadcrumbs: breadcrumbs ?? null,
    };
    const encodedState = correlationState(state);

    const uploadCanva = async () => {
      try {
        const response = await axiosInstance.post("/uploadToCanva", {
          contentId: item.id,
          accessToken: token,
          viewer_id,
          canva_user_id,
        });

        if (response.status === 200) {
          return response.data.assetId;
        } else {
          toast.error("Failed to upload content to Canva.");
          return null;
        }
      } catch (error) {
        toast.error("An error occurred while uploading to Canva.");
        return null;
      }
    };

    const createCanvaDesign = async (assetId) => {
      try {
        const response = await axiosInstance.post("/createCanvaDesign", {
          content_id: item.id,
          access_token: token,
          title: item.name,
          design_type: { type: "preset", name: "doc" },
          viewer_id,
          canva_user_id,
        });
        if (response.status === 200) {
          return response.data.design.urls.edit_url;
        } else {
          toast.error("Failed to create design.");
          return null;
        }
      } catch (error) {
        toast.error("An error occurred while creating the Canva design.");
        return null;
      }
    };

    try {
      setIsUploadAndCreateDesign(true);
      const assetId = await uploadCanva();

      if (assetId) {
        const designUrl = await createCanvaDesign(assetId);

        if (designUrl) {
          const url = new URL(designUrl);
          const params = new URLSearchParams(url.search);
          params.append("correlation_state", encodedState);
          url.search = params.toString();
          window.open(url, "_self");
        }
      }
    } catch (error) {
      toast.error(
        "An error occurred while performing upload and design creation."
      );
    } finally {
      setIsUploadAndCreateDesign(false);
    }
  };

  const handleViewAllDesigns = async (id) => {
    const canva_user_id = getCanvaUserId();
    const token = checkCanvaToken();
    if (!token) {
      <CanvaDesignsGallery item={item?.id ?? id} />;
      return item?.id ?? id;
    }
    setIsViewDesign(true);
    try {
      const response = await axiosInstance.post(
        "/fetch-canva-content-designs",
        {
          content_id: item.id ?? id,
          access_token: token,
          viewer_id,
          canva_user_id,
        }
      );

      if (response.status === 200) {
        setCanvaDesigns({ id: item.id ?? id, designs: response.data.designs });
        setSelectedCanvaItemId(item.id);
        setIsOpen(true); // Open the modal after designs are fetched successfully
      } else {
        setCanvaDesigns(null);
        toast.error("Failed to upload content to Canva.");
      }
    } catch (error) {
      setCanvaDesigns(null);
      toast.error("An error occurred while uploading to Canva.");
    } finally {
      setIsViewDesign(false);
    }
  };

  const checkCanvaAsset = async (content) => {
    try {
      setCheckAsset(true);
      const canva_user_id = getCanvaUserId();
      if (!canva_user_id) {
        return;
      }

      const response = await axiosInstance.post("/check-canva-asset", {
        canva_user_id,
        content,
        viewer_id,
      });

      // Check if there is an error message in the response data
      if (response.data.error) {
        setAssetDetails(null); // Set assetDetails to null if there is an error
      } else {
        setAssetDetails(response.data); // Set assetDetails only if no error is present
      }
      return response.data;
    } catch (error) {
      setAssetDetails(null);
      return null;
    } finally {
      setCheckAsset(false);
    }
  };

  const handleUploadDesignAsContent = async (
    canva_design_id,
    new_name,
    description,
    type,
    size,
    quality
  ) => {
    try {
      const access_token = checkCanvaToken();
      if (!access_token) return;

      const payload = {
        access_token,
        canva_design_id,
        description,
        new_name,
        folder: folder_id,
        viewer_id,
        type,
      };

      if (type === "pdf") {
        payload.size = size;
      }

      if (type === "jpg" || type === "mp4") {
        payload.quality = quality;
      }

      const response = await axiosInstance.post(
        "/upload-canva-design-into-content",
        payload
      );

      return response;
    } catch (error) {
      toast.error(error?.response?.data?.message || "Failed to upload design");
      return null;
    } finally {
    }
  };

  const handleUploadDesignAsVersion = async (
    canva_design_id,
    new_name,
    description,
    old_content,
    type,
    size,
    quality
  ) => {
    try {
      const access_token = checkCanvaToken();
      if (!access_token) return;

      const payload = {
        access_token,
        canva_design_id,
        description,
        old_content,
        new_name,
        folder: folder_id,
        viewer_id,
        type,
      };

      if (type === "pdf") {
        payload.size = size;
      }

      if (type === "jpg" || type === "mp4") {
        payload.quality = quality;
      }

      const response = await axiosInstance.post(
        "/upload-canva-design-into-content",
        payload
      );

      return response;
    } catch (error) {
      toast.error(error?.response?.data?.message || "Failed to upload design");
      return null;
    } finally {
    }
  };

  // const handleUploadDesignAsVersion = async (
  //   canva_design_id,
  //   new_name,
  //   old_content
  // ) => {
  //   try {
  //     const access_token = checkCanvaToken();
  //     if (!access_token) return;
  //     const response = await axiosInstance.post(
  //       "/upload-canva-design-into-content",
  //       {
  //         access_token,
  //         canva_design_id,
  //         folder: folder_id,
  //         viewer_id,
  //         new_name,
  //         old_content,
  //       }
  //     );
  //   } catch (error) {
  //   } finally {
  //   }
  // };

  return {
    isOpen,
    setIsOpen,
    handleUploadDesignAsContent,
    uploadStatus,
    handleCanvaSync,
    handleCreateCanvaDesign,
    dialogRef,
    buttonRef,
    showCanvaButton,
    isCreatingDesign,
    handleViewCanvaDesign,
    isViewDesign,
    handleUploadAndCreateCanvaDesign,
    isUploadAndCreateDesign,
    handleViewAllDesigns,
    correlationState,
    getCurrentURL,
    checkCanvaAsset,
    checkAsset,
    assetDetails,
    handleUploadDesignAsVersion,
  };
};
