import React, { useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faShare } from "@fortawesome/free-solid-svg-icons";
import MoveDialog from "./MoveDialog";
import { useDispatch, useSelector } from "react-redux";
import {
  fetchModalContentsAsync,
  UpdateModalBreadcrumbs,
} from "../../../../features/content/contentSlice";
import { useContext } from "react";
import toast from "react-hot-toast";
import { GlobalContext } from "../../../../context/GlobalState";
import { useCookies } from "react-cookie";

const MoveContent = ({ viewer_id, selectedItems }) => {
  const [isMoveButtonClicked, setIsMoveButtonClicked] = useState(false);
  const { baseURL } = useContext(GlobalContext);

  const [cookies] = useCookies(["userData"]);
  const organisation_id = cookies.userData?.organisation?.id;

  const dispatch = useDispatch();
  const breadcrumbs = useSelector((state) => state.contents.breadcrumbs);
  const currentFolder =
    breadcrumbs.length > 0 ? breadcrumbs[breadcrumbs.length - 1] : null;
  const currentFolderId = currentFolder.id;
  // console.log("current folder id ",currentFolderId);

  const handleUpdateBreadcrumbs = () => {
    dispatch(UpdateModalBreadcrumbs(breadcrumbs));
  };
  // const demo = selectedItems?.every(item => item.demo === 1);
  const demo = selectedItems && selectedItems[0]?.demo === 1;

  const handleDemoUser = () => {
    if (demo) {
      console.log("inside the toast warning ");
      toast.warning("Demo content can't be editable");
    }
  };

  // const handleDemoUser = () => {
  //   console.log("demo", demo);
  //   if (demo == true) {
  //     toast.warning("Demo content can't be editable");
  //   }
  // };

  // console.log("selectedItems     ", selectedItems);
  return (
    <>
      <button
        type="button"
        className="flex items-center text-secondary text-[14px] py-1 px-2 my-1 rounded-md border-solid hover:bg-gray-200 dark:text-gray-200 dark:hover:bg-gray-700 dark:border-gray-500"
        onClick={() => {
          handleDemoUser();
          setIsMoveButtonClicked(true);
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
        <FontAwesomeIcon icon={faShare} className="mr-2" />
        Move
      </button>
      {isMoveButtonClicked && demo === false && (
        <MoveDialog setIsMoveButtonClicked={setIsMoveButtonClicked} />
      )}
    </>
  );
};

export default MoveContent;
