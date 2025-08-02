import React, { useContext, useState, useEffect } from "react";
import { GlobalContext } from "../../../../context/GlobalState.jsx";
import Breadcrumbs from "../../../../utility/Breadcrumbs.jsx";
import LoadingSpinner from "../../../../utility/LoadingSpinner.jsx";
import useContentAndFoldersSorted from "../../../../hooks/useFetchContentAndFolders.jsx";
import CRUDButton from "../../../../utility/CustomComponents/CRUDButton.jsx";

const AddContentToTag = () => {
  const {
    searchContent,
    setSearchContent,
    AddContentToPopUpHandler,
    selectedPopUpContent,
    setSelectedPopUpContent,
    setBreadcrumbs,
    navigateToFolder,
    breadcrumbs,
    folder_id,
    viewer_id,
  } = useContext(GlobalContext);

  const [isLoading, setIsLoading] = useState(true);
  const [popUpContent, setPopUpContent] = useState([]);

  const queryInfo = useContentAndFoldersSorted({ viewer_id, folder_id });

  useEffect(() => {
    if (queryInfo.isSuccess) {
      setPopUpContent(queryInfo.data.items);
      setIsLoading(false);
    }
  }, [queryInfo.isSuccess, queryInfo.data]);

  return (
    <div className="fixed top-40 left-1/4 w-2/4 h-2/3 border-2 rounded-lg  bg-stone-50">
      <h1 className=" pl-8 my-3  font-bold sticky top-3	z-0">Select Content</h1>
      <div className="">
        <Breadcrumbs
          onBreadcrumbClick={navigateToFolder}
          breadcrumbs={breadcrumbs}
          setBreadcrumbs={setBreadcrumbs}
        />
      </div>
      <div className="flex items-center justify-center">
        <input
          value={searchContent}
          className="w-1/2 mt-4 pl-2 my-2"
          type="text"
          placeholder="Enter the tag or condition"
          onChange={(e) => {
            setSearchContent(e.target.value);
          }}
        />
      </div>
      {isLoading ? (
        <LoadingSpinner />
      ) : (
        <div className="overflow-hidden">
          <div className="max-h-60 overflow-y-auto">
            <table className="w-full text-left rounded-lg shadow-lg my-4 overflow-y-auto ">
              {/* table head */}
              <thead className="text-xs text-sky-800 uppercase bg-white shadow-lg">
                <tr>
                  <td  className="px-4">
                    <div className="flex items-center">
                      <input
                        id="checkbox-all-search"
                        type="checkbox"
                        className="h-4 bg-gray-100 border-gray-300 rounded "
                      />
                      <label htmlFor="checkbox-all-search" className="sr-only">
                        checkbox
                      </label>
                    </div>
                  </td>
                  <td  className="px-6 py-3 w-96">
                    <div className="flex items-center">
                      <span>Name</span>
                    </div>
                  </td>
                  <td  className="px-6 py-3 w-96">
                    <div className="flex items-center">
                      <span>Condtion</span>
                    </div>
                  </td>
                </tr>
              </thead>
              <tbody className="h-100 overflow-y-auto">
                {popUpContent.length > 0 &&
                  popUpContent.map(
                    (item, index) =>
                      item.length != 0 && (
                        <tr className=" bg-white divide-y" key={index}>
                          <td className="w-4 p-4 cursor-pointer">
                            <div className="flex items-center">
                              <input
                                id={`checkbox-table-${index}`}
                                type="checkbox"
                                className="h-4 bg-gray-100 border-gray-300"
                                checked={selectedPopUpContent.some(
                                  (selectedItem) => selectedItem.id === item.id
                                )}
                                onChange={() => {
                                  const idx = selectedPopUpContent.findIndex(
                                    (selectedItem) =>
                                      selectedItem.id === item.id
                                  );

                                  if (idx === -1) {
                                    setSelectedPopUpContent(
                                      (prevSelectedItems) => [
                                        ...prevSelectedItems,
                                        item,
                                      ]
                                    );
                                  } else {
                                    setSelectedPopUpContent(
                                      (prevSelectedItems) =>
                                        prevSelectedItems.filter(
                                          (selectedItem) =>
                                            selectedItem.id === item.id
                                        )
                                    );
                                  }
                                }}
                              />
                              <label
                                htmlFor={`checkbox-table-${item.id}`}
                                className="sr-only"
                              >
                                checkbox
                              </label>
                            </div>
                          </td>
                          <td className="px-6 py-4 w-96">
                            <button
                              onClick={() => {
                                navigateToFolder(item.id, item.name);
                              }}
                            >
                              {item.name}
                            </button>
                          </td>
                          <td className="px-6 py-4 w-96">
                            {item.parent_folder_name}
                          </td>
                        </tr>
                      )
                  )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      <div>
        <div className="flex justify-between  border-2 py-2 mt-6">
          {/* <button
            onClick={() => {
              setAddContentToTag(false);
            }}
            className=" border-2 px-4 py-3 rounded-xl ml-36"
          >
            Cancel
          </button> */}
          <CRUDButton
            label="cancel"
            onClickHandle={setAddContentToTag(false)}
            btn="mr-2"
            className=" border-2 px-4 py-3 rounded-xl ml-36"
          />
          {/* <button
            onClick={() => {
              AddContentToPopUpHandler();
              setAddContentToTag(false);
            }}
            className=" border-2 px-4 py-3 rounded-xl ml-12 mr-40"
          >
            Add
          </button> */}
          <CRUDButton
            label="Add"
            onClickHandle={() => {
              AddContentToPopUpHandler();
              setAddContentToTag(false);
            }}
            css="border-2 px-4 py-3 rounded-xl ml-12 mr-40 "
            btn="mr-2"
          />
        </div>
      </div>
    </div>
  );
};

export default AddContentToTag;
