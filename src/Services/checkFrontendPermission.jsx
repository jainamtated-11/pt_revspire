// checkFrontendPermission.js
import { useContext } from "react";
import { GlobalContext } from "../context/GlobalState";

const useCheckFrontendPermission = () => {
  const { userPermission } = useContext(GlobalContext);
  // console.log("User Permissions:", userPermission);

  const checkFrontendPermission = (permissionString) => {
    if (!userPermission) {
      return "0";
    }

    // Convert userPermission string to array if it's a string
    const userPermissionsArray = typeof userPermission === 'string' 
      ? userPermission.split(';').map(p => p.trim())
      : Array.isArray(userPermission) 
        ? userPermission.map(p => p.trim())
        : [];

    // console.log("User Permissions Array:", userPermissionsArray);

    // Split the input permissionString into an array of individual permissions
    const inputPermissions = permissionString.split(";").map(p => p.trim());
    // console.log("Checking for permissions:", inputPermissions);

    // Check if any input permission exists in the userPermission array
    const hasPermission = inputPermissions.some((permission) =>
      userPermissionsArray.includes(permission)
    );

    // console.log("Has permission:", hasPermission);
    // Return 1 if any permission matches, else 0
    return hasPermission ? "1" : "0";
  };

  return checkFrontendPermission;
};

export default useCheckFrontendPermission;
