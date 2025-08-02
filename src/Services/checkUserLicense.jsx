import { useContext } from "react";
import { GlobalContext } from "../context/GlobalState";

const useCheckUserLicense = () => {
  const { userLicense } = useContext(GlobalContext);

  const checkUserLicense = (licenseString) => {
    try {
      // console.log("2", userLicense)

      // Check if userLicense or products are undefined/null
      if (!userLicense || !userLicense.products) {
        return 0;
      }

      // Split the input licenseString into an array of individual licenses
      const inputLicenses = licenseString.split(";");

      // Extract product names from the userLicense object
      const userProducts = userLicense.products.map(
        (product) => product.productName
      );

      // Check if any input license exists in the userProducts array
      const hasLicense = inputLicenses.some((license) =>
        userProducts.includes(license.trim())
      );

      // Return 1 if any license matches, else 0
      return hasLicense ? 1 : 0;
    } catch (error) {
      console.error("Error in checkUserLicense:", error);
      return 0; // Return 0 if any unexpected error occurs
    }
  };
  // console.log("2.1", checkUserLicense)

  return checkUserLicense;
};

export default useCheckUserLicense;
