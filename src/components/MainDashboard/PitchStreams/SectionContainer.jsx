import React from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faXmark, faCheck } from "@fortawesome/free-solid-svg-icons";

const SectionContainer = ({
  id,
  selectedContent,
  setSelectedContent,
  sectionData,
  setSectionData,
  setAddSection,
  sections,
  setSections,
  modalTwoError,
  setModalTwoError,
}) => {
  return (
    <div
      className={` border-2 ${
        modalTwoError ? "border-red-300" : "border-neutral-300"
      } mt-1 py-1 space-y-0.5 inline-block rounded-xl px-2 w-full`}
    >
      <div className="flex justify-start flex-nowrap items-center">
        <span className="mr-2 border-neutral-400 border size-[20px] flex justify-center items-center text-xs rounded-full bg-neutral-50 text-neutral-700 font-bold">
          {id}
        </span>
        <label className="w-20 inline-block text-sm font-medium text-gray-900 dark:text-white">
          Name :
        </label>
        <div className="truncate w-80 py-0.5 ml-2 text-normal-500 px-2 outline-none bg-neutral-100 border border-neutral-300 hover:border-blue-400 hover:bg-neutral-100 transition-all rounded-md placeholder:text-neutral-400 text-neutral-800 focus:border-blue-500">
          {selectedContent.name}
        </div>
      </div>

      <div className="ml-7 flex flex-nowrap justify-start items-center">
        <label className="w-20 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white">
          Tagline :
        </label>
        <div className="truncate w-80 ml-2 text-normal-500 outline-none rounded-md">
          <input
            className="truncate w-full py-0.5 text-normal-500 px-2 outline-none bg-neutral-100 border border-neutral-300 hover:border-blue-400 hover:bg-neutral-100 transition-all rounded-md placeholder:text-neutral-400 text-neutral-800 focus:border-blue-500"
            value={selectedContent.tagline}
            onChange={(e) => {
              setModalTwoError(false);
              setSelectedContent((prevState) => ({
                ...prevState,
                tagline: e.target.value,
              }));
            }}
            type="text"
            placeholder="Enter the tagline Name...."
            required
          />
        </div>
        <div className="flex justify-end items-center ml-auto gap-1">
          <button
            type="button"
            className="text-cyan-600 bg-transparent hover:bg-cyan-600 hover:text-white rounded-lg text-sm w-8 h-8 inline-flex justify-center items-center dark:hover:bg-gray-600 dark:hover:text-white"
            onClick={() => {
              setModalTwoError(false);
              setAddSection((prevState) => ({
                ...prevState,
                addSection: false,
                modalTwo: false,
              }));
              const updatedSections = sections.map((section) =>
                section.name === sectionData.name
                  ? {
                      ...section,
                      contents: [...sectionData.contents, selectedContent],
                    }
                  : section
              );

              setSections(updatedSections);

              setSelectedContent({
                content: "",
                name: "",
                tagline: "",
                sectionName: "",
              });
              setSectionData({
                name: "",
                contents: [],
              });
            }}
          >
            <FontAwesomeIcon
              className={` text-xl ${modalTwoError && "drop-shadow-2xl"}`}
              style={{
                textShadow: modalTwoError ? "red 1px 0 10px" : "none",
              }}
              icon={faCheck}
            />
          </button>
          <button
            type="button"
            className="end-2.5 text-red-500 mx-0 bg-transparent hover:bg-red-500 hover:text-white rounded-lg text-sm w-8 h-8  inline-flex justify-center items-center dark:hover:bg-gray-600 dark:hover:text-white"
            onClick={() => {
              setModalTwoError(false);
              setSelectedContent({
                content: "",
                name: "",
                tagline: "",
                sectionName: "",
              });
              setSectionData({
                name: "",
                contents: [],
              });
              setAddSection((prevState) => ({
                ...prevState,
                addSection: false,
                modalTwo: false,
              }));
            }}
          >
            <FontAwesomeIcon className=" text-xl" icon={faXmark} />
          </button>
        </div>
      </div>
    </div>
  );
};

export default SectionContainer;
