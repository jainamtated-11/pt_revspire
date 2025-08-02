import React from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faPlus } from "@fortawesome/free-solid-svg-icons";

const AddNamespace = ({ onClick }) => {
  return (
    <button
      type="button"
      className="bg-gradient-to-r  from-cyan-600 to-cyan-800 mt-2 ml-2 items-center text-white px-3 py-1.5 rounded-2xl shadow-md  hover:bg-sky-800 hover:text-white transition duration-300 ease-in-out"
      onClick={onClick}
    >
      <FontAwesomeIcon icon={faPlus} className="mr-1 text-[12px] mb-[0.9px]" />
      Add
    </button>
  );
};

export default AddNamespace;
