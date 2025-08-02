import React, { useEffect, useState } from "react";
import GlobalAddButton from "../../../../utility/CustomComponents/GlobalAddButton.jsx";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faPersonArrowUpFromLine,
  faPersonArrowDownToLine,
  faCircleUp,
} from "@fortawesome/free-solid-svg-icons";
import useAxiosInstance from "../../../../Services/useAxiosInstance.jsx";
import toast from "react-hot-toast";

function CrudMail({ selectedItems, setSelectedItems, setAddMail, fetchEmailAccounts }) {
  const [areAllActive, setAreAllActive] = useState(false);
  const [areAllInactive, setAreAllInactive] = useState(false);
  const axiosInstance = useAxiosInstance();
  useEffect(() => {
    const checkConnectionStatus = () => {
      if (selectedItems.length === 0) {
        setAreAllActive(false);
        setAreAllInactive(false);
        return;
      }
      let allActive = true;
      let allInactive = true;
      selectedItems.forEach((item) => {
        if (item.is_active !== 1) allActive = false;
        else allInactive = false;
      });
      setAreAllActive(allActive);
      setAreAllInactive(allInactive);
    };
    checkConnectionStatus();
  }, [selectedItems]);

  const activateEmails = async () => {
    try {
      const requests = selectedItems.map((item) =>
        axiosInstance.post("/email/activate-email", {
          viewer_id: item.user,
          email_id: item.id,
        })
      );
      await Promise.all(requests);
      toast.success("Mails activated successfully!");
  
      // Update selectedItems to reflect the new state
      const updatedItems = selectedItems.map(item => ({ ...item, is_active: 1 }));
      setSelectedItems(updatedItems); // Update the selected items
      await fetchEmailAccounts(); // Refetch email accounts
    } catch (error) {
      toast.error("Error activating mails:", error);
    }
  };

  const deactivateEmails = async () => {
    try {
      const requests = selectedItems.map((item) =>
        axiosInstance.post("/email/deactivate-email", {
          viewer_id: item.user,
          email_id: item.id,
        })
      );
      await Promise.all(requests);
      toast.success("Mails deactivated successfully!");
  
      // Update selectedItems to reflect the new state
      const updatedItems = selectedItems.map(item => ({ ...item, is_active: 0 }));
      setSelectedItems(updatedItems); // Update the selected items
      await fetchEmailAccounts(); // Refetch email accounts
    } catch (error) {
      toast.error("Error deactivating mails:", error);
    }
  };

  const makePrimaryEmail = async () => {
    if (selectedItems.length !== 1) return;
    const email = selectedItems[0].id;

    try {
      await axiosInstance.post("/email/set-primary", {
        viewer_id: email.user,
        user_email_account_id: email,
      });
      const updatedItems = selectedItems.map(item => ({ ...item, primary: 1 }));
      setSelectedItems(updatedItems); // Update the selected items
      await fetchEmailAccounts(); // Refetch email accounts
      toast.success("Primary email updated successfully!");
    } catch (error) {
      toast.error("Error setting primary email:", error);
    }
  };

  return (
    <div className="container w-full flex gap-4 items-center justify-between mx-auto ">
      <div className="container relative flex justify-between">
        {selectedItems.length === 0 ? (
          <div className="">
            <GlobalAddButton
              onClick={() => {
                setAddMail(true);
              }}
            />
          </div>
        ) : (
          <div
            className={`flex flex-row   ${
              selectedItems.length > 0
                ? " dark:bg-gray-600 rounded-md w-full"
                : ""
            }`}
          >
            <div className="overflow-x-auto pl-2 h-full  rounded-md bg-white shadow-md  scroll-none items-center flex flex-row">
              {selectedItems.length >= 1 && areAllInactive && (
                <div className=" transition-all mb-0">
                  <button
                    className="text-secondary flex  flex-nowrap justify-center items-center text-[14px]  pt-1 pb-1 pl-4 pr-4 mt-1 mb-1 ml-1 rounded-md border-solid hover:bg-gray-200 dark:text-gray-200 dark:hover:bg-gray-700 dark:border-gray-500"
                    onClick={activateEmails}
                  >
                    <FontAwesomeIcon
                      icon={faPersonArrowUpFromLine}
                      className="mr-2"
                    />
                    Activate Mail
                  </button>
                </div>
              )}
              {/* Deactivate button */}
              {selectedItems.length >= 1 && areAllActive && (
                <div className="">
                  <button
                    className="text-secondary flex  flex-nowrap justify-center items-center text-[14px]  pt-1 pb-1 pl-4 pr-4 mt-1 mb-1 ml-1 rounded-md border-solid hover:bg-gray-200 dark:text-gray-200 dark:hover:bg-gray-700 dark:border-gray-500"
                    onClick={deactivateEmails}
                  >
                    <FontAwesomeIcon
                      icon={faPersonArrowDownToLine}
                      className="mr-2"
                    />
                    Deactivate Mail
                  </button>
                </div>
              )}
             {selectedItems.length === 1 && !selectedItems[0].primary && (
                <div>
                  <button
                    type="button"
                    className="text-secondary flex  flex-nowrap justify-center items-center text-[14px]  pt-1 pb-1 pl-4 pr-4 mt-1 mb-1 ml-1 rounded-md border-solid hover:bg-gray-200 dark:text-gray-200 dark:hover:bg-gray-700 dark:border-gray-500"
                    onClick={makePrimaryEmail}
                  >
                    <FontAwesomeIcon icon={faCircleUp} className="mr-2" />
                    Make Primary
                  </button>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default CrudMail;
