import React from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faTimes } from "@fortawesome/free-solid-svg-icons";

const FilterModal = ({ onClickHandle }) => {
  return (
    <button
      onClick={onClickHandle}
      className=" h-[38px] border border-red-200 hover:bg-red-200 active:bg-neutral-200    text-neutral-800 px-3 py-1.5 rounded-lg dark:bg-gray-700 dark:text-gray-200 dark:hover:bg-gray-600 transition  bg-red-100 bg-opacity-70 duration-300 ease-in-out flex items-center gap-2 active:scale-90"
    >
      <FontAwesomeIcon icon={faTimes} className=" text-xl" />
    </button>
  );
};

export default FilterModal;
