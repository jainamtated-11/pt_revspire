import { useState, useEffect } from "react";
import { FiX, FiSave, FiEdit2 } from "react-icons/fi";
import useAxiosInstance from "../../../../../Services/useAxiosInstance";
import "./UserMessage.css";

const arrayBufferToBase64 = (buffer) => {
  let binary = "";
  const bytes = new Uint8Array(buffer);
  const len = bytes.byteLength;
  for (let i = 0; i < len; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return window.btoa(binary);
};

const getViewerIdFromCookie = () => {
  try {
    const cookies = document.cookie.split(";");
    const userDataCookie = cookies.find((cookie) =>
      cookie.trim().startsWith("userData=")
    );
    if (!userDataCookie) return null;

    const jsonString = decodeURIComponent(userDataCookie.split("=")[1]);
    const parsed = JSON.parse(jsonString);

    return parsed?.user?.id || null;
  } catch (error) {
    console.error("Failed to parse userData cookie:", error);
    return null;
  }
};

const UserMessage = ({
  onClose,
  hexColor,
  onClickHandler,
  contentWhileEditing,
  onActionEdit,
}) => {
  const [message, setMessage] = useState(`Hello everyone! 👋

I hope you’re all doing well. I’m really looking forward to working closely with you throughout this deal process. Please don’t hesitate to reach out if you have any questions, ideas, or concerns — open communication will help us achieve the best results together. I’m confident that by collaborating effectively, we can create a successful outcome that benefits everyone involved. Let’s make this partnership productive and rewarding! 🚀
    
Thanks so much for your time and effort.
    
Best regards,
[Your Name] ✨`);

  const [title, setTitle] = useState("Message from User");
  const [editingTitle, setEditingTitle] = useState(false);
  const [editingDescription, setEditingDescription] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [saveError, setSaveError] = useState(null);
  const [userDetails, setUserDetails] = useState(null);
  const axiosInstance = useAxiosInstance();
  // Dynamic color styles
  const hexToRgb = (hex) => {
    const cleanHex = hex.replace("#", "");
    const r = Number.parseInt(cleanHex.substr(0, 2), 16);
    const g = Number.parseInt(cleanHex.substr(2, 2), 16);
    const b = Number.parseInt(cleanHex.substr(4, 2), 16);
    return { r, g, b };
  };

  const createColorVariations = (hexColor) => {
    const baseColor = hexToRgb(hexColor || "28747d");
    const { r, g, b } = baseColor;

    return {
      base: `rgb(${r}, ${g}, ${b})`,
      light: `rgb(${Math.min(255, r + 40)}, ${Math.min(
        255,
        g + 40
      )}, ${Math.min(255, b + 40)})`,
      dark: `rgb(${Math.max(0, r - 30)}, ${Math.max(0, g - 30)}, ${Math.max(
        0,
        b - 30
      )})`,
      gradient: `linear-gradient(90deg, rgb(${r}, ${g}, ${b}), rgb(${Math.min(
        255,
        r + 20
      )}, ${Math.min(255, g + 20)}, ${Math.min(255, b + 20)}))`,
      shadow: `rgba(${r}, ${g}, ${b}, 0.3)`,
      lightShadow: `rgba(${r}, ${g}, ${b}, 0.1)`,
    };
  };

  const colors = createColorVariations(hexColor);

  const colorStyles = {
    "--primary-base": colors.base,
    "--primary-light": colors.light,
    "--primary-dark": colors.dark,
    "--primary-50": colors.lightShadow,
  };

  // Auto-resize textarea based on content
  const handleTextareaChange = (e) => {
    setMessage(e.target.value);
    // Auto-resize
    e.target.style.height = "auto";
    e.target.style.height = `${e.target.scrollHeight}px`;
  };

  // Load initial message and title/description
  useEffect(() => {
    if (contentWhileEditing) {
      try {
        // First try to parse from content_link if it exists
        if (contentWhileEditing.content_link) {
          const parsedContent = JSON.parse(contentWhileEditing.content_link);
          if (parsedContent.Type === "UserMessage") {
            setMessage(parsedContent.message || "");
            setTitle(contentWhileEditing.tagline || "Message from User");
            return;
          }
        }

        // Fallback to content if content_link doesn't exist
        if (contentWhileEditing.content) {
          const parsedContent =
            typeof contentWhileEditing.content === "string"
              ? JSON.parse(contentWhileEditing.content)
              : contentWhileEditing.content;

          if (parsedContent.message) {
            setMessage(parsedContent.message);
          }
          if (contentWhileEditing.tagline) {
            setTitle(contentWhileEditing.tagline);
          }
        }
      } catch (error) {
        console.error("Error parsing contentWhileEditing:", error);
        setMessage(""); // Reset message if parsing fails
      }
    } else {
      setMessage(""); // Reset message if no contentWhileEditing
    }
  }, [contentWhileEditing]);

  const viewer_id = getViewerIdFromCookie();

  // Fetch user data from API
  useEffect(() => {
    if (!viewer_id) return;

    const fetchUserData = async () => {
      try {
        const payload = {
          viewer_id: viewer_id,
        };

        const response = await axiosInstance.post(
          `/view-user/${viewer_id}`,
          payload
        );

        const userData = response.data.user;

        console.log("userData", userData);

        if (userData) {
          setUserDetails({
            name: `${userData.first_name} ${userData.last_name}`,
            email: userData.email,
            title: userData.job_title,
            profilePhoto: userData.profile_photo,
          });
        }
      } catch (error) {
        console.error("Failed to fetch user data:", error);
      }
    };
    fetchUserData();
  }, [viewer_id]);

  const handleSave = async () => {
    setIsSaving(true);
    setSaveError(null);

    try {
      const payload = {
        name: title,
        description: "User Message",
        parameters: {
          Type: "UserMessage",
          message,
          userID: viewer_id,
        },
      };

      if (contentWhileEditing?.content_id) {
        await axiosInstance.post("/pitch-content-feature/edit-feature", {
          ...payload,
          content_id: contentWhileEditing.content_id,
        });
        onActionEdit?.({
          editedContentId: contentWhileEditing.content_id,
          editedData: { message, title, userID: viewer_id },
        });
      } else {
        const response = await axiosInstance.post(
          "/pitch-content-feature/create-feature",
          payload
        );
        onClickHandler?.([
          {
            ...response.data.content,
            tagline: response.data.content.name,
          },
        ]);
      }
      onClose();
    } catch (error) {
      console.error("Save error:", error);
      setSaveError(error.response?.data?.message || error.message);
    } finally {
      setIsSaving(false);
    }
  };

  const renderProfilePhoto = () => {
    if (!userDetails?.profilePhoto) return null;

    try {
      let imageUrl;
      if (userDetails.profilePhoto?.type === "Buffer") {
        // Handle Buffer type from database
        const base64Image = arrayBufferToBase64(userDetails.profilePhoto.data);
        imageUrl = `data:image/png;base64,${base64Image}`;
      } else if (typeof userDetails.profilePhoto === "string") {
        // Handle string (could be base64 or URL)
        imageUrl = userDetails.profilePhoto.startsWith("data:")
          ? userDetails.profilePhoto
          : `data:image/png;base64,${userDetails.profilePhoto}`;
      } else {
        // Handle other cases (like direct ArrayBuffer)
        const base64Image = arrayBufferToBase64(
          userDetails.profilePhoto.buffer || userDetails.profilePhoto
        );
        imageUrl = `data:image/png;base64,${base64Image}`;
      }

      return (
        <img
          src={imageUrl}
          alt={userDetails.name}
          className="w-24 h-24 rounded-full object-cover border-4 border-white shadow-md"
          onError={(e) => {
            e.target.style.display = "none";
            e.target.nextSibling.style.display = "flex";
          }}
        />
      );
    } catch (error) {
      console.error("Error processing profile photo:", error);
      return null;
    }
  };

  const getInitials = (name) => {
    return (
      name
        ?.split(" ")
        .map((word) => word.charAt(0))
        .join("")
        .toUpperCase()
        .slice(0, 2) || "U"
    );
  };

  return (
    <div
      className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50 p-4"
      style={colorStyles}
    >
      <div className="w-full max-w-4xl min-h-[70vh] mx-auto bg-white rounded-2xl shadow-2xl overflow-hidden flex flex-col">
        {/* Header with title */}
        <div className="flex justify-between items-center p-4 border-b border-gray-100">
          <div className="flex items-center gap-2">
            {editingTitle ? (
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                onBlur={() => setEditingTitle(false)}
                onKeyDown={(e) => e.key === "Enter" && setEditingTitle(false)}
                className="text-lg font-bold bg-transparent border-none outline-none focus:bg-gray-50 rounded-lg px-2 transition-all duration-200"
                autoFocus
              />
            ) : (
              <h1
                className="text-xl font-bold text-gray-800 cursor-pointer hover:text-[var(--primary-base)] transition-colors duration-200 px-2 rounded-lg hover:bg-gray-50"
                onClick={() => setEditingTitle(true)}
              >
                {title}
              </h1>
            )}
            <FiEdit2
              className="w-4 h-4 text-gray-400 cursor-pointer hover:text-[var(--primary-light)] transition-colors duration-200"
              onClick={() => setEditingTitle(true)}
            />
          </div>

          <button
            onClick={onClose}
            className="ml-4 p-1 hover:bg-gray-100 rounded-full transition-colors duration-200"
          >
            <FiX size={20} className="text-gray-500" />
          </button>
        </div>

        {/* Main Content */}
        <div className="flex-1 p-6 overflow-auto">
          <div className="flex flex-col md:flex-row gap-8 h-full">
            {/* User Profile Section */}
            <div className="w-full md:w-1/3">
              <div className="bg-gray-50 p-6 rounded-xl shadow-sm h-full">
                {userDetails && (
                  <div className="flex flex-col items-center text-center h-full">
                    <div className="relative mb-4">
                      {renderProfilePhoto()}
                      <div
                        className="w-24 h-24 rounded-full flex items-center justify-center text-white text-2xl font-bold shadow-md"
                        style={{
                          display: userDetails?.profilePhoto ? "none" : "flex",
                          backgroundColor: hexColor || "#6366f1",
                        }}
                      >
                        {getInitials(userDetails.name)}
                      </div>
                    </div>

                    <div className="space-y-2">
                      <h3 className="text-lg font-semibold text-gray-800">
                        {userDetails.name}
                      </h3>
                      <p className="text-sm text-gray-600">
                        {userDetails.title}
                      </p>
                      <p className="text-sm text-gray-500">
                        {userDetails.email}
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Message Section */}
            <div className="w-full md:w-2/3">
              <div className="space-y-4 h-full">
                <div className="h-full">
                  <textarea
                    value={message}
                    onChange={handleTextareaChange}
                    placeholder="Write your personalized message here. This will be displayed to your customer as a message from you..."
                    className="w-full px-4 py-3 focus:outline-none focus:ring-2 focus:ring-[var(--primary-light)] focus:border-transparent transition-all duration-200 resize-none min-h-[40vh]"
                    style={{ minHeight: "40vh" }}
                  />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Footer with Save/Cancel */}
        <div className="flex justify-between items-center p-4 border-t border-gray-100">
          <div></div>
          <div className="flex gap-3">
            <button
              onClick={onClose}
              disabled={isSaving}
              className="px-5 py-2.5 bg-gray-200 hover:bg-gray-300 text-sm text-gray-800 font-medium rounded-lg transition-colors duration-200"
            >
              Cancel
            </button>
            <button
              onClick={handleSave}
              disabled={isSaving || !message.trim()}
              className="px-5 py-2.5 bg-[var(--primary-base)] text-sm hover:bg-[var(--primary-dark)] text-white font-medium rounded-lg transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSaving ? "Saving..." : "Save"}
            </button>
          </div>
        </div>

        {saveError && (
          <div className="px-6 pb-4">
            <div className="bg-red-50 text-red-600 p-3 rounded-lg text-sm">
              {saveError}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default UserMessage;
