import React, { useState } from "react";
import LoadingSpinner from "../../../utility/LoadingSpinner.jsx";

function Provisioning() {

  const [isLoading, setIsLoading] = useState(true);

  setTimeout(() => {
    setIsLoading(false);
  }, 2000); // Adjust the timeout value as needed


  return <>
    {isLoading ? (
      <div className="w-full flex justify-center items-center h-40 mt-32">
        <LoadingSpinner />
      </div>
    ) : (
      <div>
        Provisioning
      </div>
    )}
  </>
}

export default Provisioning;
