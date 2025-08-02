import { useState, useEffect } from "react";

/**
 * Custom hook to handle user information from cookies
 * @returns {Object} User information and states
 */
const useUserInfo = () => {
  const [userName, setUserName] = useState("");
  const [userEmail, setUserEmail] = useState("");
  const [isExternalUser, setIsExternalUser] = useState(false);
  useEffect(() => {
    const revspireClient = document.cookie
      .split("; ")
      .find((row) => row.startsWith("revspireClient="));
    const revspireClientValue = revspireClient?.split("=")[1];

    const userData = document.cookie
      .split("; ")
      .find((row) => row.startsWith("userData="));
    const publicPitchContact = document.cookie
      .split("; ")
      .find((row) => row.startsWith("publicPitchContact="));

    if (revspireClientValue === "1") {
      setIsExternalUser(true);
      if (publicPitchContact) {
        const contactData = JSON.parse(
          decodeURIComponent(publicPitchContact.split("=")[1])
        );

        const possibleName =
          contactData.full_name ||
          contactData.fullName ||
          (contactData.first_name && contactData.last_name
            ? `${contactData.first_name} ${contactData.last_name}`
            : null) ||
          contactData.name ||
          contactData.firstName ||
          contactData.first_name ||
          contactData.last_name ||
          "Guest";

        setUserName(possibleName);
        setUserEmail(contactData.email);
      }
    } else {
      // Internal user logic
      setIsExternalUser(false);
      if (userData) {
        const userDataValue = JSON.parse(
          decodeURIComponent(userData.split("=")[1])
        );
        setUserName(
          `${userDataValue.user.first_name} ${userDataValue.user.last_name}`
        );
        setUserEmail(userDataValue.user.email);
      } else if (publicPitchContact) {
        const contactData = JSON.parse(
          decodeURIComponent(publicPitchContact.split("=")[1])
        );
        setUserName(`${contactData.firstName} ${contactData.lastName}`);
        setUserEmail(contactData.email);
      }
    }
  }, []);

  const getUserInfo = () => {
    const publicPitchContact = document.cookie
      .split("; ")
      .find((row) => row.startsWith("publicPitchContact="));

    if (publicPitchContact) {
      const contactData = JSON.parse(
        decodeURIComponent(publicPitchContact.split("=")[1])
      );
      return {
        email: contactData.email,
        isCompanyMail: contactData.isCompanyMail === 1,
      };
    }
    return null;
  };

  const getCookieValue = (name) => {
    const value = `; ${document.cookie}`;
    const parts = value.split(`; ${name}=`);
    if (parts.length === 2) return parts.pop().split(";").shift();
    return null;
  };

  return {
    userName,
    setUserName,
    userEmail,
    setUserEmail,
    isExternalUser,
    setIsExternalUser,
    getUserInfo,
    getCookieValue,
  };
};

export default useUserInfo;
