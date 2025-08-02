import React, { useState, useEffect, useContext } from "react";
import useAxiosInstance from "../../../Services/useAxiosInstance.jsx";
import { GlobalContext } from "../../../context/GlobalState.jsx";
import ResetPasswordDialog from "./ChangePasswordDialog.jsx";
import ProfileShimmer from "./ProfileShimmer.jsx";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import toast from "react-hot-toast";
import useCheckUserLicense from "../../../Services/checkUserLicense.jsx";
import { useCookies } from "react-cookie";
import {
  faPencilAlt,
  faXmark,
  faLock,
  faCheck,
  faTimes,
} from "@fortawesome/free-solid-svg-icons";
import RichTextEditor from "../../UserManager/Organisation/RichTextEditor.jsx";
import { motion, AnimatePresence } from "framer-motion";
import TeamsIntegration from "../../UserManager/Organisation/TeamsIntegration.jsx";
import HelloSignIntegration from "../../UserManager/Organisation/HelloSign/HelloSignIntegration.jsx";
import DocuSignIntegration from "../../UserManager/Organisation/DocuSign/DocuSignIntegration.jsx";
import slacklogo from "../../../assets/slacklogo.png";
import teamsLogo from "../../../assets/microsoftTeamsLogo.png";
import hellosignLogo from "../../../assets/hellosign.png";
import docusignLogo from "../../../assets/docusign.png";
import adobeLogo from "../../../assets/adobesign.png";
import pandadocLogo from "../../../assets/pandadoc.png";
import signnowLogo from "../../../assets/signnow.png";
import ImageCropperModal from "../../../utility/CustomComponents/ImageCropperModal.jsx";

export default function UserProfileSettings() {
  const [userData, setUserData] = useState({
    first_name: "",
    last_name: "",
    email: "",
    username: "",
    profile: "",
    organisation: "",
    timezone_name: "",
    currency_name: "",
    job_title: "",
    calendar_link: "",
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const axiosInstance = useAxiosInstance();
  const [profileImage, setProfileImage] = useState(null);
  const [fileInput, setFileInput] = useState(null);
  const [isEditable, setIsEditable] = useState(false);
  const [isDisable, setIsDisable] = useState(false);
  const [loader, setLoader] = useState(false);
  const [cookies] = useCookies(["userData"]);
  const [activeCommIntegrationTab, setActiveCommIntegrationTab] =
    useState("slack");
  const [activeEsignIntegrationTab, setActiveEsignIntegrationTab] =
    useState("hellosign");

  const [signature, setSignature] = useState("");
  const [initialSignature, setInitialSignature] = useState("");
  const [isSignatureEditable, setIsSignatureEditable] = useState(false);

  const checkUserLicense = useCheckUserLicense();
  const {
    viewer_id,
    resetPasswordDialogOpen,
    setResetPasswordDialogOpen,
    contentCollabration,
    setContentCollabration,
  } = useContext(GlobalContext);

  const [showCropper, setShowCropper] = useState(false);
  const [selectedImage, setSelectedImage] = useState(null);

  // Animation variants
  const fadeIn = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { duration: 0.3 } },
  };

  const slideUp = {
    hidden: { y: 20, opacity: 0 },
    visible: { y: 0, opacity: 1, transition: { duration: 0.3 } },
  };

  // Convert array buffer to base64 for profile image
  function arrayBufferToBase64(buffer) {
    let binary = "";
    const bytes = new Uint8Array(buffer);
    const len = bytes.byteLength;
    for (let i = 0; i < len; i++) {
      binary += String.fromCharCode(bytes[i]);
    }
    return window.btoa(binary);
  }

  // Fetch user data on component mount
  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const response = await axiosInstance.post(`/view-user/${viewer_id}`, {
          viewer_id,
        });
        const user = response.data.user;
        setUserData(user);

        setInitialSignature(user.signature);
        setSignature(user.signature);

        if (user.profile_photo?.type === "Buffer") {
          const base64Image = arrayBufferToBase64(user.profile_photo.data);
          setProfileImage(`data:image/png;base64,${base64Image}`);
        } else {
          setProfileImage(user.profile_photo);
        }
      } catch (error) {
        setError(error.message);
      } finally {
        setLoading(false);
      }
    };

    fetchUserData();
  }, [viewer_id]);

  // Handle profile picture change (open cropper)
  const handleProfilePictureChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    if (file.type === "image/svg+xml") {
      toast.error(
        "SVG files are not allowed. Please select a different format"
      );
      return;
    }
    if (file.size > 1 * 1024 * 1024) {
      toast.error("Image size exceeds 1 MB, please choose a smaller image.");
      return;
    }
    const reader = new FileReader();
    reader.onload = () => {
      setSelectedImage(reader.result);
      setShowCropper(true);
    };
    reader.readAsDataURL(file);
  };

  // Handle cropped image save
  const handleCroppedImageSave = async (croppedBlob) => {
    // Show preview
    const previewUrl = URL.createObjectURL(croppedBlob);
    setProfileImage(previewUrl);
    setShowCropper(false);
    // Upload
    const formData = new FormData();
    formData.append("profile_photo", croppedBlob, "profile.jpg");
    formData.append("viewer_id", viewer_id);
    try {
      await axiosInstance.post(`/update-profile-photo`, formData, {
        withCredentials: true,
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });
      toast.success("Profile picture updated successfully!");
    } catch (error) {
      console.error("Error updating profile picture:", error.message);
      toast.error("Failed to update profile picture");
    }
  };

  // Fetch updated profile data
  const handleFetchProfile = async () => {
    try {
      const userId = viewer_id;
      const response = await axiosInstance.post(
        `/view-user/${userId}`,
        {
          viewer_id: userId,
        },
        {
          withCredentials: true,
        }
      );
      setUserData(response.data.user);
      setSignature(response.data.user.signature);
      setInitialSignature(response.data.user.signature);
    } catch (error) {
      setError(error.message);
    }
  };

  const data = userData?.assigned_products || [];
  const idsArray = data.map((item) => item.product_id);

  // Handle form submission
  const handleSubmitData = async () => {
    setIsDisable(true);
    setLoader(true);
    try {
      const response = await axiosInstance.put(`/edit-user/${viewer_id}`, {
        ...userData,
        updated_by: viewer_id,
        products: idsArray,
        content_collaboration_mode: contentCollabration ? "1" : "0",
        signature: signature,
      });

      if (response.status >= 200 && response.status < 300) {
        toast.success("Profile updated successfully!");
        const userData = cookies.userData;
        document.cookie =
          "userData=" +
          JSON.stringify({
            user: {
              ...userData.user,
              content_collaboration_mode: contentCollabration ? "1" : "0",
            },
            organisation: userData.organisation,
          }) +
          "; path=/";
        handleFetchProfile("handleSubmitData", handleSubmitData);
        setIsEditable(false);
      } else {
        throw new Error("Failed to submit data");
      }
    } catch (error) {
      console.error("Error submitting data:", error);
      toast.error("Failed to update profile");
    } finally {
      setLoading(false);
      setIsDisable(false);
      setLoader(false);
    }
  };

  // Signature handlers
  const handleOpenModal = () => {
    setIsSignatureEditable(true);
  };

  const handleCloseModal = () => {
    setIsSignatureEditable(false);
    setSignature(initialSignature);
  };

  const handleSaveSignature = (content) => {
    setSignature(content);
    setIsSignatureEditable(false);
    toast.success("Signature updated!");
  };

  if (loading) {
    return <ProfileShimmer />;
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
          Error: {error}
        </div>
      </div>
    );
  }

  return (
    <div className="h-screen bg-gray-50 p-4 md:p-8 pb-1">
      <AnimatePresence>
        {resetPasswordDialogOpen && <ResetPasswordDialog />}
      </AnimatePresence>

      <motion.div
        initial="hidden"
        animate="visible"
        variants={fadeIn}
        className="max-w-6xl mx-auto h-full"
      >
        {/* Profile Header */}
        <motion.div
          variants={slideUp}
          className="bg-white rounded-xl shadow-sm p-6 mb-6"
        >
          <div className="flex flex-col md:flex-row items-center justify-between">
            <div className="flex items-center space-x-4 mb-4 md:mb-0">
              <div className="relative group">
                {profileImage ? (
                  <img
                    src={profileImage}
                    alt="Profile"
                    className="w-24 h-24 rounded-full object-cover border-2 border-white shadow-md"
                  />
                ) : (
                  <div className="w-24 h-24 flex items-center justify-center bg-gradient-to-r from-blue-500 to-purple-600 rounded-full text-white text-3xl font-bold shadow-md">
                    {`${userData.first_name[0]}${userData.last_name[0]}`}
                  </div>
                )}
                {isEditable && (
                  <button
                    onClick={() => fileInput && fileInput.click()}
                    className="absolute bottom-0 right-0 bg-white rounded-full p-2 border border-gray-200 shadow-md hover:bg-gray-50 transition-all duration-200 group-hover:opacity-100 opacity-0"
                  >
                    <FontAwesomeIcon
                      icon={faPencilAlt}
                      className="text-blue-600 w-4 h-4"
                    />
                  </button>
                )}
                <input
                  type="file"
                  accept="image/jpeg, image/png, image/jpg"
                  style={{ display: "none" }}
                  ref={(input) => setFileInput(input)}
                  onChange={handleProfilePictureChange}
                />
              </div>

              <div>
                <h1 className="text-2xl font-bold text-gray-800">
                  {userData.first_name} {userData.last_name}
                </h1>
                <p className="text-gray-600 font-medium">
                  {userData.job_title}
                </p>
                <p className="text-gray-500 text-sm">{userData.profile_name}</p>
              </div>
            </div>

            <div className="flex space-x-3">
              <button
                onClick={() => setResetPasswordDialogOpen(true)}
                className="flex items-center px-4 py-2 bg-white border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors duration-200 shadow-sm"
              >
                <FontAwesomeIcon
                  icon={faLock}
                  className="text-gray-600 w-4 h-4 mr-2"
                />
                Change Password
              </button>

              {isEditable ? (
                <div className="flex space-x-2">
                  <button
                    onClick={() => {
                      setIsEditable(false);
                      setSignature(initialSignature);
                    }}
                    className="flex items-center px-4 py-2 bg-white border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors duration-200 shadow-sm"
                  >
                    <FontAwesomeIcon
                      icon={faTimes}
                      className="text-gray-600 w-4 h-4 mr-2"
                    />
                    Cancel
                  </button>
                  <button
                    disabled={isDisable}
                    onClick={handleSubmitData}
                    className="flex items-center px-4 py-2 bg-blue-600 border border-blue-700 rounded-lg text-white hover:bg-blue-700 transition-colors duration-200 shadow-sm disabled:opacity-70"
                  >
                    {loader ? (
                      <svg
                        className="animate-spin h-5 w-5 text-white"
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 24 24"
                      >
                        <circle
                          className="opacity-25"
                          cx="12"
                          cy="12"
                          r="10"
                          stroke="currentColor"
                          strokeWidth="4"
                        ></circle>
                        <path
                          className="opacity-75"
                          fill="currentColor"
                          d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                        ></path>
                      </svg>
                    ) : (
                      <>
                        <FontAwesomeIcon
                          icon={faCheck}
                          className="text-white w-4 h-4 mr-2"
                        />
                        Save
                      </>
                    )}
                  </button>
                </div>
              ) : (
                <button
                  onClick={() => setIsEditable(true)}
                  className="flex items-center px-4 py-2 bg-blue-600 border border-blue-700 rounded-lg text-white hover:bg-blue-700 transition-colors duration-200 shadow-sm"
                >
                  <FontAwesomeIcon
                    icon={faPencilAlt}
                    className="text-white w-4 h-4 mr-2"
                  />
                  Edit
                </button>
              )}
            </div>
          </div>
        </motion.div>

        {/* Profile Form */}
        <motion.div
          variants={slideUp}
          className="rounded-xl shadow-sm p-6 max-h-[45vh] sm:max-h-[55vh] md:max-h-[60vh] lg:max-h-[60vh] bg-white overflow-y-auto"
        >
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    First Name
                  </label>
                  <input
                    type="text"
                    value={userData.first_name}
                    readOnly={!isEditable}
                    onChange={(e) =>
                      setUserData({ ...userData, first_name: e.target.value })
                    }
                    className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 text-sm ${
                      isEditable
                        ? "border-gray-300 focus:ring-blue-500 focus:border-blue-500"
                        : "border-gray-200 bg-gray-50"
                    }`}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Last Name
                  </label>
                  <input
                    type="text"
                    value={userData.last_name}
                    readOnly={!isEditable}
                    onChange={(e) =>
                      setUserData({ ...userData, last_name: e.target.value })
                    }
                    className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 ${
                      isEditable
                        ? "border-gray-300 focus:ring-blue-500 focus:border-blue-500"
                        : "border-gray-200 bg-gray-50"
                    }`}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Email
                  </label>
                  <input
                    type="email"
                    value={userData.email}
                    readOnly={!isEditable}
                    onChange={(e) =>
                      setUserData({ ...userData, email: e.target.value })
                    }
                    className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 ${
                      isEditable
                        ? "border-gray-300 focus:ring-blue-500 focus:border-blue-500"
                        : "border-gray-200 bg-gray-50"
                    }`}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Job Title
                  </label>
                  <input
                    type="text"
                    value={userData.job_title}
                    readOnly={!isEditable}
                    onChange={(e) =>
                      setUserData({ ...userData, job_title: e.target.value })
                    }
                    className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 ${
                      isEditable
                        ? "border-gray-300 focus:ring-blue-500 focus:border-blue-500"
                        : "border-gray-200 bg-gray-50"
                    }`}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Calendar Link
                  </label>
                  <input
                    type="text"
                    value={userData.calendar_link}
                    readOnly={!isEditable}
                    onChange={(e) =>
                      setUserData({
                        ...userData,
                        calendar_link: e.target.value,
                      })
                    }
                    className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 ${
                      isEditable
                        ? "border-gray-300 focus:ring-blue-500 focus:border-blue-500"
                        : "border-gray-200 bg-gray-50"
                    }`}
                  />
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Profile
                  </label>
                  <input
                    type="text"
                    value={userData.profile_name}
                    readOnly
                    className="w-full px-3 py-2 border border-gray-200 bg-gray-50 rounded-lg cursor-not-allowed"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Role
                  </label>
                  <input
                    type="text"
                    value={userData.role_name}
                    readOnly
                    className="w-full px-3 py-2 border border-gray-200 bg-gray-50 rounded-lg cursor-not-allowed"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Timezone
                  </label>
                  <input
                    type="text"
                    value={userData.timezone_name}
                    readOnly
                    className="w-full px-3 py-2 border border-gray-200 bg-gray-50 rounded-lg cursor-not-allowed"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Currency
                  </label>
                  <input
                    type="text"
                    value={userData.currency_name}
                    readOnly
                    className="w-full px-3 py-2 border border-gray-200 bg-gray-50 rounded-lg cursor-not-allowed"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Additional Sections */}
          <div className="mt-8 space-y-6">
            {/* Products Section */}
            {userData.assigned_products?.length > 0 && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h2 className="text-lg font-semibold text-gray-800 border-b pb-2 mb-4">
                    Assigned Products
                  </h2>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {userData.assigned_products.map((product) => (
                      <div
                        key={product.id}
                        className="bg-gray-50 px-4 py-3 rounded-lg border border-gray-200"
                      >
                        <p className="font-medium text-gray-800">
                          {product.name}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
                <div>
                  <h2 className="text-lg font-semibold text-gray-800 border-b pb-2 mb-4">
                    Collaboration Mode
                  </h2>
                  <div className="flex items-center justify-between bg-gray-50 p-4 rounded-lg border border-gray-200">
                    <div>
                      <h3 className="text-sm font-medium text-gray-800">
                        Content Collaboration Mode
                      </h3>
                      <p className="text-xs text-gray-500">
                        Enable real-time collaboration on documents
                      </p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        disabled={!isEditable}
                        type="checkbox"
                        className="sr-only peer"
                        checked={contentCollabration}
                        onChange={() =>
                          setContentCollabration(!contentCollabration)
                        }
                      />
                      <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                    </label>
                  </div>
                </div>
              </div>
            )}
            {/* Communication Integrations */}
            {(checkUserLicense("Revenue Enablement Elevate") == "1" ||
              checkUserLicense("Revenue Enablement Spark") == "1") && (
              <div className="mt-8">
                <h2 className="text-lg font-semibold text-gray-800 border-b pb-2 mb-4">
                  Communication Integrations
                </h2>

                <div className="flex border-b mb-4">
                  <button
                    className={`px-4 py-2 font-medium flex items-center space-x-2 ${
                      activeCommIntegrationTab === "slack"
                        ? "text-blue-600 border-b-2 border-blue-600"
                        : "text-gray-500 hover:text-gray-700"
                    }`}
                    onClick={() => setActiveCommIntegrationTab("slack")}
                  >
                    <img src={slacklogo} alt="Slack" className="w-5 h-5" />
                    <span>Slack</span>
                  </button>
                  <button
                    className={`px-4 py-2 font-medium flex items-center space-x-2 ${
                      activeCommIntegrationTab === "teams"
                        ? "text-blue-600 border-b-2 border-blue-600"
                        : "text-gray-500 hover:text-gray-700"
                    }`}
                    onClick={() => setActiveCommIntegrationTab("teams")}
                  >
                    <img src={teamsLogo} alt="Teams" className="w-5 h-5" />
                    <span>Teams</span>
                  </button>
                </div>
                <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
                  {activeCommIntegrationTab === "slack" ? (
                    <div className="text-center py-8">
                      <img
                        src={slacklogo}
                        alt="Slack"
                        className="w-12 h-12 mx-auto mb-4"
                      />
                      <h3 className="text-lg font-medium text-gray-800 mb-2">
                        Slack Integration
                      </h3>
                      <p className="text-gray-600">
                        Slack integration is managed at the organization level.
                        Please contact your administrator for setup.
                      </p>
                    </div>
                  ) : (
                    <TeamsIntegration />
                  )}
                </div>
              </div>
            )}

            {/* E Sign Integrations */}
            {checkUserLicense("Revenue Enablement Spark") == "1" && (
              <div className="mt-8">
                <h2 className="text-lg font-semibold text-gray-800 border-b pb-2 mb-4">
                  E-signature Integrations
                </h2>

                <div className="flex border-b mb-4">
                  {[
                    {
                      key: "hellosign",
                      label: "HelloSign",
                      logo: hellosignLogo,
                    },
                    { key: "adobe", label: "Adobe Sign", logo: adobeLogo },
                    { key: "pandadoc", label: "PandaDoc", logo: pandadocLogo },
                    { key: "docusign", label: "DocuSign", logo: docusignLogo },
                    { key: "signnow", label: "SignNow", logo: signnowLogo },
                  ].map(({ key, label, logo }) => (
                    <button
                      key={key}
                      className={`px-4 py-2 font-medium flex items-center space-x-2 ${
                        activeEsignIntegrationTab === key
                          ? "text-blue-600 border-b-2 border-blue-600"
                          : "text-gray-500 hover:text-gray-700"
                      }`}
                      onClick={() => setActiveEsignIntegrationTab(key)}
                    >
                      <img src={logo} alt={label} className="w-5 h-5" />
                      <span>{label}</span>
                    </button>
                  ))}
                </div>

                <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
                  {activeEsignIntegrationTab === "hellosign" && (
                    <HelloSignIntegration />
                  )}
                  {activeEsignIntegrationTab === "adobe" && (
                    <HelloSignIntegration />
                  )}
                  {activeEsignIntegrationTab === "pandadoc" && (
                    <HelloSignIntegration />
                  )}
                  {activeEsignIntegrationTab === "docusign" && (
                    <DocuSignIntegration />
                  )}
                  {activeEsignIntegrationTab === "signnow" && (
                    <HelloSignIntegration />
                  )}
                </div>
              </div>
            )}

            {/* Microsoft Clarity ID and GA Measurement Id (Conditional) */}
            {(checkUserLicense("Revenue Enablement Elevate") == "1" ||
              checkUserLicense("Revenue Enablement Spark") == "1") &&
              userData.custom_domain && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <h2 className="text-lg font-semibold text-gray-800 border-b pb-2 mb-4">
                      Analytics Integration
                    </h2>
                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Microsoft Clarity ID
                        </label>
                        <input
                          type="text"
                          value={userData.microsoft_clarity_project_id}
                          readOnly={!isEditable}
                          onChange={(e) =>
                            setUserData({
                              ...userData,
                              microsoft_clarity_project_id: e.target.value,
                            })
                          }
                          className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 ${
                            isEditable
                              ? "border-gray-300 focus:ring-blue-500 focus:border-blue-500"
                              : "border-gray-200 bg-gray-50"
                          }`}
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Google Analytics Measurement ID
                        </label>
                        <input
                          type="text"
                          value={userData.google_analytics_measurement_id}
                          readOnly={!isEditable}
                          onChange={(e) =>
                            setUserData({
                              ...userData,
                              google_analytics_measurement_id: e.target.value,
                            })
                          }
                          className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 ${
                            isEditable
                              ? "border-gray-300 focus:ring-blue-500 focus:border-blue-500"
                              : "border-gray-200 bg-gray-50"
                          }`}
                        />
                      </div>
                    </div>
                  </div>
                </div>
              )}
            {/* Signature Section */}
            <div className="mt-6">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-lg font-semibold text-gray-800">
                  Email Signature
                </h2>
                <button
                  onClick={() => {
                    if (isEditable) {
                      handleOpenModal();
                    } else {
                      toast.error("Please enable edit mode first");
                    }
                  }}
                  disabled={!isEditable}
                  className={`flex items-center px-3 py-1.5 text-sm rounded-lg ${
                    isEditable
                      ? "text-blue-600 border border-blue-600 hover:bg-blue-50"
                      : "text-gray-400 border border-gray-300 cursor-not-allowed"
                  }`}
                >
                  <FontAwesomeIcon
                    icon={faPencilAlt}
                    className="w-3 h-3 mr-2"
                  />
                  Edit Signature
                </button>
              </div>

              {signature ? (
                <div
                  className="bg-gray-50 p-4 rounded-lg border border-gray-200"
                  dangerouslySetInnerHTML={{ __html: signature }}
                />
              ) : (
                <div className="bg-gray-50 p-4 rounded-lg border border-gray-200 text-gray-500 italic">
                  No signature set
                </div>
              )}
            </div>
          </div>
        </motion.div>
      </motion.div>

      {/* Signature Editor Modal */}
      <AnimatePresence>
        {isSignatureEditable && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-4"
          >
            <motion.div
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: 20, opacity: 0 }}
              className="bg-white rounded-xl shadow-xl w-full max-w-4xl h-[90vh] flex flex-col overflow-hidden"
            >
              <div className="flex justify-between items-center p-4 border-b">
                <h3 className="text-lg font-semibold text-gray-800">
                  Edit Signature
                </h3>
                <button
                  onClick={handleCloseModal}
                  className="text-gray-500 hover:text-gray-700"
                >
                  <FontAwesomeIcon icon={faXmark} className="w-5 h-5" />
                </button>
              </div>

              <div className="flex-grow overflow-y-auto p-4 h-[calc(100%-120px)]">
                <RichTextEditor
                  value={signature}
                  onChange={setSignature}
                  className="h-[400px]"
                />
              </div>

              <div className="flex justify-end space-x-3 p-4 border-t">
                <button
                  onClick={handleCloseModal}
                  className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  onClick={() => handleSaveSignature(signature)}
                  className="px-4 py-2 bg-blue-600 border border-blue-700 rounded-lg text-white hover:bg-blue-700"
                >
                  Save Signature
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <ImageCropperModal
        open={showCropper}
        image={selectedImage}
        aspect={1}
        onClose={() => setShowCropper(false)}
        onSave={handleCroppedImageSave}
      />
    </div>
  );
}
