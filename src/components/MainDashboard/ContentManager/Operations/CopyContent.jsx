import React, { useState, memo } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faCopy } from "@fortawesome/free-solid-svg-icons";
import CopyDialog from "./CopyDialog";
import { GlobalContext } from "../../../../context/GlobalState";
import { useDispatch } from "react-redux";
import toast from "react-hot-toast";
import {
  fetchContentsAsync,
  fetchModalContentsAsync,
  UpdateBreadCrumbs,
  UpdateModalBreadcrumbs,
} from "../../../../features/content/contentSlice";
import { useSelector } from "react-redux";
import { useContext } from "react";
import { useCookies } from "react-cookie";

const CopyContent = ({ selectedItems }) => {
  console.log("selectedItems", selectedItems);
  const dispatch = useDispatch();
  const [cookies] = useCookies(["userData"]);
  const organisation_id = cookies.userData?.organisation?.id;
  const [isCopyButtonClicked, setIsCopyButtonClicked] = useState(false);
  const breadcrumbs = useSelector((state) => state.contents.breadcrumbs);
  const currentFolderId = useSelector((state) => state.contents.folder_id); // Get the current folder ID from Redux
  // console.log(currentFolderId);
  const { viewer_id, baseURL } = useContext(GlobalContext);
  const handleUpdateBreadcrumbs = () => {
    dispatch(UpdateModalBreadcrumbs(breadcrumbs));
  };

  const demo = selectedItems?.every((item) => item.demo === 1);

  const handleDemoUser = () => {
    console.log("demo", demo);
    if (demo == true) {
      toast.warning("Demo content can't be editable");
    }
  };

  return (
    <>
      <button
        type="button"
        className=" text-secondary text-[14px] my-0.5 pt-1 pb-1 pl-4 pr-4 mr-2 rounded-md ml-0.1 border-solid hover:bg-gray-200  dark:text-gray-200 dark:hover:bg-gray-700 dark:border-gray-500 "
        onClick={() => {
          handleDemoUser();
          setIsCopyButtonClicked(true);
          handleUpdateBreadcrumbs();
          dispatch(
            fetchModalContentsAsync({
              viewer_id,
              folder_id: currentFolderId,
              baseURL: baseURL,
              organisation_id,
            })
          );
        }}
      >
        <FontAwesomeIcon icon={faCopy} className="mr-2" />
        Copy
      </button>
      {isCopyButtonClicked && demo == false && (
        <CopyDialog
          setIsCopyButtonClicked={setIsCopyButtonClicked}
        ></CopyDialog>
      )}
    </>
  );
};

export default memo(CopyContent);
