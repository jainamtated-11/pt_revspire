import React, { useContext } from "react";
import { GlobalContext } from "../../../context/GlobalState";
import VersionModal from "./Operations/VersionModal";
import { useDispatch } from "react-redux";
import { UnSelectAllItems } from "../../../features/content/contentSlice";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faCodeBranch } from "@fortawesome/free-solid-svg-icons";
import toast from "react-hot-toast";

const VersionButton = ({ selectedItems }) => {
  const { versionModalOpen, setVersionModalOpen } = useContext(GlobalContext);
  const dispatch = useDispatch();

  const handleVersionClick = () => {
    setVersionModalOpen(true);
  };

  const handleModalClose = () => {
    dispatch(UnSelectAllItems([]));
    setVersionModalOpen(false);
  };

  console.log("selected items in version button", selectedItems);
  const demo = selectedItems && selectedItems[0]?.demo === 1;
  console.log("Demo Status is herere", demo);

  const handleDemoUser = () => {
    if (demo) {
      console.log("inside the toast warning ");
      toast.warning("Demo content can't be editable");
    }
  };

  return (
    <>
      <button
        type="button"
        className="flex items-center min-w-[135px] justify-center text-secondary text-[14px] py-0 px-2 my-2 rounded-md border-solid hover:bg-gray-200 dark:text-gray-200 dark:hover:bg-gray-700 dark:border-gray-500"
        onClick={() => {
          handleVersionClick();
          handleDemoUser();
        }}
      >
        <FontAwesomeIcon icon={faCodeBranch} className="mr-2" />
        Show Versions
      </button>
      {versionModalOpen && demo == false && (
        <VersionModal onClose={handleModalClose} />
      )}
    </>
  );
};

export default VersionButton;
