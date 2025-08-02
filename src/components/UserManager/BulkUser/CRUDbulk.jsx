import React, { useContext } from "react";
import { GlobalContext } from "../../../context/GlobalState.jsx";
import DownloadLog from "./DownloadLog.jsx";
import useCheckFrontendPermission from "../../../Services/checkFrontendPermission.jsx";
import GlobalAddButton from "../../../utility/CustomComponents/GlobalAddButton.jsx";
import SearchBar from "../../../utility/SearchBar.jsx";

function CRUDbulk() {
  const {
    setAddBulkUserClicked,
    addBulkUserClicked,
    selectedUploadId,
    setSelectedUploadId,
    setIsDownloadLogClicked,
  } = useContext(GlobalContext);

  const checkFrontendPermission = useCheckFrontendPermission();

  return (
    <div className="container flex justify-between mx-auto pt-0 pb-4">
      <div className="flex transition-all">
        {selectedUploadId.length === 0 &&
          checkFrontendPermission("Create Bulk User Upload") == "1" && (
            <div className="transition-all ml-0">
              <GlobalAddButton onClick={() => setAddBulkUserClicked(true)} />
            </div>
          )}
        <div
          className={`flex flex-row  ${
            selectedUploadId.length === 1 &&
            checkFrontendPermission("Download Bulk User Upload Log") == "1"
              ? "bg-white dark:bg-gray-600 rounded-md p-0.5 shadow-md w-[40vw]"
              : ""
          }`}
        >
          <div>
            {selectedUploadId.length > 0 &&
              checkFrontendPermission("Download Bulk User Upload Log") ==
                "1" && (
                <DownloadLog onClick={() => setIsDownloadLogClicked(true)} />
              )}
          </div>
        </div>
      </div>
      <div className="flex">
        <SearchBar applySearch={"bulk_user"} />
      </div>
    </div>
  );
}

export default CRUDbulk;
