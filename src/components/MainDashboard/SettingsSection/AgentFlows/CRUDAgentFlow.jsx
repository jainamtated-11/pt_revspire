import React from "react";
import GlobalAddButton from "../../../../utility/CustomComponents/GlobalAddButton.jsx";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faEdit } from "@fortawesome/free-solid-svg-icons";
import useAxiosInstance from "../../../../Services/useAxiosInstance.jsx";

function CrudAgentFlow({
  selectedItems,
  setSelectedItems,
  setAddAgentFlow,
  fetchAgentFlows,
}) {
  return (
    <div className="container w-full flex gap-4 items-center justify-between mx-auto ">
      <div className="container relative flex justify-between">
        {selectedItems.length === 0 ? (
          <div className="">
            <GlobalAddButton
              onClick={() => {
                setAddAgentFlow(true);
              }}
            />
          </div>
        ) : (
          <div
            className={`flex flex-row ${
              selectedItems.length > 0
                ? " dark:bg-gray-600 rounded-md w-full"
                : ""
            }`}
          >
            <div className="overflow-x-auto pl-2 h-full rounded-md bg-white shadow-md scroll-none items-center flex flex-row">
              {selectedItems.length >= 1 && (
                <>
                  <div className="transition-all mb-0"></div>
                  <div className="transition-all mb-0">
                    <button
                      className="text-secondary flex flex-nowrap justify-center items-center text-[14px] pt-1 pb-1 pl-4 pr-4 mt-1 mb-1 ml-1 rounded-md border-solid hover:bg-gray-200 dark:text-gray-200 dark:hover:bg-gray-700 dark:border-gray-500"
                      onClick={() => {
                        // Edit functionality will be handled in the modal
                        setAddAgentFlow(true);
                      }}
                    >
                      <FontAwesomeIcon icon={faEdit} className="mr-2" />
                      Edit
                    </button>
                  </div>
                </>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default CrudAgentFlow;
