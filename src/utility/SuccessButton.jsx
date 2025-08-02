import React from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";

const FailureButton = ({onClickHandle, label , icon}) => {
  return (
    <>
      <button
        className="text-black border transition-all duration-300 hover:bg-gray-200  border-black bg-white-300  focus:ring-2 focus:ring-black-800 font-medium rounded-full text-sm w-full sm:w-auto px-24 border-black-900 py-2 text-center dark:bg-black-600 dark:hover:bg-black-700"
        onClick={onClickHandle}
      >
        {icon && <FontAwesomeIcon icon={icon}   className="mr-2" />}
        {label}
      </button>
    </>
  )
}

export default FailureButton