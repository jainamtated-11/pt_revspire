import React, { useEffect, useState } from "react";
import useAxiosInstance from "../../../../../Services/useAxiosInstance";
import { FaUserCircle } from "react-icons/fa";
import { useCookies } from "react-cookie";

const UserMessagePreview = ({ data, hexColor }) => {
  const [userDetails, setUserDetails] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const JsonData = JSON.parse(data); // Contains message and userID
  const userID = JsonData.userID;
  const axiosInstance = useAxiosInstance();
  const [cookies] = useCookies(["revspireToken"]);
  const token = cookies.revspireToken;

  useEffect(() => {
    if (!userID) {
      setIsLoading(false);
      setError("No user ID provided");
      return;
    }

    const fetchUserData = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const payload = { viewer_id: userID, manual_token: token };
        const response = await axiosInstance.post(
          `/view-user/${userID}`,
          payload
        );
        
        if (!response.data?.user) {
          throw new Error("User data not found in response");
        }

        const userData = response.data.user;

        let base64Image = null;
        if (userData.profile_photo?.data) {
          const byteArray = new Uint8Array(userData.profile_photo.data);
          const binaryString = byteArray.reduce(
            (acc, byte) => acc + String.fromCharCode(byte),
            ""
          );
          base64Image = `data:image/jpeg;base64,${btoa(binaryString)}`;
        }

        setUserDetails({
          name: `${userData.first_name || ''} ${userData.last_name || ''}`.trim(),
          email: userData.email || 'No email available',
          title: userData.job_title || 'No title available',
          profilePhoto: base64Image,
        });
      } catch (error) {
        console.error("Failed to fetch user data:", error);
        setError("Failed to load user details");
      } finally {
        setIsLoading(false);
      }
    };

    fetchUserData();
  }, [userID]);

  return (
    <div className="w-full h-full bg-white rounded-lg shadow-sm sm:shadow-xl overflow-hidden flex flex-col">
      <div className="flex-1 overflow-auto p-3 sm:p-4 md:p-6 bg-gray-50 rounded-md">
        <div className="flex flex-col lg:flex-row gap-4 sm:gap-6 md:gap-8 h-full">
          {/* User Profile Section */}
          <div className="w-full lg:w-1/3 flex items-center justify-center">
            <div
              className="bg-gray-50 w-full p-3 sm:p-4 md:p-6 rounded-lg sm:rounded-xl shadow-sm sm:shadow-md"
              style={{ borderTop: `4px solid ${hexColor}` }}
            >
              {isLoading ? (
                <div className="flex flex-col py-6 sm:py-8 md:py-10 px-2 items-center text-center gap-2">
                  <div className="animate-pulse">
                    <FaUserCircle className="w-16 h-16 sm:w-20 sm:h-20 md:w-24 md:h-24 rounded-full object-cover text-gray-300" />
                  </div>
                  <div
                    className="text-base sm:text-lg font-semibold animate-pulse bg-gray-200 h-6 w-32 rounded"
                    style={{ color: hexColor }}
                  />
                  <div className="text-xs sm:text-sm text-gray-500 animate-pulse bg-gray-200 h-4 w-24 rounded" />
                  <div className="text-xs sm:text-sm text-gray-400 animate-pulse bg-gray-200 h-4 w-40 rounded" />
                </div>
              ) : error ? (
                <div className="flex flex-col py-6 sm:py-8 md:py-10 px-2 items-center text-center gap-2">
                  <FaUserCircle className="w-16 h-16 sm:w-20 sm:h-20 md:w-24 md:h-24 rounded-full object-cover text-gray-300" />
                  <div
                    className="text-base sm:text-lg font-semibold"
                    style={{ color: hexColor }}
                  >
                    Error Loading User
                  </div>
                  <div className="text-xs sm:text-sm text-gray-500">{error}</div>
                  <div className="text-xs sm:text-sm text-gray-400">
                    ID: {userID}
                  </div>
                </div>
              ) : userDetails ? (
                <div className="flex flex-col py-6 sm:py-8 md:py-10 items-center text-center">
                  {userDetails.profilePhoto ? (
                    <img
                      src={userDetails.profilePhoto}
                      alt="Profile"
                      className="w-16 h-16 sm:w-20 sm:h-20 md:w-24 md:h-24 rounded-full object-cover border-2 border-white shadow"
                      style={{ borderColor: hexColor }}
                    />
                  ) : (
                    <FaUserCircle className="w-16 h-16 sm:w-20 sm:h-20 md:w-24 md:h-24 rounded-full object-cover text-gray-300" />
                  )}

                  <div className="w-full px-2">
                    <div
                      className="text-base sm:text-lg font-semibold truncate text-ellipsis overflow-hidden whitespace-nowrap"
                      style={{ color: hexColor }}
                      title={userDetails.name}
                    >
                      {userDetails.name || 'No name available'}
                    </div>
                    <div
                      className="text-xs sm:text-sm text-gray-500 truncate text-ellipsis overflow-hidden whitespace-nowrap"
                      title={userDetails.title}
                    >
                      {userDetails.title}
                    </div>
                    <a
                      href={`mailto:${userDetails.email}`}
                      className="block w-full text-xs sm:text-sm text-gray-400 truncate text-ellipsis overflow-hidden whitespace-nowrap hover:underline text-center px-2"
                      title={userDetails.email}
                    >
                      {userDetails.email}
                    </a>
                  </div>
                </div>
              ) : null}
            </div>
          </div>

          {/* Message Section */}
          <div className="w-full lg:w-2/3">
            <div className="p-3 sm:p-4 md:p-6 border-l-0 lg:border-l border-gray-200 h-full bg-white rounded-lg sm:rounded-xl shadow-sm sm:shadow overflow-auto max-h-[400px]">
              <div className="whitespace-pre-wrap text-sm sm:text-base text-gray-800">
                {JsonData.message || "No message content available"}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UserMessagePreview;