import React, { useContext } from "react";
import { GlobalContext } from "../../../context/GlobalState.jsx";

const AddTagToContent = () => {
  const {
    searchTag,
    setSearchTag,
    activeTags,
    selectedActiveTags,
    setSelectedActiveTags,
    AddTagToButtonPopUpHandler,
    setAddTagToContent,
  } = useContext(GlobalContext);

  return (
    <div className=" overflow-y-auto fixed top-40 left-1/4 w-2/4 h-3/4 border-2 rounded-lg border-slate-700 bg-stone-50">
      <h1 className=" my-3 text-center font-bold	">Add Tag</h1>
      <div className="flex items-center justify-center">
        <input
          value={searchTag}
          className="w-1/2  pl-2"
          type="text"
          placeholder="Enter the tag or condition"
          onChange={(e) => {
            setSearchTag(e.target.value)
          }}
        />
        <button className="border-2">Search</button>
      </div>
      <table className="w-full text-left rounded-lg shadow-lg my-4 overflow-y-auto ">
        {/* table head */}
        <thead className="text-xs text-sky-800 uppercase bg-white shadow-lg">
          <tr>
            <td  className="px-4">
              <div className="flex items-center">
                <input
                  id="checkbox-all-search"
                  type="checkbox"
                  className="h-4 bg-gray-100 border-gray-300 rounded"
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
                <span>Description</span>
              </div>
            </td>
          </tr>
        </thead>
        <tbody className="h-96 overflow-y-auto">
          {activeTags.length > 0 &&
            activeTags.map(
              (tag, index) =>
                tag.active != 0 && (
                  <tr className=" bg-white divide-y" key={index}>
                    <td className="w-4 p-4 cursor-pointer">
                      <div className="flex items-center">
                        <input
                          id={`checkbox-table-${index}`}
                          type="checkbox"
                          className="h-4 bg-gray-100 border-gray-300"
                          checked={selectedActiveTags.some(
                            (selectedItem) => selectedItem.id === tag.id
                          )}
                          onChange={() => {
                            const idx = selectedActiveTags.findIndex(
                              (selectedItem) => selectedItem.id === tag.id
                            );

                            if (idx === -1) {
                              setSelectedActiveTags((prevSelectedItems) => [
                                ...prevSelectedItems,
                                tag,
                              ]);
                            } else {
                              setSelectedActiveTags((prevSelectedItems) =>
                                prevSelectedItems.filter(
                                  (selectedItem) => selectedItem.id !== tag.id
                                )
                              );
                            }
                          }}
                        />
                        <label
                          htmlFor={`checkbox-table-${tag.id}`}
                          className="sr-only"
                        >
                          checkbox
                        </label>
                      </div>
                    </td>
                    <td className="px-6 py-4 w-96">{tag.name}</td>
                    <td className="px-6 py-4 w-96">{tag.description}</td>
                  </tr>
                )
            )}
        </tbody>
      </table>
      <div className="flex justify-between ">
        <button
          onClick={() => {
            setAddTagToContent(false);
          }}
          className=" border-2 px-4 py-3 rounded-xl ml-40"
        >
          Cancel
        </button>
        <button
          onClick={() => {
            AddTagToButtonPopUpHandler();
            setAddTagToContent(false);
          }}
          className=" border-2 px-4 py-3 bg-white rounded-xl ml-12 mr-40"
        >
          Add
        </button>
      </div>
    </div>
  );
};

export default AddTagToContent;
