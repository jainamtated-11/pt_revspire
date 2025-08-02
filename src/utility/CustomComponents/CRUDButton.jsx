import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";

import React from "react";

const CRUDButton = ({ onClickHandle, label, icon, btn, isDiasble }) => {
  return (
    <>
      <button
        disabled={isDiasble}
        className="flex flex-row items-center text-secondary text-[14px] my-0.5 pt-1 pb-1 pl-4 pr-4 mr-2 rounded-md ml-0.1 border-solid hover:bg-gray-200  dark:text-gray-200 dark:hover:bg-gray-700 dark:border-gray-500 "
        onClick={onClickHandle}
      >
        {icon && <FontAwesomeIcon icon={icon} className={btn} />}
        {label}
      </button>
    </>
  );
};

export default CRUDButton;
