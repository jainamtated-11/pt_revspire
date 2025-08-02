import React from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faDownload } from "@fortawesome/free-solid-svg-icons";

function DownloadLog({ onClick }) {
  return (
    <button
      type="button"
      className=" text-secondary text-[14px] my-0.5 pt-1 pb-1 pl-4 pr-4 mr-2 rounded-md ml-0.1 border-solid hover:bg-gray-200  dark:text-gray-200 dark:hover:bg-gray-700 dark:border-gray-500 "
      onClick={onClick}
    >
      <FontAwesomeIcon icon={faDownload} className="mr-2" />
      Download Log
    </button>
  );
}

export default DownloadLog;
