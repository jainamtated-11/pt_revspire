import React, { useContext, useEffect, useState } from "react";
import ContentTils from "./ContentTils.jsx";
import { GlobalContext } from "../../../../context/GlobalState.jsx";
import ContentTable from "./ContentTable.jsx";
import { CRUD } from "../Operations/CRUD.jsx";
import Breadcrumbs from "../../../../utility/Breadcrumbs.jsx";
import DriveSelection from "../Operations/DriveSelection.jsx";
import { useSelector, useDispatch } from "react-redux";
import {
  fetchContentsAsync,
  navigateToFolder,
  UnSelectAllItems,
  UnSelectItem,
  UpdateBreadCrumbs,
} from "../../../../features/content/contentSlice.js";
import ContentTable1 from "./ContentTable.jsx";
import { useCanva } from "../../../../hooks/useCanva.jsx";
import ContentPlaceHolderModal from "../Operations/ContentPlaceHolderModal.jsx";
import { useCookies } from "react-cookie";

const ContentDashboard = () => {
  const [tils, setTils] = useState(false);
  const [cookies] = useCookies(["userData"]); // Access cookies

  const { driveSelection, viewer_id, baseURL } = useContext(GlobalContext);

  const dispatch = useDispatch();
  const breadcrumbs = useSelector((state) => state.contents.breadcrumbs);
  const { handleViewAllDesigns } = useCanva({});
  const selectedItems = useSelector((state) => state.contents.selectedItems);

  const [contentPlaceHolders, setContentPlaceHolders] = useState([]);
  const [contentPlaceHolderModal, setContentPlaceHolderModal] = useState(false);

  const UpDateBreadCrumbs = (breadcrumbs) => {
    dispatch(UpdateBreadCrumbs(breadcrumbs));
    dispatch(UnSelectAllItems());

    dispatch(
      fetchContentsAsync({
        viewer_id,
        folder_id: breadcrumbs[breadcrumbs.length - 1].id,
        baseURL: baseURL,
        organisation_id: cookies.userData?.organisation?.id,
      })
    );
  };

  useEffect(() => {
    const fetchValue = () => {
      const storedTils = localStorage.getItem("myTils");
      setTils(storedTils === "true");
    };

    fetchValue();

    window.addEventListener("storageUpdated", fetchValue);

    window.addEventListener("storage", fetchValue);

    return () => {
      window.removeEventListener("storageUpdated", fetchValue);
      window.removeEventListener("storage", fetchValue);
    };
  }, []);

  return (
    <>
      <div>
        <div className="">
          <CRUD />
        </div>

        <DriveSelection
          setContentPlaceHolders={setContentPlaceHolders}
          setContentPlaceHolderModal={setContentPlaceHolderModal}
          driveSelection={driveSelection}
        />
      </div>
      <div>
        {true && (
          <ContentPlaceHolderModal
            isOpen={contentPlaceHolderModal}
            onClose={() => setContentPlaceHolderModal(false)}
            contentPlaceHolders={contentPlaceHolders}
          />
        )}
      </div>
      <div className="container mx-auto px-4 py-2 ml-auto">
        <div>
          <Breadcrumbs
            viewer_id={viewer_id}
            breadcrumbs={breadcrumbs}
            onBreadcrumbClick={navigateToFolder}
            setBreadcrumbs={UpDateBreadCrumbs}
          />
        </div>
        <div>
          <div>
            {/* <ContentTable /> */}

            {tils ? (
              <ContentTils viewer_id={viewer_id} minCellWidth={120} />
            ) : (
              <ContentTable
                viewer_id={viewer_id}
                minCellWidth={120}
                setContentPlaceHolders={setContentPlaceHolders}
                setContentPlaceHolderModal={setContentPlaceHolderModal}
              ></ContentTable>
            )}
          </div>
        </div>
      </div>
    </>
  );
};

export default ContentDashboard;
